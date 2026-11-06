import type { KeyCommand } from './input/keyboard'
import type { ExportedImage, PaperPicOutput } from './pipeline/export'
import type { Operation } from './pipeline/operations'
import type { LoadedImage } from './render/load-image'
import type { Scene } from './render/renderer'
import type { Rotation } from './rotation'
import type { History } from './state/history'
import type { Fit, Size, View, ViewPoint } from './state/view'
import type { ToolContext, ToolId } from './tools/types'
import type { PaperPicLabels } from './ui/labels'
import { attachGestures } from './input/gestures'
import { keyToCommand } from './input/keyboard'
import { exportImage } from './pipeline/export'
import { netRotation, toPipelineSteps } from './pipeline/operations'
import { PipelineRunner } from './pipeline/run'
import { loadImage } from './render/load-image'
import { Renderer } from './render/renderer'
import { addToHistory, createHistory, redoHistory, undoHistory } from './state/history'
import { createView, fitView, overflows, panBy, resizeView, rotateView, setRotation, zoomLimits, zoomTo } from './state/view'
import { ALL_TOOL_IDS, TOOLS } from './tools'
import { EditBar } from './ui/edit-bar'
import { DEFAULT_LABELS } from './ui/labels'
import { Toolbar } from './ui/toolbar'

const ZOOM_STEP = 1.25
const ZOOM_TOLERANCE = 0.001
const TOOLBAR_GAP = 16

/** The image to show: a URL from the same origin, or a file attached on the client. */
export type PaperPicSource = string | Blob

export interface PaperPicOptions {
  /** The image to show. Passing the same value again does not reload it: use `reload()`. */
  src?: PaperPicSource
  /** Describes the image for screen readers. */
  alt?: string
  /**
   * Whether the image can be edited. With `false` it is a read-only viewer, whose toolbar can also rotate the image.
   * That rotation only changes the display.
   */
  editable?: boolean
  /** Whether to show the built-in toolbar and edit bar. Without them, build your own with the public methods. */
  toolbar?: boolean
  /** Which tools the edit bar offers. By default, all of them. */
  tools?: readonly ToolId[]
  /** Whether the wheel zooms. Turn it off when the viewer sits in a long page. */
  wheelZoom?: boolean
  /** The format of the edited image. By default, the format of the source. */
  output?: PaperPicOutput
  /** The longest side of the edited image, in pixels. By default, it keeps the full resolution. */
  maxOutputSize?: number
  /** Replaces any of the texts, which are in English by default. */
  labels?: Partial<PaperPicLabels>
}

/** What the viewer is showing. */
export interface PaperPicState {
  status: 'empty' | 'loading' | 'ready' | 'error'
  /** Whether the user is viewing or editing the image. */
  mode: 'view' | 'edit'
  /** The size of the loaded image in pixels, or `null` if there is none. */
  image: Size | null
  /** Screen pixels per image pixel. */
  zoom: number
  /** The fit in effect, or `null` once the user has zoomed by hand. */
  fit: Fit | null
  rotation: Rotation
  canUndo: boolean
  canRedo: boolean
  /** Whether there are changes to apply. Rotations that cancel out are no change. */
  canApply: boolean
  /** Whether the changes are being applied. */
  busy: boolean
}

export interface PaperPicEvents {
  /** The image is ready. */
  load: { width: number, height: number }
  /** The image could not be loaded, or the changes could not be applied. */
  error: { error: Error }
  /** The user changed the view or the edit. `setOptions()` never triggers it. */
  change: PaperPicState
  /** The user applied the changes. The result is already on display. */
  apply: ExportedImage
}

type Listener<Name extends keyof PaperPicEvents> = (payload: PaperPicEvents[Name]) => void
type Listeners = { [Name in keyof PaperPicEvents]: Set<Listener<Name>> }
type ResolvedOptions = Required<Omit<PaperPicOptions, 'src' | 'labels' | 'output' | 'maxOutputSize'>> & Pick<PaperPicOptions, 'labels' | 'output' | 'maxOutputSize'>

const DEFAULT_OPTIONS: ResolvedOptions = {
  alt: '',
  editable: true,
  toolbar: true,
  tools: ALL_TOOL_IDS,
  wheelZoom: true,
  output: undefined,
  maxOutputSize: undefined,
  labels: undefined,
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
  private readonly status: HTMLElement
  private readonly toolbar: Toolbar
  private readonly editBar: EditBar
  private readonly renderer: Renderer
  private readonly runner = new PipelineRunner()
  private readonly listeners: Listeners = {
    load: new Set(),
    error: new Set(),
    change: new Set(),
    apply: new Set(),
  }

  private readonly cleanups: (() => void)[] = []

  private options: ResolvedOptions = { ...DEFAULT_OPTIONS }
  private labels: PaperPicLabels = DEFAULT_LABELS
  private source: PaperPicSource | undefined
  private image: LoadedImage | null = null
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
    this.canvas.setAttribute('role', 'img')
    this.viewportElement.append(this.canvas)

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
      },
      this.labels,
    )

    const toolContext: ToolContext = {
      addOperation: operation => this.addOperation(operation),
    }
    this.editBar = new EditBar(
      {
        cancel: () => this.cancel(),
        undo: () => this.undo(),
        redo: () => this.redo(),
        apply: () => this.apply(),
        runTool: run => run(toolContext),
      },
      TOOLS,
      this.labels,
    )

    stage.append(this.viewportElement, this.toolbar.element, this.status)
    this.root.append(stage, this.editBar.element)
    container.append(this.root)

    this.renderer = new Renderer(this.canvas, () => this.scene())

    this.cleanups.push(attachGestures(this.viewportElement, {
      onPan: (deltaX, deltaY) => this.pan(deltaX, deltaY),
      onZoom: (factor, point) => this.zoomAround(this.view.zoom * factor, point),
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
    this.editBar.setTools(next.tools)
    this.viewportElement.setAttribute('aria-label', this.labels.viewer)
    this.canvas.setAttribute('aria-label', next.alt)
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
    return {
      status: this.loadStatus,
      mode: this.mode,
      image: this.image && { width: this.image.width, height: this.image.height },
      zoom: this.view.zoom,
      fit: this.view.fit,
      rotation: this.view.rotation,
      canUndo: this.history.done.length > 0,
      canRedo: this.history.undone.length > 0,
      canApply: toPipelineSteps(this.history.done).length > 0,
      busy: this.busy,
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
    if (this.mode === 'edit') {
      this.addOperation({ type: 'rotate', direction })
      return
    }
    const image = this.measuredImage()
    if (image && !this.options.editable) {
      this.commit(rotateView(this.view, direction, image, this.viewport))
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
    if (this.mode === 'edit' && !this.busy && this.history.done.length > 0) {
      this.setHistory(undoHistory(this.history))
    }
  }

  /** Brings back the last edit undone. */
  redo(): void {
    if (this.mode === 'edit' && !this.busy && this.history.undone.length > 0) {
      this.setHistory(redoHistory(this.history))
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
    if (this.mode !== 'edit' || this.busy || !image || steps.length === 0) {
      return
    }

    const id = this.loadId
    this.busy = true
    this.applyFailed = false
    this.showStatus()
    this.refresh()

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
      this.history = createHistory()
      this.setImage(loaded, 'ready')
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
    this.renderer.destroy()
    this.runner.destroy()
    this.image?.release()
    this.image = null
    this.root.remove()
    for (const listeners of Object.values(this.listeners)) {
      listeners.clear()
    }
  }

  private scene(): Scene | null {
    return this.image && {
      image: this.image.element,
      imageSize: this.image,
      view: this.view,
      viewport: this.viewport,
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
    this.mode = 'view'
    this.busy = false
    this.applyFailed = false
    this.history = createHistory()
    this.syncRotation()
  }

  private addOperation(operation: Operation): void {
    if (this.mode === 'edit' && !this.busy) {
      this.setHistory(addToHistory(this.history, operation))
    }
  }

  private setHistory(history: History<Operation>): void {
    this.history = history
    this.applyFailed = false
    this.syncRotation()
    this.showStatus()
    this.refresh()
    this.emit('change', this.getState())
  }

  /** The edits decide the rotation on display, so Undo and Cancel restore it. */
  private syncRotation(): void {
    const image = this.measuredImage()
    if (image && this.options.editable) {
      this.view = setRotation(this.view, netRotation(this.history.done), image, this.viewport)
    }
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
    this.root.setAttribute('aria-busy', String(this.busy || this.loadStatus === 'loading'))
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

  /** The image, once the viewer has a size to show it in. A hidden container has none. */
  private measuredImage(): LoadedImage | null {
    return this.viewport.width > 0 && this.viewport.height > 0
      ? this.image
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
    })
    this.editBar.setVisible(this.mode === 'edit' && this.options.toolbar)
    this.editBar.update(state)
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
        // Without the built-in bar there is nowhere to ask, and a custom interface decides what Esc does
        if (editing && this.options.toolbar) {
          this.editBar.requestCancel({
            cancel: () => this.cancel(),
          })
          return true
        }
        return false
      case 'apply':
        // Enter on a button must press that button
        if (editing && target === this.viewportElement) {
          this.apply()
          return true
        }
        return false
    }
  }
}
