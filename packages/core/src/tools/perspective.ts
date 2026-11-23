import type { Operation } from '../pipeline/operations'
import type { Quad } from '../processing/types'
import type { Tool } from './types'
import { estimateAspectRatio, estimateOutputSize } from '../processing/homography'
import { paperAspectRatio } from '../processing/paper'
import { constrainToConvex, CornerEditor, cornerSession, initialCorners } from './corners'

/**
 * Straightens a document, whose 4 corners the user places on the photo. The proportions of the result come from the
 * paper size of its panel, or else from the consumer or an estimate. Done waits until a corner moves, because the
 * corners start on no document.
 */
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
    const editor = new CornerEditor(host, initialCorners(frame), constrainToConvex)
    const confirm = (): Operation | null => {
      const corners = editor.points
      const [topLeft, topRight, bottomRight, bottomLeft] = corners
      const isWholeFrame = topLeft.x === 0 && topLeft.y === 0
        && topRight.x === frame.width && topRight.y === 0
        && bottomRight.x === frame.width && bottomRight.y === frame.height
        && bottomLeft.x === 0 && bottomLeft.y === frame.height
      const { photo, origin } = host.photoFrame()
      const inPhoto = corners.map(({ x, y }) => ({ x: x + origin.x, y: y + origin.y })) as unknown as Quad
      const estimate = estimateAspectRatio(inPhoto, photo)
      const size = host.paperSize()
      const aspectRatio = size === 'auto'
        ? host.aspectRatio() ?? estimate
        : paperAspectRatio(size, estimate)
      if (isWholeFrame) {
        // The whole image has nothing to straighten, but a paper size says that the image is that paper
        const result = estimateOutputSize(corners, frame, { aspectRatio })
        if (size === 'auto' || (result.width === frame.width && result.height === frame.height)) {
          return null
        }
      }
      return {
        type: 'perspective',
        quad: corners.map(({ x, y }) => ({ x: x / frame.width, y: y / frame.height })) as unknown as Quad,
        aspectRatio,
      }
    }
    return {
      ...cornerSession(editor, confirm),
      canConfirm: () => editor.moved,
    }
  },
}
