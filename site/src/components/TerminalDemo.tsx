import { useRef, useEffect, useId } from 'react'
// @ts-expect-error — termynal has no type declarations
import Termynal from 'termynal'
import '../../node_modules/termynal/dist/style.css'

export interface TerminalLine {
  type?: 'input' | 'progress'
  value?: string
  prompt?: string
  delay?: number
}

interface TerminalDemoProps {
  lines: TerminalLine[]
  title?: string
  startDelay?: number
  typeDelay?: number
  lineDelay?: number
}

export default function TerminalDemo({
  lines,
  title,
  startDelay = 600,
  typeDelay = 50,
  lineDelay = 1500,
}: TerminalDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const cssId = useId().replace(/:/g, '')

  useEffect(() => {
    // Reset on remount (React StrictMode or page navigation)
    initializedRef.current = false

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !initializedRef.current) {
          initializedRef.current = true
          observer.disconnect()

          // Build line data — fast delay for output, normal typing for input
          const lineData = lines.map((line) => {
            const entry: Record<string, unknown> = {}
            if (line.type) entry.type = line.type
            if (line.value !== undefined) entry.value = line.value
            if (line.type === 'input') {
              entry.prompt = line.prompt ?? '$'
            } else if (line.type !== 'progress') {
              // Output lines appear fast (not typed char by char)
              entry.delay = line.delay ?? 300
            }
            if (line.delay !== undefined) entry.delay = line.delay
            return entry
          })

          // Set custom title via scoped CSS class
          if (title) {
            el.classList.add(cssId)
            const style = document.createElement('style')
            style.textContent = `.${cssId}[data-termynal]::after { content: "${title}"; }`
            document.head.appendChild(style)
            styleRef.current = style
          }

          const t = new Termynal(el, { startDelay, typeDelay, lineDelay }, lineData)
          t.init()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      initializedRef.current = false
      if (styleRef.current) {
        styleRef.current.remove()
        styleRef.current = null
      }
    }
  }, [lines, title, startDelay, typeDelay, lineDelay, cssId])

  return (
    <>
      <style>{`
        .termynal-wrapper[data-termynal] {
          border-radius: 8px;
          font-size: 15px;
          width: 100%;
          max-width: 100%;
          margin: 1.5rem 0;
        }
        .termynal-wrapper[data-termynal] pre {
          line-height: 1.4;
          margin: 0;
        }
      `}</style>
      <div
        ref={containerRef}
        className="termynal-wrapper"
        data-termynal=""
      />
    </>
  )
}
