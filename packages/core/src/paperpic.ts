import type { Gestures } from './input/gestures'
import type { KeyCommand } from './input/keyboard'
import type { OptionName, PaperPicOptions, ResolvedOptions } from './options'
import type { PaperPicDownload } from './pipeline/download'
import type { ExportedImage } from './pipeline/export'
import type { LoadedImage, PaperPicSource } from './pipeline/load-image'
import type { Operation } from './pipeline/operations'
import type { Preview } from './pipeline/preview'
import type { ToneStep } from './pipeline/steps'
import type { Size } from './processing/types'
import type { Scene } from './render/renderer'
import type { History } from './state/history'
import type { Fit, Rotation, View, ViewPoint } from './state/view'
import type { PanelDraft, Tool, ToolContext, ToolHost, ToolId, ToolSession } from './tools/types'
import type { PaperPicLabels } from './ui/labels'
import { attachGestures } from './input/gestures'
import { keyToCommand } from './input/keyboard'
import { DEFAULT_OPTIONS, mergeOptions, OPTION_NAMES, sameOption, validateOptions } from './options'
import { downloadName, saveFile } from './pipeline/download'
import { exportImage } from './pipeline/export'
import { loadImage } from './pipeline/load-image'
import { adjustSetting, thresholdSetting, toneStep, toPipelineSteps, toPreviewSteps, trailingRotation } from './pipeline/operations'
import { photoFrame } from './pipeline/photo-frame'
import { renderPreview } from './pipeline/preview'
import { PreviewQueue } from './pipeline/preview-queue'
import { PipelineRunner } from './pipeline/runner'
import { paintMagnifier } from './render/magnifier'
import { Renderer } from './render/renderer'
import { addToHistory, createHistory, redoHistory, undoHistory } from './state/history'
import { createView, displayedSize, fitView, frameToViewport, overflows, panBy, resizeView, rotateView, setRotation, viewportToFrame, zoomLimits, zoomTo } from './state/view'
import { TOOLS } from './tools'
import { adjustEdit, canAdjust } from './tools/adjust'
import { confirmThreshold, openThreshold, thresholdEdit, thresholdOperation } from './tools/threshold'
import { EditBar } from './ui/edit-bar'
import { DEFAULT_ICONS } from './ui/icons'
import { DEFAULT_LABELS } from './ui/labels'
import { warnWithoutStyles } from './ui/styles-check'
import { Toolbar } from './ui/toolbar'

const ZOOM_STEP = 1.25
const ZOOM_TOLERANCE = 0.001
const TOOLBAR_GAP = 16
const NO_PREVIEW = JSON.stringify({ steps: [], tone: null })
/** How close to the edge of the viewer a point can be and still count as on screen. */
const REVEAL_MARGIN = 24

/** The `Error` that the `error` event carries, also when something threw another value, such as a string. */
function asError(cause: unknown): Error {
  return cause instanceof Error
    ? cause
    : new Error(String(cause), { cause })
}

/**
 * What the viewer is showing, which `getState()` returns and the `change` event carries.
 *
 * @see https://paperpic.dev/reference/state
 */
export interface PaperPicState {
  /** The open tool, such as Crop or Adjust, or `null`. Done or Cancel closes it. */
  activeTool: ToolId | null
  /**
   * The brightness and contrast, each from -1 to 1, where 0 leaves the image as it is. Cleaning up the document leaves them out.
   * While Adjust is open, the values it shows, which Done would keep.
   */
  adjustments: { brightness: number, contrast: number }
  /** Whether the changes are being applied. */
  busy: boolean
  /** Whether there are changes to apply. Rotations and flips that cancel out are no change. */
  canApply: boolean
  /** Whether there is an edit to bring back. */
  canRedo: boolean
  /** Whether there is an edit to undo. */
  canUndo: boolean
  /** The fit in effect, or `null` once the user has zoomed by hand. */
  fit: Fit | null
  /**
   * The size of the image in pixels, at full resolution and with the edits so far, but without the turn of `rotation`,
   * or `null` if there is none.
   */
  image: Size | null
  /** Whether the user is viewing or editing the image. */
  mode: 'view' | 'edit'
  /** How far the image on display is turned from `image`, in degrees clockwise. */
  rotation: Rotation
  /** Whether there is an image, and whether it loaded. */
  status: 'empty' | 'loading' | 'ready' | 'error'
  /** Whether the document gets cleaned up, and how much. While Clean up is open, what it shows, which Done would keep. */
  threshold: { enabled: boolean, sensitivity: number }
  /** Screen pixels per image pixel. */
  zoom: number
}

/**
 * Each event of `on()`, with what it carries.
 *
 * @see https://paperpic.dev/reference/events
 */
export interface PaperPicEvents {
  /** Apply finished, from the button, `Enter` or `apply()`. The result is already on display. */
  apply: ExportedImage
  /**
   * The user or a method changed the state, such as the zoom or the edit. A loaded image comes with `load`, and a failed
   * Apply with `error`, instead. A pan, `setOptions()` and the props of the components never trigger it.
   */
  change: PaperPicState
  /** The image is about to be saved. Call `preventDefault()` to save it another way. */
  download: PaperPicDownload
  /**
   * Something failed. `phase` says what: `'load'` for the image, `'preview'` for the pixels of an edit on display,
   * which leaves the edit open, and `'apply'` for the changes.
   */
  error: { error: Error, phase: 'load' | 'preview' | 'apply' }
  /** The image of `src` is ready, also after `reload()`. Apply does not trigger it. */
  load: Size
}

type Listener<Name extends keyof PaperPicEvents> = (payload: PaperPicEvents[Name]) => void
type Listeners = { [Name in keyof PaperPicEvents]: Set<Listener<Name>> }
/**
 * A document image viewer and editor. It fills its container, which needs a height. Import the stylesheet once, from
 * `@paperpic/core/style.css`.
 *
 * @example
 * import { PaperPic } from '@paperpic/core'
 * import '@paperpic/core/style.css'
 *
 * const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: 'A receipt' })
 * pic.on('apply', ({ blob }) => upload(blob))
 */
export class PaperPic {
  private readonly root: HTMLElement
  private readonly viewportElement: HTMLElement
  private readonly canvas: HTMLCanvasElement
  private readonly handles: HTMLElement
  /** The message on screen while the image loads or the changes apply, and on failure. Screen readers hear it too. */
  private readonly status: HTMLElement
  /** What screen readers hear about the other changes, such as the zoom. It never shows, so it never hides the message. */
  private readonly announcer: HTMLElement
  private readonly toolbar: Toolbar
  private readonly editBar: EditBar
  private readonly renderer: Renderer
  private readonly gestures: Gestures
  private readonly runner = new PipelineRunner()
  private readonly listeners: Listeners = {
    apply: new Set(),
    change: new Set(),
    download: new Set(),
    error: new Set(),
    load: new Set(),
  }

  private readonly cleanups: (() => void)[] = []

  private options: ResolvedOptions = { ...DEFAULT_OPTIONS }
  private labels: PaperPicLabels = DEFAULT_LABELS
  private source: PaperPicSource | undefined
  private image: LoadedImage | null = null
  /** What a download saves: the source, or the result of the last Apply. */
  private saved: { source: PaperPicSource, url: string | null } | null = null
  /** What the edits look like, while they need other pixels than the image. */
  private preview: Preview | null = null
  private previewKey = NO_PREVIEW
  private readonly previewQueue = new PreviewQueue({
    render: (steps, tone) => renderPreview(this.image!, steps, tone, this.runner),
    ready: preview => this.showPreview(preview),
    failed: cause => this.previewFailed(cause),
    tint: (tone) => {
      if (this.preview?.tint) {
        this.preview.tint(tone)
        this.renderer.requestPaint()
      }
    },
  })

  /** The open tool with a selection of its own, such as Crop. */
  private session: { handle: ToolSession, tool: Tool } | null = null
  /** The open Adjust or Clean up. */
  private draft: PanelDraft | null = null
  private loadStatus: PaperPicState['status'] = 'empty'
  private loadId = 0
  /** Changes when an edit ends without a trace, so an Apply that finishes afterwards knows that its edit is gone. */
  private editId = 0
  private view: View = createView()
  private viewport: Size = { width: 0, height: 0 }
  private mode: PaperPicState['mode'] = 'view'
  private history: History<Operation> = createHistory()
  private busy = false
  /** What failed in the edit open, which the message on screen names until the next edit. */
  private failure: 'apply' | 'preview' | null = null
  private destroyed = false
  /**
   * Read once after each change of the interface, and kept during a pan, because reading it on every move would make
   * the browser lay out the page each time. `null` until the next read.
   */
  private toolbarWidth: number | null = null

  /**
   * @param container The element to fill. It needs a height, or the viewer stays at its minimum height.
   * @throws {TypeError} If `container` is not an element. Create the instance once the element exists, such as on mount.
   * @throws {RangeError} If an option is out of its range, such as a `softness` of 2.
   *
   * @example
   * const pic = new PaperPic(container, {
   *   src: file, // a URL from the same origin, or a File the user picked
   *   alt: 'An invoice',
   *   aspectRatio: 210 / 297,
   *   output: { type: 'image/jpeg', quality: 0.9 },
   * })
   */
  constructor(container: HTMLElement, options: PaperPicOptions = {}) {
    if (!(container instanceof HTMLElement)) {
      throw new TypeError('PaperPic needs an HTML element as its container. Create the instance once the element exists, such as on mount.')
    }
    // Before anything reaches the page, so a wrong option leaves nothing behind
    validateOptions(options)

    this.root = document.createElement('div')
    this.root.className = 'paperpic'

    const stage = document.createElement('div')
    stage.className = 'paperpic-stage'

    this.viewportElement = document.createElement('div')
    this.viewportElement.className = 'paperpic-viewport'
    this.viewportElement.tabIndex = 0
    this.viewportElement.setAttribute('role', 'group')

    this.canvas = document.createElement('canvas')
    this.canvas.className = 'paperpic-canvas'
    const overlay = document.createElement('canvas')
    overlay.className = 'paperpic-overlay'
    overlay.setAttribute('aria-hidden', 'true')
    this.handles = document.createElement('div')
    this.handles.className = 'paperpic-handles'
    this.viewportElement.append(this.canvas, overlay, this.handles)

    this.status = document.createElement('div')
    this.status.className = 'paperpic-status'
    this.status.setAttribute('role', 'status')
    this.announcer = document.createElement('div')
    this.announcer.className = 'paperpic-announcement'
    this.announcer.setAttribute('role', 'status')

    this.toolbar = new Toolbar(
      {
        edit: () => this.edit(),
        zoomIn: () => this.stepZoom(ZOOM_STEP),
        zoomOut: () => this.stepZoom(1 / ZOOM_STEP),
        fit: fit => this.fit(fit),
        rotate: direction => this.rotate(direction),
        download: () => this.download(),
      },
      this.labels,
    )

    const toolContext: ToolContext = {
      addOperation: operation => this.addOperation(operation),
      openTool: id => this.openTool(id),
    }
    this.editBar = new EditBar(
      {
        cancel: () => this.cancel(),
        undo: () => this.undo(),
        redo: () => this.redo(),
        apply: () => this.apply(),
        runTool: run => run(toolContext),
        confirmTool: () => this.confirmTool(),
        cancelTool: () => this.cancelTool(),
        zoomIn: () => this.stepZoom(ZOOM_STEP, true),
        zoomOut: () => this.stepZoom(1 / ZOOM_STEP, true),
        setThreshold: (setting, released) => {
          this.setThreshold(setting)
          if (released && setting.sensitivity !== undefined) {
            this.announce(this.labels.thresholdLevel(Math.round(setting.sensitivity * 100)))
          }
        },
        setAdjustment: (name, value, released) => {
          this.setAdjustments({ [name]: value })
          if (released) {
            this.announce(this.labels.adjustmentLevel(this.labels[name], Math.round(value * 100)))
          }
        },
      },
      TOOLS,
      this.labels,
    )

    stage.append(this.viewportElement, this.toolbar.element, this.status, this.announcer)
    this.root.append(stage, this.editBar.element)
    container.append(this.root)

    this.renderer = new Renderer(this.canvas, overlay, () => this.scene())

    this.gestures = attachGestures(this.viewportElement, {
      onPan: (deltaX, deltaY) => this.pan(deltaX, deltaY),
      onZoom: (factor, point) => this.zoomAround(this.view.zoom * factor, point),
      onTap: point => this.session?.handle.tap?.(point) ?? false,
      onDoubleTap: point => this.toggleZoom(point),
    })
    this.cleanups.push(this.gestures.detach)

    const onKeyDown = (event: KeyboardEvent) => {
      const command = keyToCommand(event)
      if (command && this.runKey(command, event.target)) {
        event.preventDefault()
      }
    }
    this.root.addEventListener('keydown', onKeyDown)
    this.cleanups.push(() => this.root.removeEventListener('keydown', onKeyDown))

    // The menu of the browser would save the canvas, which holds the view on screen instead of the image
    const onContextMenu = (event: Event) => event.preventDefault()
    this.viewportElement.addEventListener('contextmenu', onContextMenu)
    this.cleanups.push(() => this.viewportElement.removeEventListener('contextmenu', onContextMenu))

    // The first resize comes once the browser has laid the viewer out, so the stylesheet has had its chance to apply
    let stylesChecked = false
    const observer = new ResizeObserver(() => {
      if (!stylesChecked) {
        stylesChecked = true
        warnWithoutStyles(this.root)
      }
      this.measure()
    })
    observer.observe(this.viewportElement)
    this.cleanups.push(() => observer.disconnect())

    // A screen of another density changes no size, so the observer misses it when the window moves there. A query only
    // matches the density it names, so each change asks again with the new one
    if (typeof matchMedia === 'function') {
      const densityWatch = new AbortController()
      const watchDensity = (): void => {
        matchMedia(`(resolution: ${globalThis.devicePixelRatio || 1}dppx)`).addEventListener('change', () => {
          this.measure()
          watchDensity()
        }, { once: true, signal: densityWatch.signal })
      }
      watchDensity()
      this.cleanups.push(() => densityWatch.abort())
    }

    this.changeOptions(options, true)
    this.measure()
  }

  /**
   * Changes only the options you pass, and `undefined` brings one back to its default. It does not emit `change`, so
   * two-way bindings do not loop.
   *
   * @throws {RangeError} If an option is out of its range, such as a `softness` of 2. No option changes then.
   *
   * @example
   * pic.setOptions({ editable: false })
   */
  setOptions(options: PaperPicOptions): void {
    this.changeOptions(options, false)
  }

  /**
   * Applies the options that changed. Options with the same values change nothing, so a wrapper can pass them all on
   * every render, and a message on screen stays. The constructor passes `initial` to set everything up.
   */
  private changeOptions(options: PaperPicOptions, initial: boolean): void {
    if (this.destroyed) {
      return
    }
    validateOptions(options)
    const previous = this.options
    const next = mergeOptions(previous, options)
    const changed = (name: OptionName) => initial || !sameOption(previous[name], next[name])
    const reload = 'src' in options && options.src !== this.source
    if (!reload && !OPTION_NAMES.some(changed)) {
      return
    }
    const wasEditable = previous.editable
    this.options = next

    if (changed('wheelZoom')) {
      this.gestures.setWheelZoom(next.wheelZoom)
    }
    if (changed('labels')) {
      this.labels = {
        ...DEFAULT_LABELS,
        ...next.labels,
      }
      this.toolbar.setLabels(this.labels)
      this.editBar.setLabels(this.labels)
      this.viewportElement.setAttribute('aria-label', this.labels.viewer)
    }
    if (changed('icons')) {
      // An icon that keeps its markup is not parsed again, so new icons with some of the same markup are cheap
      const icons = {
        ...DEFAULT_ICONS,
        ...next.icons,
      }
      this.toolbar.setIcons(icons)
      this.editBar.setIcons(icons)
    }
    if (changed('tools')) {
      this.editBar.setTools(next.tools)
    }
    if (changed('alt')) {
      this.describeImage(next.alt)
    }

    if (next.editable !== wasEditable) {
      this.leaveEdit()
      if (this.view.rotation !== 0) {
        this.resetRotation()
      }
    }

    if ('src' in options && options.src !== this.source) {
      this.load(options.src)
    }
    this.showStatus()
    this.refresh()
  }

  /** Returns what the viewer is showing. */
  getState(): PaperPicState {
    const shown = this.preview ?? this.image
    const draft = this.draft
    // An open Adjust or Clean up reports what it shows, which Done would keep
    const { enabled, sensitivity } = draft?.tool === 'threshold'
      ? draft.setting
      : thresholdSetting(this.history.done)
    const { brightness, contrast } = draft?.tool === 'adjust'
      ? draft.setting
      : adjustSetting(this.history.done)
    return {
      status: this.loadStatus,
      mode: this.mode,
      image: shown && { width: shown.width, height: shown.height },
      zoom: this.view.zoom,
      fit: this.view.fit,
      rotation: this.view.rotation,
      canUndo: this.history.done.length > 0,
      canRedo: this.history.undone.length > 0,
      canApply: toPipelineSteps(this.history.done).length > 0,
      busy: this.busy,
      activeTool: this.openToolId(),
      threshold: { enabled, sensitivity },
      adjustments: { brightness, contrast },
    }
  }

  /**
   * Listens to an event.
   *
   * @returns The function that stops listening.
   *
   * @example
   * const off = pic.on('apply', async ({ blob }) => {
   *   const body = new FormData()
   *   body.append('image', blob)
   *   await fetch('/api/documents', { method: 'POST', body })
   * })
   * off()
   */
  on<Name extends keyof PaperPicEvents>(name: Name, listener: Listener<Name>): () => void {
    this.listeners[name].add(listener)
    return () => this.listeners[name].delete(listener)
  }

  /** Zooms in one step, around the center of the viewer. */
  zoomIn(): void {
    this.stepZoom(ZOOM_STEP)
  }

  /** Zooms out one step, around the center of the viewer. */
  zoomOut(): void {
    this.stepZoom(1 / ZOOM_STEP)
  }

  /**
   * Sets the zoom, where 1 shows one image pixel per screen pixel. A value out of range is clamped.
   *
   * @param zoom Screen pixels per image pixel.
   * @param point The position to keep in place, relative to the viewer. By default, its center.
   * @throws {RangeError} If `zoom` is `NaN`, or if a coordinate of `point` is not a finite number. The view does not change then.
   */
  zoomTo(zoom: number, point?: ViewPoint): void {
    // A zoom out of range is clamped, but NaN has no place in the range, and the image would vanish until a fit
    if (Number.isNaN(zoom)) {
      throw new RangeError(`zoom must be a number of screen pixels per image pixel, such as 1 for 100%, got ${zoom}`)
    }
    if (point && !(Number.isFinite(point.x) && Number.isFinite(point.y))) {
      throw new RangeError(`point must have a finite x and y, in CSS pixels from the top left corner of the viewer, got ${point.x}, ${point.y}`)
    }
    this.zoomAround(zoom, point ?? { x: this.viewport.width / 2, y: this.viewport.height / 2 })
  }

  /** Fits the whole image, its width or its height to the viewer. */
  fit(fit: Fit): void {
    const image = this.measuredImage()
    if (image) {
      this.commit(fitView(this.view, fit, image, this.viewport))
    }
  }

  /**
   * Turns the image a quarter turn. While editing, it is an edit that `apply()` makes permanent.
   * In a read-only viewer, it only changes the display. Outside those two cases, it does nothing.
   *
   * @param direction 1 for clockwise, -1 for counterclockwise.
   */
  rotate(direction: 1 | -1 = 1): void {
    if (this.openToolId()) {
      return
    }
    if (this.mode === 'edit') {
      this.addOperation({ type: 'rotate', direction })
      return
    }
    const image = this.measuredImage()
    if (image && !this.options.editable) {
      this.commit(rotateView(this.view, direction, image, this.viewport))
    }
  }

  /**
   * Mirrors the image left to right, as it is on display. It is an edit that `apply()` makes permanent, and a vertical flip
   * is a flip and a half turn. It does nothing outside the edit mode, or while a tool is open.
   */
  flip(): void {
    this.addOperation({ type: 'flip' })
  }

  /** Starts editing. It does nothing if the image is not ready or cannot be edited. */
  edit(): void {
    if (this.mode === 'edit' || !this.options.editable || this.loadStatus !== 'ready') {
      return
    }
    const hadFocus = this.hasFocus()
    this.mode = 'edit'
    this.refresh()
    this.announce(this.labels.editing)
    if (hadFocus && this.options.toolbar) {
      this.editBar.focus()
    }
    this.emit('change', this.getState())
  }

  /** Undoes the last edit. */
  undo(): void {
    if (this.mode === 'edit' && !this.busy && !this.openToolId() && this.history.done.length > 0) {
      this.setHistory(undoHistory(this.history))
    }
  }

  /** Brings back the last edit undone. */
  redo(): void {
    if (this.mode === 'edit' && !this.busy && !this.openToolId() && this.history.undone.length > 0) {
      this.setHistory(redoHistory(this.history))
    }
  }

  /**
   * Opens a tool: `crop` or `perspective`, with their corners, or `adjust` or `threshold`, with their ruler. It stays open
   * until `confirmTool()` or `cancelTool()`. Opening `threshold` turns it on, so the preview shows what it does.
   * It does nothing outside the edit mode, while another tool is open, or for Crop and Straighten while a preview is on its way.
   *
   * @example
   * pic.edit()
   * pic.openTool('crop')
   */
  openTool(id: ToolId): void {
    const tool = TOOLS.find(candidate => candidate.id === id)
    if (this.mode !== 'edit' || this.busy || this.openToolId() || !tool) {
      return
    }
    const hadFocus = this.hasFocus()
    if (id === 'adjust') {
      if (!canAdjust(this.history.done)) {
        return
      }
      this.draft = {
        tool: 'adjust',
        setting: adjustSetting(this.history.done),
      }
    }
    else if (id === 'threshold') {
      this.draft = {
        tool: 'threshold',
        setting: openThreshold(this.history.done),
      }
    }
    else if (tool.activate && !this.previewQueue.pending) {
      this.session = {
        tool,
        handle: tool.activate(this.toolHost()),
      }
    }
    else {
      return
    }
    this.editBar.setActiveTool(tool)
    this.updatePreview()
    this.refresh()
    if (hadFocus) {
      if (this.session) {
        this.session.handle.focus()
      }
      else if (this.options.toolbar) {
        this.editBar.focusRuler()
      }
    }
    this.emit('change', this.getState())
  }

  /** Closes the open tool and adds what it chose to the edits: a selection, or the settings of Adjust or Clean up. */
  confirmTool(): void {
    if (!this.openToolId()) {
      return
    }
    const operation = this.session
      ? this.session.handle.confirm()
      : this.draftEdit()
    this.closeTool()
    if (operation) {
      this.addOperation(operation)
    }
    else {
      this.updatePreview()
      this.refresh()
      this.emit('change', this.getState())
    }
  }

  /** Closes the open tool without adding anything to the edits. */
  cancelTool(): void {
    if (this.openToolId()) {
      this.closeTool()
      this.updatePreview()
      this.refresh()
      this.emit('change', this.getState())
    }
  }

  /**
   * Turns the clean up of the document on or off, or changes its sensitivity. It always runs after the other edits.
   * While Clean up is open, it changes what Clean up shows, which `confirmTool()` keeps as one edit.
   * It does nothing outside the edit mode, or while another tool is open.
   *
   * @throws {RangeError} If `sensitivity` is not between 0 and 1.
   */
  setThreshold({ enabled, sensitivity }: { enabled?: boolean, sensitivity?: number }): void {
    if (sensitivity !== undefined && !(sensitivity >= 0 && sensitivity <= 1)) {
      throw new RangeError(`sensitivity must be between 0 and 1, got ${sensitivity}`)
    }
    const draft = this.draft
    if (draft?.tool === 'threshold') {
      this.changeDraft({
        tool: 'threshold',
        setting: {
          enabled: enabled ?? draft.setting.enabled,
          sensitivity: sensitivity ?? draft.setting.sensitivity,
        },
      })
      return
    }
    if (this.mode !== 'edit' || this.busy || this.openToolId()) {
      return
    }
    const current = thresholdSetting(this.history.done)
    const edit = thresholdEdit({
      enabled: enabled ?? current.enabled,
      sensitivity: sensitivity ?? current.sensitivity,
    }, this.history.done, this.options.softness)
    if (edit) {
      this.addOperation(edit)
    }
  }

  /**
   * Changes the brightness or the contrast, each from -1 to 1, where 0 leaves the image as it is. They run after the other edits.
   * While Adjust is open, it changes what Adjust shows, which `confirmTool()` keeps as one edit.
   * It does nothing outside the edit mode, while another tool is open, or while the document is cleaned up, which has tones of its own.
   *
   * @throws {RangeError} If a value is not between -1 and 1.
   */
  setAdjustments({ brightness, contrast }: { brightness?: number, contrast?: number }): void {
    for (const [name, value] of Object.entries({ brightness, contrast })) {
      if (value !== undefined && !(value >= -1 && value <= 1)) {
        throw new RangeError(`${name} must be between -1 and 1, got ${value}`)
      }
    }
    const draft = this.draft
    if (draft?.tool === 'adjust') {
      this.changeDraft({
        tool: 'adjust',
        setting: {
          brightness: brightness ?? draft.setting.brightness,
          contrast: contrast ?? draft.setting.contrast,
        },
      })
      return
    }
    if (this.mode !== 'edit' || this.busy || this.openToolId() || !canAdjust(this.history.done)) {
      return
    }
    const current = adjustSetting(this.history.done)
    const edit = adjustEdit({
      brightness: brightness ?? current.brightness,
      contrast: contrast ?? current.contrast,
    }, this.history.done)
    if (edit) {
      this.addOperation(edit)
    }
  }

  /** Discards the edits and goes back to viewing. It does not ask: the built-in Cancel button does that. */
  cancel(): void {
    if (this.mode === 'edit' && !this.busy) {
      const hadFocus = this.hasFocus()
      this.leaveEdit()
      this.showStatus()
      this.refresh()
      this.restoreFocus(hadFocus)
      this.emit('change', this.getState())
    }
  }

  /**
   * Applies the edits. The result becomes the image on display, and the `apply` event carries it.
   * If it fails, the `error` event reports it and the edit stays open. The promise resolves either way.
   *
   * @example
   * pic.on('apply', ({ blob, type }) => upload(blob, type))
   * await pic.apply()
   */
  async apply(): Promise<void> {
    const image = this.image
    const steps = toPipelineSteps(this.history.done)
    if (this.mode !== 'edit' || this.busy || this.openToolId() || !image || steps.length === 0) {
      return
    }

    const id = this.loadId
    const edit = this.editId
    const outdated = () => id !== this.loadId || edit !== this.editId
    this.busy = true
    this.failure = null
    this.showStatus()
    this.refresh()
    this.emit('change', this.getState())

    try {
      const exported = await exportImage({
        image: image.element,
        width: image.width,
        height: image.height,
        steps,
        run: (source, pipelineSteps) => this.runner.run(source, pipelineSteps),
        source: this.source,
        output: this.options.output,
        maxOutputSize: this.options.maxOutputSize,
      })
      const loaded = await loadImage(exported.blob)
      if (outdated()) {
        loaded.release()
        return
      }
      const hadFocus = this.hasFocus()
      this.busy = false
      this.mode = 'view'
      this.history = createHistory()
      this.setPreview(null)
      this.setImage(loaded, 'ready')
      this.setSaved(exported.blob)
      this.restoreFocus(hadFocus)
      this.announce(this.labels.applied)
      this.emit('apply', exported)
      this.emit('change', this.getState())
    }
    catch (cause) {
      if (outdated()) {
        return
      }
      this.busy = false
      this.failure = 'apply'
      this.showStatus()
      this.refresh()
      this.emit('error', {
        error: asError(cause),
        phase: 'apply',
      })
    }
  }

  /**
   * Saves the image on display as a file: the result of the last Apply, or else the source.
   * The `download` event comes first and can stop it. It does nothing while editing, because the edits are not applied yet.
   *
   * @example
   * // Save it through your server instead
   * pic.on('download', ({ preventDefault }) => {
   *   preventDefault()
   *   window.location.assign('/api/documents/42/file')
   * })
   */
  download(): void {
    const saved = this.saved
    if (this.mode !== 'view' || this.loadStatus !== 'ready' || !saved) {
      return
    }
    let prevented = false
    const filename = downloadName(saved.source, this.source, this.options.filename)
    this.emit('download', {
      source: saved.source,
      filename,
      preventDefault: () => {
        prevented = true
      },
    })
    if (!prevented) {
      saved.url ??= typeof saved.source === 'string'
        ? saved.source
        : URL.createObjectURL(saved.source)
      saveFile(saved.url, filename)
    }
  }

  /** Loads the current `src` again, which brings back the original after applying edits. */
  reload(): void {
    if (this.source !== undefined) {
      this.load(this.source)
    }
  }

  /**
   * Removes the viewer and releases everything it holds, such as its worker and the memory of its images. It is safe to
   * call twice. The Vue and React components call it on unmount.
   *
   * @example
   * pic.destroy()
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }
    this.destroyed = true
    this.loadId++
    for (const cleanup of this.cleanups) {
      cleanup()
    }
    this.closeTool()
    this.previewQueue.forget()
    this.renderer.destroy()
    this.runner.destroy()
    this.preview?.release()
    this.preview = null
    this.image?.release()
    this.image = null
    this.setSaved(undefined)
    this.root.remove()
    for (const listeners of Object.values(this.listeners)) {
      listeners.clear()
    }
  }

  /**
   * Names the image with `alt`. Without one, the image leaves the accessibility tree, as an `<img>` with an empty `alt`
   * does, because an image with no name breaks WCAG and the viewer around it already has a name.
   */
  private describeImage(alt: string): void {
    if (alt.trim()) {
      this.canvas.setAttribute('role', 'img')
      this.canvas.setAttribute('aria-label', alt)
      this.canvas.removeAttribute('aria-hidden')
    }
    else {
      this.canvas.removeAttribute('role')
      this.canvas.removeAttribute('aria-label')
      this.canvas.setAttribute('aria-hidden', 'true')
    }
  }

  private scene(): Scene | null {
    const shown = this.preview ?? this.image
    return shown && {
      image: shown.element,
      imageSize: shown,
      view: this.view,
      viewport: this.viewport,
      drawOverlay: this.session?.handle.drawOverlay,
    }
  }

  private toolHost(): ToolHost {
    const shown = () => (this.preview ?? this.image)!
    return {
      layer: this.handles,
      frameSize: () => displayedSize(shown(), this.view.rotation),
      frameToViewport: point => frameToViewport(this.view, shown(), this.viewport, point),
      viewportToFrame: point => viewportToFrame(this.view, shown(), this.viewport, point),
      reveal: (point) => {
        const { x, y } = frameToViewport(this.view, shown(), this.viewport, point)
        const distance = (position: number, size: number) => Math.max(0, REVEAL_MARGIN - position) - Math.max(0, position - size + REVEAL_MARGIN)
        this.pan(distance(x, this.viewport.width), distance(y, this.viewport.height))
      },
      requestPaint: () => this.renderer.requestPaint(),
      setHint: text => this.editBar.setHint(text),
      announce: text => this.announce(text),
      labels: () => this.labels,
      photoFrame: () => photoFrame(this.image!, toPipelineSteps(this.history.done)),
      aspectRatio: () => this.options.aspectRatio,
      paintMagnifier: (context, magnifier) => paintMagnifier(context, magnifier, {
        view: this.view,
        image: shown(),
        viewport: this.viewport,
      }),
    }
  }

  /** The open tool, with a selection or a panel of settings of its own. */
  private openToolId(): ToolId | null {
    return this.session?.tool.id ?? this.draft?.tool ?? null
  }

  /** Shows other settings in the open Adjust or Clean up, without any edit. */
  private changeDraft(draft: PanelDraft): void {
    if (JSON.stringify(draft) === JSON.stringify(this.draft)) {
      return
    }
    this.draft = draft
    this.updatePreview()
    this.refresh()
    this.emit('change', this.getState())
  }

  /** The edit that the open Adjust or Clean up would leave, or `null` if it changes nothing. */
  private draftEdit(): Operation | null {
    const draft = this.draft
    if (draft?.tool === 'adjust') {
      return adjustEdit(draft.setting, this.history.done)
    }
    if (draft?.tool === 'threshold') {
      return confirmThreshold(draft.setting, this.history.done, this.options.softness)
    }
    return null
  }

  private closeTool(): void {
    const id = this.openToolId()
    if (!id) {
      return
    }
    const hadFocus = this.hasFocus()
    this.session?.handle.deactivate()
    this.session = null
    this.draft = null
    this.editBar.setActiveTool(null)
    if (hadFocus && this.options.toolbar) {
      this.editBar.focus(id)
    }
  }

  /**
   * Tells the listeners of an event. A listener that throws is the app failing, not the viewer, so the page gets its
   * error as any uncaught one, the other listeners still run, and it never looks like a failed load or Apply.
   */
  private emit<Name extends keyof PaperPicEvents>(name: Name, payload: PaperPicEvents[Name]): void {
    for (const listener of this.listeners[name]) {
      try {
        listener(payload)
      }
      catch (error) {
        reportError(error)
      }
    }
  }

  private hasFocus(): boolean {
    return this.root.contains(document.activeElement)
  }

  /** Tells screen readers about a change that the focus alone does not show. The message on screen stays. */
  private announce(text: string): void {
    this.announcer.textContent = text
  }

  /** Puts the keyboard focus back on the toolbar, because the button that had it may be gone. */
  private restoreFocus(hadFocus: boolean): void {
    if (hadFocus && this.options.toolbar) {
      this.toolbar.focus()
    }
  }

  private async load(source: PaperPicSource | undefined): Promise<void> {
    // A destroyed viewer has nowhere to show an image, and nothing would release it
    if (this.destroyed) {
      return
    }
    const id = ++this.loadId
    this.source = source
    this.setSaved(source)
    this.leaveEdit()

    if (source === undefined) {
      this.setImage(null, 'empty')
      return
    }

    this.loadStatus = 'loading'
    this.showStatus()
    this.refresh()
    try {
      const loaded = await loadImage(source)
      if (id !== this.loadId) {
        loaded.release()
        return
      }
      this.setImage(loaded, 'ready')
      this.emit('load', { width: loaded.width, height: loaded.height })
    }
    catch (cause) {
      if (id !== this.loadId) {
        return
      }
      this.setImage(null, 'error')
      this.emit('error', {
        error: asError(cause),
        phase: 'load',
      })
    }
  }

  /** Changes what a download saves, and frees the address of the file it saved before. */
  private setSaved(source: PaperPicSource | undefined): void {
    if (this.saved?.url && this.saved.url !== this.saved.source) {
      URL.revokeObjectURL(this.saved.url)
    }
    this.saved = source === undefined
      ? null
      : { source, url: null }
  }

  private setImage(image: LoadedImage | null, status: PaperPicState['status']): void {
    this.image?.release()
    this.image = image
    this.loadStatus = status
    this.view = createView()
    this.showStatus()
    this.applyViewport()
  }

  /** Ends the edit without a trace. An Apply in progress is ignored when it finishes, because `editId` changes. */
  private leaveEdit(): void {
    this.editId++
    this.closeTool()
    this.mode = 'view'
    this.busy = false
    this.failure = null
    this.history = createHistory()
    this.setPreview(null)
    this.syncRotation()
  }

  private addOperation(operation: Operation): void {
    if (this.mode === 'edit' && !this.busy && !this.openToolId()) {
      this.setHistory(addToHistory(this.history, operation))
    }
  }

  private setHistory(history: History<Operation>): void {
    this.history = history
    this.failure = null
    this.updatePreview()
    this.showStatus()
    this.refresh()
    this.emit('change', this.getState())
  }

  /** The edits decide the rotation on display, so Undo and Cancel restore it. */
  private syncRotation(): void {
    const image = this.measuredImage()
    if (image && this.options.editable) {
      this.view = setRotation(this.view, trailingRotation(this.history.done), image, this.viewport)
    }
  }

  /**
   * The tones that the preview paints: those of the edits, with what an open Adjust or Clean up shows instead of its own.
   * Straighten sees the image without the threshold, because the edges of the paper are hard to find on a cleaned image.
   * An open Adjust needs tones to change, even when they are at 0.
   */
  private previewTone(): ToneStep | null {
    const draft = this.draft
    const operations = [...this.history.done]
    if (draft?.tool === 'adjust') {
      operations.push({ type: 'adjust', ...draft.setting })
    }
    if (draft?.tool === 'threshold') {
      operations.push(thresholdOperation(draft.setting, operations, this.options.softness))
    }
    const tone = toneStep(operations)
    if (tone?.type === 'threshold' && this.session?.tool.id === 'perspective') {
      return null
    }
    return tone ?? (draft?.tool === 'adjust'
      ? { type: 'adjust', ...draft.setting }
      : null)
  }

  /** Makes the pixels on display match the edits. A change of tones of the same kind only repaints the preview. */
  private updatePreview(): void {
    const steps = toPreviewSteps(this.history.done)
    const tone = this.previewTone()
    const key = JSON.stringify({ steps, tone: tone?.type ?? null })
    if (key === this.previewKey) {
      this.syncRotation()
      if (tone) {
        this.previewQueue.scheduleTint(tone)
      }
    }
    else if (steps.length === 0 && !tone) {
      this.setPreview(null)
    }
    else {
      this.previewKey = key
      this.previewQueue.request(steps, tone)
    }
  }

  /** Shows a preview that arrived, with the tones of the ruler, which may have moved while it was on its way. */
  private showPreview(preview: Preview): void {
    this.setPreview(preview)
    const latest = this.previewTone()
    if (latest) {
      preview.tint?.(latest)
    }
    this.emit('change', this.getState())
  }

  /** Keeps the edit open, and reports that its pixels could not be shown. */
  private previewFailed(cause: unknown): void {
    this.failure = 'preview'
    this.showStatus()
    this.refresh()
    this.emit('error', {
      error: asError(cause),
      phase: 'preview',
    })
  }

  /**
   * Changes the pixels on display. A new shape starts from a fitted view, and the same shape keeps the zoom, as when the threshold changes.
   * With `null` it goes back to the image, and any preview in progress is forgotten.
   */
  private setPreview(preview: Preview | null): void {
    const before = this.preview ?? this.image
    // A new preview starts with the latest tones, and no preview has none to paint
    this.previewQueue.cancelTint()
    if (!preview) {
      this.previewQueue.forget()
      this.previewKey = NO_PREVIEW
    }
    this.preview?.release()
    this.preview = preview
    const after = this.preview ?? this.image
    if (before?.width === after?.width && before?.height === after?.height) {
      this.syncRotation()
    }
    else {
      this.view = {
        ...createView(),
        rotation: trailingRotation(this.history.done),
      }
    }
    this.applyViewport()
    this.showStatus()
  }

  private showStatus(): void {
    const texts = {
      empty: '',
      ready: '',
      loading: this.labels.loading,
      error: this.labels.loadError,
    }
    const failures = {
      apply: this.labels.applyError,
      preview: this.labels.previewError,
    }
    const text = this.busy
      ? this.labels.processing
      : this.failure
        ? failures[this.failure]
        : texts[this.loadStatus]
    this.status.textContent = text
    this.status.classList.toggle('paperpic-status-visible', text !== '')
    // Only the image is busy. Around the messages, it could make screen readers hold them back until the work ends
    this.viewportElement.setAttribute('aria-busy', String(this.busy || this.previewQueue.pending || this.loadStatus === 'loading'))
  }

  /** How far past its sides the image can go, so the part under the toolbar can come out from behind it. Editing hides the toolbar. */
  private toolbarClearance(): number {
    if (this.toolbar.element.hidden) {
      return 0
    }
    this.toolbarWidth ??= this.toolbar.element.offsetWidth
    return this.toolbarWidth + TOOLBAR_GAP
  }

  private measure(): void {
    if (this.destroyed) {
      return
    }
    this.viewport = { width: this.viewportElement.clientWidth, height: this.viewportElement.clientHeight }
    this.renderer.resize(this.viewport, globalThis.devicePixelRatio || 1)
    this.applyViewport()
    this.renderer.paintNow()
  }

  /** The image on display, once the viewer has a size to show it in. A hidden container has none. */
  private measuredImage(): LoadedImage | null {
    return this.viewport.width > 0 && this.viewport.height > 0
      ? this.preview ?? this.image
      : null
  }

  private applyViewport(): void {
    const image = this.measuredImage()
    if (image) {
      this.view = resizeView(this.view, image, this.viewport)
    }
    this.refresh()
  }

  /** Whether the zoom can go further in each direction, from the view on display. */
  private canZoom(): { canZoomIn: boolean, canZoomOut: boolean } {
    const image = this.measuredImage()
    const limits = image && zoomLimits(image, this.viewport, this.view.rotation)
    return {
      canZoomIn: limits !== null && this.view.zoom < limits.max - ZOOM_TOLERANCE,
      canZoomOut: limits !== null && this.view.zoom > limits.min + ZOOM_TOLERANCE,
    }
  }

  /** Makes the whole interface match the state: the bars, the mode and the view. */
  private refresh(): void {
    const state = this.getState()
    const zoom = this.canZoom()
    // The toolbar may change size with the interface, such as when it shows again after editing. Watching it with the
    // observer of the viewer made the browser report a loop, because measuring the viewer changes the toolbar
    this.toolbarWidth = null

    this.toolbar.update({
      fit: this.view.fit,
      canEdit: this.options.editable && this.mode === 'view' && this.loadStatus === 'ready',
      ...zoom,
      canRotate: !this.options.editable,
      canDownload: this.options.download && this.mode === 'view' && this.loadStatus === 'ready',
    })
    // Nothing covers the image while editing, so no corner ends up under a button
    this.toolbar.setVisible(this.options.toolbar && this.mode === 'view')
    this.editBar.setVisible(this.mode === 'edit' && this.options.toolbar)
    this.editBar.update({
      ...state,
      canOpenTool: !this.previewQueue.pending,
      ...zoom,
      thresholdInEdits: thresholdSetting(this.history.done).enabled,
    })
    this.root.classList.toggle('paperpic-editing', this.mode === 'edit')
    // Public, so CSS can follow the state: `data-paperpic-status`, `data-paperpic-mode` and `data-paperpic-tool`
    this.root.dataset.paperpicStatus = state.status
    this.root.dataset.paperpicMode = state.mode
    if (state.activeTool) {
      this.root.dataset.paperpicTool = state.activeTool
    }
    else {
      delete this.root.dataset.paperpicTool
    }
    this.refreshView(zoom)
  }

  /**
   * Makes what follows the view match it: the zoom and fit buttons, the handles of an open tool, the cursor and the
   * image. A pan or a zoom needs nothing else, and it can come on every move of the pointer.
   */
  private refreshView(zoom = this.canZoom()): void {
    const image = this.measuredImage()
    this.toolbar.updateView({ fit: this.view.fit, ...zoom })
    this.editBar.updateView(zoom)
    this.session?.handle.update()
    this.viewportElement.classList.toggle(
      'paperpic-viewport-pannable',
      image !== null && overflows(this.view, image, this.viewport),
    )
    this.renderer.requestPaint()
  }

  /** Shows another view. Returns whether it differs from the one on display. */
  private commit(view: View): boolean {
    const { zoom, panX, panY, rotation, fit } = this.view
    const sameState = view.zoom === zoom && view.rotation === rotation && view.fit === fit
    if (sameState && view.panX === panX && view.panY === panY) {
      return false
    }
    this.view = view
    // A view changes nothing in the bars but the zoom and the fit
    this.refreshView()
    // The state does not hold the position of the image, so a pan would report the same state on every move of the pointer
    if (!sameState) {
      this.emit('change', this.getState())
    }
    return true
  }

  private resetRotation(): void {
    this.view = {
      ...this.view,
      rotation: 0,
      panX: 0,
      panY: 0,
    }
    this.applyViewport()
  }

  /** Moves the image. Returns whether it moved, which an image that fits, or one at its edge, does not. */
  private pan(deltaX: number, deltaY: number): boolean {
    const image = this.measuredImage()
    return image !== null && this.commit(panBy(this.view, deltaX, deltaY, image, this.viewport, this.toolbarClearance()))
  }

  private zoomAround(zoom: number, point: ViewPoint): void {
    const image = this.measuredImage()
    if (image) {
      this.commit(zoomTo(this.view, zoom, point, image, this.viewport, this.toolbarClearance()))
    }
  }

  /**
   * Zooms one step around the center. With `anchored`, an open tool can keep a point in place instead, such as the corner
   * the user is placing, so the zoom of its panel and the keys never push that corner off screen.
   */
  private stepZoom(factor: number, anchored = false): void {
    const anchor = anchored
      ? this.session?.handle.anchor?.() ?? undefined
      : undefined
    this.zoomTo(this.view.zoom * factor, anchor)
    if (this.measuredImage()) {
      this.announce(this.labels.zoomLevel(Math.round(this.view.zoom * 100)))
    }
  }

  private toggleZoom(point: ViewPoint): void {
    if (!this.view.fit) {
      this.fit('image')
    }
    else {
      this.zoomAround(Math.abs(this.view.zoom - 1) < ZOOM_TOLERANCE
        ? 2
        : 1, point)
    }
  }

  /** Runs a key's command. Returns whether it did something, so other keys keep their usual effect. */
  private runKey(command: KeyCommand, target: EventTarget | null): boolean {
    const editing = this.mode === 'edit'
    switch (command.type) {
      case 'zoomIn':
        this.stepZoom(ZOOM_STEP, true)
        return true
      case 'zoomOut':
        this.stepZoom(1 / ZOOM_STEP, true)
        return true
      case 'fit':
        this.fit('image')
        return true
      case 'pan':
        // An arrow that moves nothing keeps its usual effect, so the page scrolls, as it does under one finger
        return this.pan(command.deltaX, command.deltaY)
      case 'undo':
        this.undo()
        return editing
      case 'redo':
        this.redo()
        return editing
      case 'cancel':
        if (this.openToolId()) {
          // A selected corner lets go first, and the next Esc closes the tool
          if (!this.session?.handle.escape?.()) {
            this.cancelTool()
          }
          return true
        }
        // Without the built-in bar there is nowhere to ask, and a custom interface decides what Esc does
        if (editing && this.options.toolbar) {
          this.editBar.requestCancel({
            cancel: () => this.cancel(),
          })
          return true
        }
        return false
      case 'apply':
        // Enter on a button must press that button, but a corner handle and a ruler confirm the tool
        if (this.openToolId() && (this.viewportElement.contains(target as Node) || target instanceof HTMLInputElement)) {
          this.confirmTool()
          return true
        }
        // Enter on a button must press that button
        if (editing && target === this.viewportElement) {
          this.apply()
          return true
        }
        return false
    }
  }
}
