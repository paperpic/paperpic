import type { PaperPicOptions } from '@paperpic/core'
import type { PaperPicProps } from '../types'
import { PaperPic as Viewer } from '@paperpic/core'
import { useImperativeHandle, useLayoutEffect, useRef } from 'react'

type Handlers = Pick<PaperPicProps, 'onApply' | 'onChange' | 'onDownload' | 'onError' | 'onLoad'>

/**
 * A document image viewer and editor. It fills its parent element, which needs a height.
 *
 * @example
 * <PaperPic src="/receipt.jpg" alt="A receipt" onApply={({ blob }) => upload(blob)} />
 */
export function PaperPic({
  ref,
  className,
  style,
  onApply,
  onChange,
  onDownload,
  onError,
  onLoad,
  alt,
  aspectRatio,
  download,
  editable,
  filename,
  labels,
  maxOutputSize,
  output,
  softness,
  src,
  toolbar,
  tools,
  wheelZoom,
}: PaperPicProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<Viewer | null>(null)
  const handlersRef = useRef<Handlers>({})

  // The listeners of the viewer read the latest handlers, so passing new functions does not recreate it
  useLayoutEffect(() => {
    handlersRef.current = {
      onApply,
      onChange,
      onDownload,
      onError,
      onLoad,
    }
  })

  // Layout effects run in order, so the viewer exists before the options and the ref reach it
  useLayoutEffect(() => {
    const pic = new Viewer(hostRef.current!)
    pic.on('apply', payload => handlersRef.current.onApply?.(payload))
    pic.on('change', payload => handlersRef.current.onChange?.(payload))
    pic.on('download', payload => handlersRef.current.onDownload?.(payload))
    pic.on('error', payload => handlersRef.current.onError?.(payload))
    pic.on('load', payload => handlersRef.current.onLoad?.(payload))
    instanceRef.current = pic
    return () => {
      pic.destroy()
      instanceRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    // Every option goes, with undefined for the absent ones, so a removed prop goes back to its default
    const options = {
      alt,
      aspectRatio,
      download,
      editable,
      filename,
      labels,
      maxOutputSize,
      output,
      softness,
      src,
      toolbar,
      tools,
      wheelZoom,
    } satisfies Record<keyof PaperPicOptions, unknown>
    instanceRef.current?.setOptions(options)
  }, [
    alt,
    aspectRatio,
    download,
    editable,
    filename,
    labels,
    maxOutputSize,
    output,
    softness,
    src,
    toolbar,
    tools,
    wheelZoom,
  ])

  useImperativeHandle(ref, () => instanceRef.current!, [])

  return (
    <div
      ref={hostRef}
      className={className
        ? `paperpic-host ${className}`
        : 'paperpic-host'}
      style={style}
    />
  )
}
