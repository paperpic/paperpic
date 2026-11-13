// Bundled into this package's style.css: with strict installs, consumers cannot reach @paperpic/core/style.css
import '../../core/src/styles/index.css'

export { default as PaperPic } from './components/PaperPic.vue'
export type { PaperPicInstance, PaperPicProps } from './types'
// With strict installs, consumers cannot reach the types of @paperpic/core, so every one of them is here
export type {
  ExportedImage,
  Fit,
  PaperPicDownload,
  PaperPicEvents,
  PaperPicIcons,
  PaperPicLabels,
  PaperPicOptions,
  PaperPicOutput,
  PaperPicSource,
  PaperPicState,
  Rotation,
  Size,
  ToolId,
  ViewPoint,
} from '@paperpic/core'
