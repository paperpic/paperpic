// Bundled into this package's style.css: with strict installs, consumers cannot reach @paperpic/core/style.css
import '../../core/src/styles/index.css'

export { default as PaperPic } from './components/PaperPic.vue'
export type { PaperPicProps } from './types'
// With strict installs, consumers cannot reach the types of @paperpic/core
export type { ExportedImage, PaperPicDownload, PaperPicEvents, PaperPicIcons, PaperPicLabels, PaperPicOutput, PaperPicState, ToolId } from '@paperpic/core'
