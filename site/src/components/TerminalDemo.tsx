import { useRef, useEffect } from 'react'
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

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !initializedRef.current) {
          initializedRef.current = true

          const lineData = lines.map((line) => {
            const entry: Record<string, unknown> = {}
            if (line.type) entry.type = line.type
            if (line.value !== undefined) entry.value = line.value
            if (line.prompt !== undefined) entry.prompt = line.prompt
            if (line.delay !== undefined) entry.delay = line.delay
            return entry
          })

          if (title) {
            const id = `termynal-${Math.random().toString(36).slice(2, 8)}`
            el.classList.add(id)
            const style = document.createElement('style')
            style.textContent = `.${id}[data-termynal]::after { content: "${title}"; }`
            document.head.appendChild(style)
          }

          const t = new Termynal(el, { startDelay, typeDelay, lineDelay }, lineData)
          t.init()

          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [lines, title, startDelay, typeDelay, lineDelay])

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
      `}</style>
      <div
        ref={containerRef}
        className="termynal-wrapper"
        data-termynal=""
      />
    </>
  )
}
