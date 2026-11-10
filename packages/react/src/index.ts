'use client'

// Bundled into this package's style.css: with strict installs, consumers cannot reach @paperpic/core/style.css
import '../../core/src/styles/index.css'

export { PaperPic } from './components/PaperPic'
export type { PaperPicInstance, PaperPicProps } from './types'
// With strict installs, consumers cannot reach the types of @paperpic/core
export type { ExportedImage, PaperPicDownload, PaperPicEvents, PaperPicLabels, PaperPicOutput, PaperPicState, ToolId } from '@paperpic/core'
