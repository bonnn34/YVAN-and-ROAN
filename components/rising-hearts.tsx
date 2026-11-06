"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

// Small pink hearts drifting up behind a section (globals.css → .story-rise)
// Used by the love story chapters, the gallery section / page and the details section.
const RISE_COLORS = [
  "var(--color-motif-blush)",
  "var(--color-highlight-deep)",
  "#FBC8AF",
  "color-mix(in srgb, var(--color-highlight-deep) 55%, white)",
] as const

export const HEART_PATH =
  "M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.5 5c2 0 3.5 1.1 4.3 2.6h2.4C14 6.1 15.5 5 17.5 5 21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"

// `seed` shifts positions / timing so stacked bands don't look identical
const makeHearts = (count: number, seed = 0) =>
  Array.from({ length: count }, (_, n) => {
    const i = n + seed * 7
    return {
      left: `${((i * 37 + 9) % 94) + 3}%`,
      size: 6 + ((i * 5) % 7) * 1.6,
      delay: -((i * 1.3) % 12),
      duration: 10 + (i % 5) * 2.2,
      drift: `${((i % 2 ? 1 : -1) * (8 + (i % 4) * 6))}px`,
      tilt: `${(i % 2 ? 1 : -1) * (6 + (i % 3) * 6)}deg`,
      peak: 0.25 + ((i * 7) % 6) * 0.11,
      color: RISE_COLORS[i % RISE_COLORS.length],
    }
  })

type Heart = ReturnType<typeof makeHearts>[number]

function HeartLayer({ hearts, className = "", style }: { hearts: Heart[]; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`story-rise ${className}`} style={style} aria-hidden>
      {hearts.map((h, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="story-rise__heart"
          style={{
            left: h.left,
            width: h.size,
            height: h.size,
            fill: h.color,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            ["--drift" as string]: h.drift,
            ["--tilt" as string]: h.tilt,
            ["--peak" as string]: h.peak,
          }}
        >
          <path d={HEART_PATH} />
        </svg>
      ))}
    </div>
  )
}

type RisingHeartsProps = {
  /** More hearts for wide / full-page backdrops. */
  dense?: boolean
  /** Tall sections: stack one band of hearts per screen height so they show from
   *  top to bottom. The bands scroll with the content (no parallax). */
  fill?: boolean
  className?: string
}

export function RisingHearts({ dense = false, fill = false, className = "" }: RisingHeartsProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [bands, setBands] = useState(1)
  const count = dense ? 24 : 16

  useEffect(() => {
    const el = ref.current
    if (!fill || !el) return
    const update = () => setBands(Math.max(1, Math.ceil(el.offsetHeight / window.innerHeight)))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [fill])

  if (reduceMotion) return null
  if (!fill) return <HeartLayer hearts={makeHearts(count)} className={className} />

  // Each band rises from its own bottom edge; bands overlap upward, the outer layer clips
  return (
    <div ref={ref} className={`story-rise ${className}`} aria-hidden>
      {Array.from({ length: bands }, (_, b) => (
        <HeartLayer
          key={b}
          hearts={makeHearts(count, b)}
          className="story-rise--band"
          style={{ top: "auto", bottom: `${(b * 100) / bands}%`, height: `${100 / bands}%` }}
        />
      ))}
    </div>
  )
}
