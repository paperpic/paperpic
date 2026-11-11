import type { Tool } from '../types'
import { constrainToRectangle, CornerEditor, initialCorners } from '../corners'

/** Keeps a rectangle of the image, which the user adjusts by its corners. */
export const cropTool: Tool = {
  id: 'crop',
  hint: 'cropHint',
  actions: [
    {
      id: 'crop',
      run: context => context.openTool('crop'),
    },
  ],
  activate(host) {
    const frame = host.frameSize()
    const toolbarCorner = host.toolbarCorner()
    const editor = new CornerEditor(
      host,
      initialCorners(frame, toolbarCorner && host.viewportToFrame(toolbarCorner)),
      constrainToRectangle,
    )
    return {
      focus: () => editor.focus(),
      update: () => editor.update(),
      drawOverlay: context => editor.drawOverlay(context),
      deactivate: () => editor.deactivate(),
      tap: point => editor.place(point),
      escape: () => editor.deselect(),
      confirm() {
        const [topLeft, , bottomRight] = editor.points
        const rect = {
          x: topLeft.x / frame.width,
          y: topLeft.y / frame.height,
          width: (bottomRight.x - topLeft.x) / frame.width,
          height: (bottomRight.y - topLeft.y) / frame.height,
        }
        return rect.width >= 1 && rect.height >= 1
          ? null
          : { type: 'crop', rect }
      },
    }
  },
}
