import type { PlaygroundOptions } from 'playground-shared'
import { PaperPic } from '@paperpic/react'
import { createPlayground } from 'playground-shared'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createPlayground({
  name: 'React',
  mount(stage, options, { onChange, onApply }) {
    const root = createRoot(stage)
    // Strict mode mounts the viewer twice, which checks that destroy() releases everything
    const render = (props: PlaygroundOptions) => root.render(
      <StrictMode>
        <PaperPic {...props} onChange={onChange} onApply={onApply} />
      </StrictMode>,
    )

    render(options)
    return render
  },
})
