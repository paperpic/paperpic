import type { Preview } from './preview'
import type { RedactStep, ShapeStep, ToneStep } from './steps'

/** What the queue asks of the viewer. */
export interface PreviewQueueHost {
  /** Receives the failure of the latest preview. */
  failed: (cause: unknown) => void
  /** Receives the latest preview. A result that newer edits replaced never arrives here. */
  ready: (preview: Preview) => void
  /** Computes a preview of the steps, the tones and the areas that Redact covers. */
  render: (steps: ShapeStep[], tone: ToneStep | null, redaction: RedactStep | null) => Promise<Preview>
  /** Repaints the tones of the preview on display. */
  tint: (tone: ToneStep) => void
}

/**
 * Computes the previews of the edits, one at a time. While one is on its way, a newer one waits, and replaces any that
 * was already waiting, so a quick run of Undo or Flip reads the pixels twice and not once per press. It also repaints
 * the tones at most once per frame, because a ruler sends more `input` events than the screen has frames.
 */
export class PreviewQueue {
  private readonly host: PreviewQueueHost
  private id = 0
  private running = false
  private waiting: { id: number, redaction: RedactStep | null, steps: ShapeStep[], tone: ToneStep | null } | null = null
  private tintFrame: number | null = null
  private pendingTone: ToneStep | null = null
  /** Whether a preview was asked for and has not arrived yet. */
  pending = false

  constructor(host: PreviewQueueHost) {
    this.host = host
  }

  /** Asks for the preview of these edits, which replaces any asked for before. */
  request(steps: ShapeStep[], tone: ToneStep | null, redaction: RedactStep | null): void {
    const id = ++this.id
    this.pending = true
    if (this.running) {
      this.waiting = { id, steps, tone, redaction }
      return
    }
    void this.run(id, steps, tone, redaction)
  }

  /** Forgets every preview asked for, so none arrives, and any tones waiting for a frame. */
  forget(): void {
    this.id++
    this.pending = false
    this.cancelTint()
  }

  /** Repaints the tones on the next frame, with the latest ones. */
  scheduleTint(tone: ToneStep): void {
    this.pendingTone = tone
    this.tintFrame ??= requestAnimationFrame(() => {
      this.tintFrame = null
      const latest = this.pendingTone
      this.pendingTone = null
      if (latest) {
        this.host.tint(latest)
      }
    })
  }

  cancelTint(): void {
    if (this.tintFrame !== null) {
      cancelAnimationFrame(this.tintFrame)
      this.tintFrame = null
    }
    this.pendingTone = null
  }

  /** Renders one preview, and then the one that waits, unless newer edits or `forget()` made it outdated. */
  private async run(id: number, steps: ShapeStep[], tone: ToneStep | null, redaction: RedactStep | null): Promise<void> {
    this.running = true
    try {
      await this.render(id, steps, tone, redaction)
    }
    finally {
      this.running = false
      const waiting = this.waiting
      this.waiting = null
      if (waiting?.id === this.id) {
        void this.run(waiting.id, waiting.steps, waiting.tone, waiting.redaction)
      }
    }
  }

  private async render(id: number, steps: ShapeStep[], tone: ToneStep | null, redaction: RedactStep | null): Promise<void> {
    let preview: Preview
    try {
      preview = await this.host.render(steps, tone, redaction)
    }
    catch (cause) {
      if (id === this.id) {
        this.pending = false
        this.host.failed(cause)
      }
      return
    }
    if (id !== this.id) {
      preview.release()
      return
    }
    this.pending = false
    this.host.ready(preview)
  }
}
