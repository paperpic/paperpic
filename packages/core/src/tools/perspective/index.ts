import type { Quad } from '../../processing/types'
import type { Tool } from '../types'
import { estimateAspectRatio } from '../../processing/homography'
import { constrainToConvex, CornerEditor, initialCorners } from '../corners'

/** Straightens a document, whose 4 corners the user places on the photo. */
export const perspectiveTool: Tool = {
  id: 'perspective',
  hint: 'perspectiveHint',
  actions: [
    {
      id: 'perspective',
      run: context => context.openTool('perspective'),
    },
  ],
  activate(host) {
    const frame = host.frameSize()
    const toolbarCorner = host.toolbarCorner()
    const editor = new CornerEditor(
      host,
      initialCorners(frame, toolbarCorner && host.viewportToFrame(toolbarCorner)),
      constrainToConvex,
    )
    return {
      focus: () => editor.focus(),
      update: () => editor.update(),
      drawOverlay: context => editor.drawOverlay(context),
      deactivate: () => editor.deactivate(),
      tap: point => editor.place(point),
      escape: () => editor.deselect(),
      confirm() {
        const corners = editor.points
        const [topLeft, topRight, bottomRight, bottomLeft] = corners
        const isWholeFrame = topLeft.x === 0 && topLeft.y === 0
          && topRight.x === frame.width && topRight.y === 0
          && bottomRight.x === frame.width && bottomRight.y === frame.height
          && bottomLeft.x === 0 && bottomLeft.y === frame.height
        if (isWholeFrame) {
          return null
        }
        const { photo, origin } = host.photoFrame()
        const inPhoto = corners.map(({ x, y }) => ({ x: x + origin.x, y: y + origin.y })) as unknown as Quad
        return {
          type: 'perspective',
          quad: corners.map(({ x, y }) => ({ x: x / frame.width, y: y / frame.height })) as unknown as Quad,
          aspectRatio: host.aspectRatio() ?? estimateAspectRatio(inPhoto, photo),
        }
      },
    }
  },
}
