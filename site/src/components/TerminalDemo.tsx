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
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const cssId = useId().replace(/:/g, '')

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
      if (styleRef.current) {
        styleRef.current.remove()
        styleRef.current = null
      }
    }
  }, [lines, title, startDelay, typeDelay, lineDelay, cssId])

  const titleText = title || 'bash'
  const heightPx = typeof height === 'number' ? `${height}px` : height

  return (
    <>
      <style>{`
        .termynal-shell {
          background: #252a33;
          border-radius: 8px;
          font-family: 'Fira Mono', Consolas, Menlo, Monaco, 'Courier New', monospace;
          font-size: 15px;
          color: #eee;
          position: relative;
          width: 100%;
          max-width: 100%;
          margin: 1.5rem 0;
        }
        .termynal-shell__titlebar {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 0 15px;
          flex-shrink: 0;
        }
        .termynal-shell__dots {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 8px;
        }
        .termynal-shell__dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .termynal-shell__title {
          color: #a2a2a2;
          font-size: 13px;
        }
        .termynal-shell__body {
          overflow-y: auto;
          padding: 12px 24px 16px;
        }
        /* Override termynal defaults — we handle chrome ourselves */
        .termynal-shell__body[data-termynal] {
          background: transparent;
          border-radius: 0;
          padding: 0;
          width: auto;
          max-width: none;
          position: static;
          font-size: inherit;
          color: inherit;
          font-family: inherit;
        }
        .termynal-shell__body[data-termynal]::before,
        .termynal-shell__body[data-termynal]::after {
          display: none;
        }
        .termynal-shell__body[data-termynal] pre {
          line-height: 1.4;
          margin: 0;
          padding-left: 8px;
          white-space: pre-wrap;
          word-break: break-all;
        }
        /* Scrollbar styling */
        .termynal-shell__body::-webkit-scrollbar {
          width: 6px;
        }
        .termynal-shell__body::-webkit-scrollbar-track {
          background: transparent;
        }
        .termynal-shell__body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 3px;
        }
      `}</style>
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
