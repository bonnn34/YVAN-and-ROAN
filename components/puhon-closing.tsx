"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { useReducedMotion } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { StoryGlyphText } from "@/lib/story-glyph-text"


const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const BURGUNDY = "var(--color-welcome-navy)"
const ROSE = "#1A3A6E"
const INK = "#002059" // soft cocoa for the long verse line — gentler than burgundy, still high contrast
const QUOTE_MARK = "color-mix(in srgb, #F7B7A3 70%, transparent)"
// Soft ivory edge keeps burgundy text crisp over pink or photos
const glow = "0 1px 0 rgb(255 250 247 / 90%), 0 0 14px rgb(255 250 247 / 85%)"

// Two looks: burgundy on light pink (love story) or ivory over photos (Snap & Share banner)
const TONES = {
  dark: {
    title: BURGUNDY,
    accent: ROSE,
    lead: BURGUNDY,
    body: INK,
    mark: QUOTE_MARK,
    rule: "#F28F75",
    shadow: glow,
  },
  light: {
    title: "#FFFAF7",
    accent: "#F7B7A3",
    lead: "#FFFAF7",
    body: "rgb(255 250 247 / 94%)",
    mark: "rgb(247 183 163 / 75%)",
    rule: "rgb(247 183 163 / 85%)",
    // Layered burgundy shadow: crisp edge plus a soft halo so ivory reads on any photo
    shadow:
      "0 1px 2px rgb(0 32 89 / 85%), 0 2px 8px rgb(0 32 89 / 60%), 0 0 22px rgb(0 32 89 / 45%)",
  },
} as const

// "Puhon" — big word, hashtag, then the verse. Text comes from loveStory.closing* in site.ts.
export function PuhonText({ className = "", tone = "dark" }: { className?: string; tone?: keyof typeof TONES }) {
  const t = TONES[tone]
  const { loveStory } = useSiteConfig()
  const { closingEyebrow, closingHashtag, closingQuoteLead, closingQuote, closingCitation } = loveStory

  return (
    <div className={`mx-auto max-w-xl text-center ${className}`}>
      {closingEyebrow ? (
        <p
          className={`${theSeasons.className} uppercase leading-[0.9] tracking-[0.12em]`}
          style={{ color: t.title, textShadow: t.shadow, fontSize: "clamp(3rem, 15vw, 6rem)" }}
        >
          {closingEyebrow}
        </p>
      ) : null}
      {closingHashtag ? (
        <p
          className={`${cinzel.className} mt-3 break-words text-[0.8rem] font-bold tracking-[0.06em] sm:mt-4 sm:text-base md:text-lg`}
          style={{ color: t.accent, textShadow: t.shadow }}
        >
          {closingHashtag}
        </p>
      ) : null}
      <blockquote className="relative mx-auto mt-6 max-w-lg px-7 pt-6 pb-2 sm:mt-8 sm:px-12 sm:pt-8">
        {/* Large open / close quotation marks framing the verse */}
        <span
          aria-hidden
          className={`${theSeasons.className} pointer-events-none absolute left-0 top-0 select-none leading-none`}
          style={{ color: t.mark, textShadow: tone === "light" ? t.shadow : undefined, fontSize: "clamp(3.5rem, 13vw, 5.5rem)" }}
        >
          &ldquo;
        </span>
        <span
          aria-hidden
          className={`${theSeasons.className} pointer-events-none absolute -bottom-9 right-0 select-none leading-none sm:-bottom-12`}
          style={{ color: t.mark, textShadow: tone === "light" ? t.shadow : undefined, fontSize: "clamp(3.5rem, 13vw, 5.5rem)" }}
        >
          &rdquo;
        </span>
        {closingQuoteLead ? (
          <p
            className="font-goudy-italic text-[0.95rem] font-semibold not-italic leading-snug sm:text-lg md:text-xl"
            style={{ color: t.lead, textShadow: t.shadow }}
          >
            <StoryGlyphText text={closingQuoteLead} />
          </p>
        ) : null}
        <p
          className="font-goudy-italic mt-1.5 text-[0.9rem] italic leading-relaxed sm:text-base md:text-[1.05rem]"
          style={{ color: t.body, textShadow: t.shadow }}
        >
          <StoryGlyphText text={closingQuote} />
        </p>
      </blockquote>
      {closingCitation ? (
        <p className="mt-5 flex items-center justify-center gap-2.5 sm:mt-5 sm:gap-3">
          <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to right, transparent, ${t.rule})` }} />
          <cite
            className={`${cinzel.className} text-[0.68rem] font-semibold not-italic uppercase tracking-[0.16em] sm:text-xs md:text-sm`}
            style={{ color: t.accent, textShadow: t.shadow }}
          >
            <StoryGlyphText text={closingCitation} />
          </cite>
          <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to left, transparent, ${t.rule})` }} />
        </p>
      ) : null}
    </div>
  )
}

// Same text over photos that slowly crossfade (snapShare.puhon in site.ts)
export function PuhonBanner() {
  const { snapShare } = useSiteConfig()
  const { show, images, intervalMs } = snapShare.puhon
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduceMotion || images.length < 2) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % images.length), intervalMs)
    return () => window.clearInterval(id)
  }, [images.length, intervalMs, reduceMotion])

  if (!show) return null

  return (
    <div
      className="relative isolate overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
      style={{
        boxShadow:
          "0 0 0 1px color-mix(in srgb, #8E9AB8 45%, transparent), 0 0 0 6px rgb(255 250 247 / 35%), 0 26px 50px -28px color-mix(in srgb, #002059 45%, transparent)",
      }}
    >
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden
          className="absolute inset-0 -z-20 transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 1152px"
            className="object-cover transition-transform ease-out"
            style={{
              // Slow drift while a photo is showing
              transform: i === active && !reduceMotion ? "scale(1.08)" : "scale(1)",
              transitionDuration: `${intervalMs + 1800}ms`,
            }}
          />
        </div>
      ))}
      {/* Burgundy wash — deeper in the middle where the text sits, so ivory text reads while the photos stay visible */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(85% 70% at 50% 50%, rgb(0 32 89 / 52%) 0%, rgb(0 32 89 / 34%) 60%, rgb(0 32 89 / 22%) 100%), linear-gradient(180deg, rgb(0 32 89 / 10%) 0%, rgb(0 32 89 / 25%) 100%)",
        }}
      />
      <PuhonText tone="light" className="px-5 py-14 sm:px-10 sm:py-20 md:py-24" />
    </div>
  )
}
