import { useRef, useEffect } from 'react'
// @ts-expect-error — termynal has no type declarations
import Termynal from 'termynal'
import '../../node_modules/termynal/dist/style.css'
import './terminalDemo.css'

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
  height?: number | string
}

export default function TerminalDemo({
  lines,
  title,
  startDelay = 600,
  typeDelay = 50,
  lineDelay = 1500,
  height = 400,
}: TerminalDemoProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Auto-scroll the container as new lines appear
  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    const obs = new MutationObserver(() => {
      inner.scrollTop = inner.scrollHeight
    })
    obs.observe(inner, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    initializedRef.current = false
    const inner = innerRef.current
    if (!inner) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !initializedRef.current) {
          initializedRef.current = true
          observer.disconnect()

          const lineData = lines.map((line) => {
            const entry: Record<string, unknown> = {}
            if (line.type) entry.type = line.type
            if (line.value !== undefined) entry.value = line.value
            if (line.type === 'input') {
              entry.prompt = line.prompt ?? '$'
            } else if (line.type !== 'progress') {
              entry.delay = line.delay ?? 300
            }
            if (line.delay !== undefined) entry.delay = line.delay
            return entry
          })

          const t = new Termynal(inner, { startDelay, typeDelay, lineDelay }, lineData)
          t.init()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(inner)

    return () => {
      observer.disconnect()
      initializedRef.current = false
    }
  }, [lines, title, startDelay, typeDelay, lineDelay])

  const titleText = title || 'bash'
  const heightPx = typeof height === 'number' ? `${height}px` : height

  return (
    <>
      <div className="termynal-shell" style={{ height: heightPx }}>
        <div className="termynal-shell__titlebar">
          <div className="termynal-shell__dots">
            <div className="termynal-shell__dot" style={{ background: '#d9515d' }} />
            <div className="termynal-shell__dot" style={{ background: '#f4c025' }} />
            <div className="termynal-shell__dot" style={{ background: '#3ec930' }} />
          </div>
          <span className="termynal-shell__title">{titleText}</span>
        </div>
        <div
          ref={innerRef}
          className="termynal-shell__body"
          data-termynal=""
          style={{ height: `calc(${heightPx} - 36px)` }}
        />
      </div>
    </>
  )
}
