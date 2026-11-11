import type { PaperPicDownload } from './download'
import type { KeyCommand } from './input/keyboard'
import type { ExportedImage, PaperPicOutput } from './pipeline/export'
import type { Operation, PipelineStep, ToneStep } from './pipeline/operations'
import type { Preview } from './pipeline/preview'
import type { LoadedImage } from './render/load-image'
import type { Scene } from './render/renderer'
import type { Rotation } from './rotation'
import type { History } from './state/history'
import type { Fit, Size, View, ViewPoint } from './state/view'
import type { Lens } from './tools/magnifier'
import type { Tool, ToolContext, ToolHost, ToolId, ToolSession } from './tools/types'
import type { PaperPicIcons } from './ui/icons'
import type { PaperPicLabels } from './ui/labels'
import { downloadName, saveFile } from './download'
import { attachGestures } from './input/gestures'
import { keyToCommand } from './input/keyboard'
import { exportImage } from './pipeline/export'
import { adjustSetting, thresholdSetting, toneStep, toPipelineSteps, toPreviewSteps, trailingRotation } from './pipeline/operations'
import { photoFrame } from './pipeline/photo-frame'
import { renderPreview } from './pipeline/preview'
import { PipelineRunner } from './pipeline/run'
import { loadImage } from './render/load-image'
import { Renderer } from './render/renderer'
import { computeTransform } from './render/transform'
import { addToHistory, createHistory, redoHistory, undoHistory } from './state/history'
import { createView, displayedSize, fitView, frameToViewport, overflows, panBy, resizeView, rotateView, setRotation, viewportToFrame, zoomLimits, zoomTo } from './state/view'
import { ALL_TOOL_IDS, TOOLS } from './tools'
import { EditBar } from './ui/edit-bar'
import { DEFAULT_ICONS } from './ui/icons'
import { DEFAULT_LABELS } from './ui/labels'
import { Toolbar } from './ui/toolbar'

const ZOOM_STEP = 1.25
const ZOOM_TOLERANCE = 0.001
const TOOLBAR_GAP = 16
const NO_PREVIEW = JSON.stringify({ steps: [], tone: null })
const LENS_ZOOM = 3
/** How close to the edge of the viewer a point can be and still count as on screen. */
const REVEAL_MARGIN = 24

/** The image to show: a URL from the same origin, or a file attached on the client. */
export type PaperPicSource = string | Blob

export interface PaperPicOptions {
  /** Describes the image for screen readers. Without it, they skip the image, as they skip an `<img>` with an empty `alt`. */
  alt?: string
  /** The real proportions of the document, as width divided by height, such as `210 / 297` for A4. Without it, straightening estimates them. */
  aspectRatio?: number
  /** Whether the toolbar has a button that saves the image on display, which is the result of the last Apply or else the source. */
  download?: boolean
  /**
   * Whether the image can be edited. With `false` it is a read-only viewer, whose toolbar can also rotate the image.
   * That rotation only changes the display.
   */
  editable?: boolean
  /** The name of the saved file. By default, the name of the source. The extension follows the format of the image. */
  filename?: string
  /**
   * Replaces any of the icons with the markup of one element, such as an `<svg>`. The markup is inserted as HTML, so
   * pass only markup you trust. An empty string leaves the buttons of that icon without one.
   */
  icons?: Partial<PaperPicIcons>
  /** Replaces any of the texts, which are in English by default. */
  labels?: Partial<PaperPicLabels>
  /** The longest side of the edited image, in pixels. By default, it keeps the full resolution. */
  maxOutputSize?: number
  /** The format of the edited image. By default, the format of the source. */
  output?: PaperPicOutput
  /**
   * From 0 to 1. How much gray cleaning up a document keeps, which makes letters easier to read. By default, 0.25.
   * Use 0 for strict black and white, which gives smaller files but breaks thin strokes.
   */
  softness?: number
  /** The image to show. Passing the same value again does not reload it: use `reload()`. */
  src?: PaperPicSource
  /** Whether to show the built-in toolbar and edit bar. Without them, build your own with the public methods. */
  toolbar?: boolean
  /** Which tools the edit bar offers. By default, all of them. */
  tools?: readonly ToolId[]
  /** Whether the wheel zooms. Turn it off when the viewer sits in a long page. */
  wheelZoom?: boolean
}

/** What the viewer is showing. */
export interface PaperPicState {
  /** The tool with an open selection, or `null`. */
  activeTool: ToolId | null
  /** The brightness and contrast, each from -1 to 1, where 0 leaves the image as it is. Cleaning up the document leaves them out. */
  adjustments: { brightness: number, contrast: number }
  /** Whether the changes are being applied. */
  busy: boolean
  /** Whether there are changes to apply. Rotations that cancel out are no change. */
  canApply: boolean
  canRedo: boolean
  canUndo: boolean
  /** The fit in effect, or `null` once the user has zoomed by hand. */
  fit: Fit | null
  /** The size of the image on display in pixels, with the edits so far, or `null` if there is none. */
  image: Size | null
  /** Whether the user is viewing or editing the image. */
  mode: 'view' | 'edit'
  rotation: Rotation
  status: 'empty' | 'loading' | 'ready' | 'error'
  /** Whether the document gets cleaned up, and how much. */
  threshold: { enabled: boolean, sensitivity: number }
  /** Screen pixels per image pixel. */
  zoom: number
}

export interface PaperPicEvents {
  /** The user applied the changes. The result is already on display. */
  apply: ExportedImage
  /** The user changed the view or the edit. `setOptions()` never triggers it. */
  change: PaperPicState
  /** The image is about to be saved. Call `preventDefault()` to save it another way. */
  download: PaperPicDownload
  /** The image could not be loaded, or the changes could not be applied. */
  error: { error: Error }
  /** The image is ready. */
  load: { height: number, width: number }
}

type Listener<Name extends keyof PaperPicEvents> = (payload: PaperPicEvents[Name]) => void
type Listeners = { [Name in keyof PaperPicEvents]: Set<Listener<Name>> }
type OptionalOption = 'icons' | 'labels' | 'output' | 'maxOutputSize' | 'aspectRatio' | 'softness' | 'filename'
type ResolvedOptions = Required<Omit<PaperPicOptions, 'src' | OptionalOption>> & Pick<PaperPicOptions, OptionalOption>

const DEFAULT_OPTIONS: ResolvedOptions = {
  alt: '',
  aspectRatio: undefined,
  download: false,
  editable: true,
  filename: undefined,
  icons: undefined,
  labels: undefined,
  maxOutputSize: undefined,
  output: undefined,
  softness: undefined,
  toolbar: true,
  tools: ALL_TOOL_IDS,
  wheelZoom: true,
}

/**
 * A document image viewer and editor. It fills its container, which needs a height.
 *
 * @example
 * const pic = new PaperPic(element, { src: '/receipt.jpg', alt: 'Receipt' })
 * pic.on('apply', ({ blob }) => upload(blob))
 */
export class PaperPic {
  private readonly root: HTMLElement
  private readonly viewportElement: HTMLElement
  private readonly canvas: HTMLCanvasElement
  private readonly handles: HTMLElement
  private readonly status: HTMLElement
  private readonly toolbar: Toolbar
  private readonly editBar: EditBar
  private readonly renderer: Renderer
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
  private previewId = 0
  private previewing = false
  /** Whether the sliders of brightness and contrast are open, so the preview keeps the pixels they change. */
  private adjusting = false
  private session: { handle: ToolSession, tool: Tool } | null = null
  private loadStatus: PaperPicState['status'] = 'empty'
  private loadId = 0
  private view: View = createView()
  private viewport: Size = { width: 0, height: 0 }
  private mode: PaperPicState['mode'] = 'view'
  private history: History<Operation> = createHistory()
  private busy = false
  private applyFailed = false
  private destroyed = false

  /**
   * @param container The element to fill. It needs a height, or the viewer stays at its minimum height.
   * @throws {TypeError} If `container` is not an element. Create the instance once the element exists, such as on mount.
   */
  constructor(container: HTMLElement, options: PaperPicOptions = {}) {
    if (!(container instanceof HTMLElement)) {
      throw new TypeError('PaperPic needs an HTML element as its container. Create the instance once the element exists, such as on mount.')
    }

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
      toggleAdjustments: () => this.toggleAdjustments(),
      toggleThreshold: () => this.setThreshold({ enabled: !thresholdSetting(this.history.done).enabled }),
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
        previewThreshold: (sensitivity) => {
          const { softness } = thresholdSetting(this.history.done)
          this.preview?.tint?.({ type: 'threshold', sensitivity, softness })
          this.renderer.requestPaint()
        },
        setThreshold: (sensitivity) => {
          this.setThreshold({ sensitivity })
          this.status.textContent = this.labels.thresholdLevel(Math.round(sensitivity * 100))
        },
        previewAdjustment: (name, value) => {
          this.preview?.tint?.({
            type: 'adjust',
            ...adjustSetting(this.history.done),
            [name]: value,
          })
          this.renderer.requestPaint()
        },
        setAdjustment: (name, value) => {
          this.setAdjustments({ [name]: value })
          this.status.textContent = this.labels.adjustmentLevel(this.labels[name], Math.round(value * 100))
        },
      },
      TOOLS,
      this.labels,
    )

    stage.append(this.viewportElement, this.toolbar.element, this.status)
    this.root.append(stage, this.editBar.element)
    container.append(this.root)

    this.renderer = new Renderer(this.canvas, overlay, () => this.scene())

    this.cleanups.push(attachGestures(this.viewportElement, {
      onPan: (deltaX, deltaY) => this.pan(deltaX, deltaY),
      onZoom: (factor, point) => this.zoomAround(this.view.zoom * factor, point),
      onTap: point => this.session?.handle.tap?.(point) ?? false,
      onDoubleTap: point => this.toggleZoom(point),
      wheelZoom: () => this.options.wheelZoom,
    }))

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

    const observer = new ResizeObserver(() => this.measure())
    observer.observe(this.viewportElement)
    this.cleanups.push(() => observer.disconnect())

    this.setOptions(options)
    this.measure()
  }

  /** Changes options. It does not emit `change`, so two-way bindings do not loop. */
  setOptions(options: PaperPicOptions): void {
    if (this.destroyed) {
      return
    }
    const next: ResolvedOptions = { ...this.options }
    for (const name of Object.keys(DEFAULT_OPTIONS) as (keyof ResolvedOptions)[]) {
      if (name in options) {
        // Wrappers pass every option, with undefined for the ones not set
        Object.assign(next, { [name]: options[name] ?? DEFAULT_OPTIONS[name] })
      }
    }
    const wasEditable = this.options.editable
    this.options = next

    this.labels = {
      ...DEFAULT_LABELS,
      ...next.labels,
    }
    this.toolbar.setLabels(this.labels)
    this.editBar.setLabels(this.labels)
    // An icon that keeps its markup is not parsed again, so wrappers can pass the same icons on every change
    const icons = {
      ...DEFAULT_ICONS,
      ...next.icons,
    }
    this.toolbar.setIcons(icons)
    this.editBar.setIcons(icons)
    this.editBar.setTools(next.tools)
    this.viewportElement.setAttribute('aria-label', this.labels.viewer)
    this.describeImage(next.alt)
    this.toolbar.element.hidden = !next.toolbar

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
    const { enabled, sensitivity } = thresholdSetting(this.history.done)
    const { brightness, contrast } = adjustSetting(this.history.done)
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
      activeTool: this.session?.tool.id ?? null,
      threshold: { enabled, sensitivity },
      adjustments: { brightness, contrast },
    }
  }

  /**
   * Listens to an event.
   *
   * @returns The function that stops listening.
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
   */
  zoomTo(zoom: number, point?: ViewPoint): void {
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
    if (this.session) {
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
    if (this.options.tools.includes('flip')) {
      this.addOperation({ type: 'flip' })
    }
  }

  /** Starts editing. It does nothing if the image is not ready or cannot be edited. */
  edit(): void {
    if (this.mode === 'edit' || !this.options.editable || this.loadStatus !== 'ready') {
      return
    }
    const hadFocus = this.hasFocus()
    this.mode = 'edit'
    this.refresh()
    this.status.textContent = this.labels.editing
    if (hadFocus && this.options.toolbar) {
      this.editBar.focus()
    }
    this.emit('change', this.getState())
  }

  /** Undoes the last edit. */
  undo(): void {
    if (this.mode === 'edit' && !this.busy && !this.session && this.history.done.length > 0) {
      this.setHistory(undoHistory(this.history))
    }
  }

  /** Brings back the last edit undone. */
  redo(): void {
    if (this.mode === 'edit' && !this.busy && !this.session && this.history.undone.length > 0) {
      this.setHistory(redoHistory(this.history))
    }
  }

  /**
   * Opens a tool with its own selection, such as `crop`. It stays open until `confirmTool()` or `cancelTool()`.
   * It does nothing outside the edit mode, or while a preview is on its way.
   */
  openTool(id: ToolId): void {
    const tool = TOOLS.find(candidate => candidate.id === id)
    if (this.mode !== 'edit' || this.busy || this.previewing || this.session || !tool?.activate || !this.options.tools.includes(id)) {
      return
    }
    const hadFocus = this.hasFocus()
    this.session = {
      tool,
      handle: tool.activate(this.toolHost()),
    }
    this.editBar.setActiveTool(tool)
    this.updatePreview()
    this.refresh()
    if (hadFocus) {
      this.session.handle.focus()
    }
    this.emit('change', this.getState())
  }

  /** Closes the open tool and adds its selection to the edits. */
  confirmTool(): void {
    if (this.session) {
      const operation = this.session.handle.confirm()
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
  }

  /** Closes the open tool without adding anything to the edits. */
  cancelTool(): void {
    if (this.session) {
      this.closeTool()
      this.updatePreview()
      this.refresh()
      this.emit('change', this.getState())
    }
  }

  /**
   * Turns the clean up of the document on or off, or changes its sensitivity. It always runs after the other edits.
   * It does nothing outside the edit mode, or while a tool is open.
   *
   * @throws {RangeError} If `sensitivity` is not between 0 and 1.
   */
  setThreshold({ enabled, sensitivity }: { enabled?: boolean, sensitivity?: number }): void {
    if (sensitivity !== undefined && !(sensitivity >= 0 && sensitivity <= 1)) {
      throw new RangeError(`sensitivity must be between 0 and 1, got ${sensitivity}`)
    }
    if (this.mode !== 'edit' || this.busy || this.session || !this.options.tools.includes('threshold')) {
      return
    }
    const current = thresholdSetting(this.history.done)
    const next = {
      enabled: enabled ?? current.enabled,
      sensitivity: sensitivity ?? current.sensitivity,
    }
    if (next.enabled !== current.enabled || next.sensitivity !== current.sensitivity) {
      this.addOperation({
        type: 'threshold',
        ...next,
        softness: this.options.softness ?? current.softness,
      })
    }
  }

  /**
   * Changes the brightness or the contrast, each from -1 to 1, where 0 leaves the image as it is. They run after the other edits.
   * It does nothing outside the edit mode, while a tool is open, or while the document is cleaned up, which has tones of its own.
   *
   * @throws {RangeError} If a value is not between -1 and 1.
   */
  setAdjustments({ brightness, contrast }: { brightness?: number, contrast?: number }): void {
    for (const [name, value] of Object.entries({ brightness, contrast })) {
      if (value !== undefined && !(value >= -1 && value <= 1)) {
        throw new RangeError(`${name} must be between -1 and 1, got ${value}`)
      }
    }
    if (!this.canAdjust()) {
      return
    }
    const current = adjustSetting(this.history.done)
    const next = {
      brightness: brightness ?? current.brightness,
      contrast: contrast ?? current.contrast,
    }
    if (next.brightness !== current.brightness || next.contrast !== current.contrast) {
      this.addOperation({ type: 'adjust', ...next })
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
   * If it fails, the `error` event reports it and the edit stays open.
   */
  async apply(): Promise<void> {
    const image = this.image
    const steps = toPipelineSteps(this.history.done)
    if (this.mode !== 'edit' || this.busy || this.session || !image || steps.length === 0) {
      return
    }

    const id = this.loadId
    this.busy = true
    this.applyFailed = false
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
      if (id !== this.loadId) {
        loaded.release()
        return
      }
      const hadFocus = this.hasFocus()
      this.busy = false
      this.mode = 'view'
      this.adjusting = false
      this.history = createHistory()
      this.setPreview(null)
      this.setImage(loaded, 'ready')
      this.setSaved(exported.blob)
      this.restoreFocus(hadFocus)
      this.status.textContent = this.labels.applied
      this.emit('apply', exported)
      this.emit('change', this.getState())
    }
    catch (cause) {
      if (id !== this.loadId) {
        return
      }
      this.busy = false
      this.applyFailed = true
      this.showStatus()
      this.refresh()
      this.emit('error', { error: cause as Error })
    }
  }

  /**
   * Saves the image on display as a file: the result of the last Apply, or else the source.
   * The `download` event comes first and can stop it. It does nothing while editing, because the edits are not applied yet.
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

  /** Removes the viewer and releases everything it holds. It is safe to call twice. */
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
    this.renderer.destroy()
    this.runner.destroy()
    this.previewId++
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
      toolbarCorner: () => {
        if (!this.options.toolbar) {
          return null
        }
        const { offsetLeft, offsetTop, offsetHeight } = this.toolbar.element
        return { x: offsetLeft, y: offsetTop + offsetHeight }
      },
      reveal: (point) => {
        const { x, y } = frameToViewport(this.view, shown(), this.viewport, point)
        const distance = (position: number, size: number) => Math.max(0, REVEAL_MARGIN - position) - Math.max(0, position - size + REVEAL_MARGIN)
        this.pan(distance(x, this.viewport.width), distance(y, this.viewport.height))
      },
      requestPaint: () => this.renderer.requestPaint(),
      setHint: text => this.editBar.setHint(text),
      announce: (text) => {
        this.status.textContent = text
      },
      labels: () => this.labels,
      photoFrame: () => photoFrame(this.image!, toPipelineSteps(this.history.done)),
      aspectRatio: () => this.options.aspectRatio,
      paintLens: (context, lens) => this.paintLens(context, lens),
    }
  }

  /** Paints the image larger around a point, inside a circle. */
  private paintLens(context: CanvasRenderingContext2D, { point, center, radius }: Lens): void {
    const shown = (this.preview ?? this.image)!
    const [a, b, c, d, e, f] = computeTransform(this.view, shown, this.viewport)
    const target = frameToViewport(this.view, shown, this.viewport, point)
    context.save()
    context.beginPath()
    context.arc(center.x, center.y, radius, 0, Math.PI * 2)
    context.clip()
    context.fillStyle = '#fff'
    context.fill()
    context.transform(
      a * LENS_ZOOM,
      b * LENS_ZOOM,
      c * LENS_ZOOM,
      d * LENS_ZOOM,
      center.x + (e - target.x) * LENS_ZOOM,
      center.y + (f - target.y) * LENS_ZOOM,
    )
    context.drawImage(shown.element, 0, 0, shown.width, shown.height)
    context.restore()

    context.beginPath()
    context.arc(center.x, center.y, radius, 0, Math.PI * 2)
    context.moveTo(center.x - 8, center.y)
    context.lineTo(center.x + 8, center.y)
    context.moveTo(center.x, center.y - 8)
    context.lineTo(center.x, center.y + 8)
    context.lineWidth = 2
    context.strokeStyle = '#fff'
    context.stroke()
  }

  private canAdjust(): boolean {
    return this.mode === 'edit'
      && !this.busy
      && !this.session
      && this.options.tools.includes('adjust')
      && !thresholdSetting(this.history.done).enabled
  }

  /** Opens or closes the sliders of brightness and contrast. */
  private toggleAdjustments(): void {
    if (this.canAdjust()) {
      this.adjusting = !this.adjusting
      this.updatePreview()
      this.refresh()
    }
  }

  private closeTool(): void {
    if (!this.session) {
      return
    }
    const hadFocus = this.hasFocus()
    const { tool, handle } = this.session
    handle.deactivate()
    this.session = null
    this.editBar.setActiveTool(null)
    if (hadFocus && this.options.toolbar) {
      this.editBar.focus(tool.id)
    }
  }

  private emit<Name extends keyof PaperPicEvents>(name: Name, payload: PaperPicEvents[Name]): void {
    for (const listener of this.listeners[name]) {
      listener(payload)
    }
  }

  private hasFocus(): boolean {
    return this.root.contains(document.activeElement)
  }

  /** Puts the keyboard focus back on the toolbar, because the button that had it may be gone. */
  private restoreFocus(hadFocus: boolean): void {
    if (hadFocus && this.options.toolbar) {
      this.toolbar.focus()
    }
  }

  private async load(source: PaperPicSource | undefined): Promise<void> {
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
      this.emit('error', { error: cause as Error })
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

  /** Ends the edit without a trace. In-progress work is ignored when it finishes, because a load changes `loadId`. */
  private leaveEdit(): void {
    this.closeTool()
    this.mode = 'view'
    this.busy = false
    this.applyFailed = false
    this.adjusting = false
    this.history = createHistory()
    this.setPreview(null)
    this.syncRotation()
  }

  private addOperation(operation: Operation): void {
    if (this.mode === 'edit' && !this.busy && !this.session) {
      this.setHistory(addToHistory(this.history, operation))
    }
  }

  private setHistory(history: History<Operation>): void {
    this.history = history
    this.applyFailed = false
    // The sliders of brightness and contrast close when the clean up leaves them out
    this.adjusting &&= !thresholdSetting(history.done).enabled
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
   * The tones that the preview paints. An open tool sees the image without the threshold, because the edges of the paper
   * are hard to find on a cleaned image. Open sliders of brightness and contrast need tones to change, even when they are at 0.
   */
  private previewTone(): ToneStep | null {
    const tone = toneStep(this.history.done)
    if (tone?.type === 'threshold') {
      return this.session
        ? null
        : tone
    }
    return tone ?? (this.adjusting
      ? {
          type: 'adjust',
          ...adjustSetting(this.history.done),
        }
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
        this.preview?.tint?.(tone)
      }
    }
    else if (steps.length === 0 && !tone) {
      this.setPreview(null)
    }
    else {
      this.previewKey = key
      this.startPreview(steps, tone)
    }
  }

  /** Computes the pixels of the edits. A result that arrives after newer edits is ignored. */
  private async startPreview(steps: PipelineStep[], tone: ToneStep | null): Promise<void> {
    const id = ++this.previewId
    this.previewing = true
    try {
      const preview = await renderPreview(this.image!, steps, tone, this.runner)
      if (id !== this.previewId) {
        preview.release()
        return
      }
      this.setPreview(preview)
      // The slider may have moved while the preview was on its way
      const latest = this.previewTone()
      if (latest) {
        preview.tint?.(latest)
      }
      this.emit('change', this.getState())
    }
    catch (cause) {
      if (id !== this.previewId) {
        return
      }
      this.previewing = false
      this.applyFailed = true
      this.showStatus()
      this.refresh()
      this.emit('error', { error: cause as Error })
    }
  }

  /**
   * Changes the pixels on display. A new shape starts from a fitted view, and the same shape keeps the zoom, as when the threshold changes.
   * With `null` it goes back to the image, and any preview in progress is forgotten.
   */
  private setPreview(preview: Preview | null): void {
    const before = this.preview ?? this.image
    if (!preview) {
      this.previewId++
      this.previewKey = NO_PREVIEW
    }
    this.previewing = false
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
    const text = this.busy
      ? this.labels.processing
      : this.applyFailed
        ? this.labels.applyError
        : texts[this.loadStatus]
    this.status.textContent = text
    this.status.classList.toggle('paperpic-status-visible', text !== '')
    this.root.setAttribute('aria-busy', String(this.busy || this.previewing || this.loadStatus === 'loading'))
  }

  /** How far past its sides the image can go, so the part under the toolbar can come out from behind it. */
  private toolbarClearance(): number {
    return this.options.toolbar
      ? this.toolbar.element.offsetWidth + TOOLBAR_GAP
      : 0
  }

  private measure(): void {
    if (this.destroyed) {
      return
    }
    this.viewport = { width: this.viewportElement.clientWidth, height: this.viewportElement.clientHeight }
    this.renderer.resize(this.viewport, globalThis.devicePixelRatio || 1)
    this.applyViewport()
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

  private refresh(): void {
    const image = this.measuredImage()
    const limits = image && zoomLimits(image, this.viewport, this.view.rotation)
    const state = this.getState()

    this.toolbar.update({
      fit: this.view.fit,
      canEdit: this.options.editable && this.mode === 'view' && this.loadStatus === 'ready',
      canZoomIn: limits !== null && this.view.zoom < limits.max - ZOOM_TOLERANCE,
      canZoomOut: limits !== null && this.view.zoom > limits.min + ZOOM_TOLERANCE,
      canRotate: !this.options.editable,
      canDownload: this.options.download && this.mode === 'view' && this.loadStatus === 'ready',
    })
    this.editBar.setVisible(this.mode === 'edit' && this.options.toolbar)
    this.editBar.update({ ...state, canOpenTool: !this.previewing, adjusting: this.adjusting })
    this.session?.handle.update()
    this.root.classList.toggle('paperpic-editing', this.mode === 'edit')
    this.viewportElement.classList.toggle(
      'paperpic-viewport-pannable',
      image !== null && overflows(this.view, image, this.viewport),
    )
    this.renderer.requestPaint()
  }

  private commit(view: View): void {
    const { zoom, panX, panY, rotation, fit } = this.view
    if (view.zoom === zoom && view.panX === panX && view.panY === panY && view.rotation === rotation && view.fit === fit) {
      return
    }
    this.view = view
    this.refresh()
    this.emit('change', this.getState())
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

  private pan(deltaX: number, deltaY: number): void {
    const image = this.measuredImage()
    if (image) {
      this.commit(panBy(this.view, deltaX, deltaY, image, this.viewport, this.toolbarClearance()))
    }
  }

  private zoomAround(zoom: number, point: ViewPoint): void {
    const image = this.measuredImage()
    if (image) {
      this.commit(zoomTo(this.view, zoom, point, image, this.viewport, this.toolbarClearance()))
    }
  }

  private stepZoom(factor: number): void {
    this.zoomTo(this.view.zoom * factor)
    if (this.measuredImage()) {
      this.status.textContent = this.labels.zoomLevel(Math.round(this.view.zoom * 100))
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
        this.stepZoom(ZOOM_STEP)
        return true
      case 'zoomOut':
        this.stepZoom(1 / ZOOM_STEP)
        return true
      case 'fit':
        this.fit('image')
        return true
      case 'pan':
        this.pan(command.deltaX, command.deltaY)
        return true
      case 'undo':
        this.undo()
        return editing
      case 'redo':
        this.redo()
        return editing
      case 'cancel':
        if (this.session) {
          // A selected corner lets go first, and the next Esc closes the tool
          if (!this.session.handle.escape?.()) {
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
        if (this.session && this.viewportElement.contains(target as Node)) {
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
