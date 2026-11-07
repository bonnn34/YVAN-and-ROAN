"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { parseWeddingDate } from "@/lib/wedding-date"
import Image from "next/image"
import { InvitePhotoBackdrop, PhotoBackground } from "@/components/loader/invite-photo-backdrop"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import "@/components/loader/loading-screen.css"


const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

const entryEase = [0.22, 1, 0.36, 1] as const
const heroTitleSize = {
  main: "clamp(3.35rem, min(16vw, 18cqi), 8.25rem)",
  script: "clamp(2.55rem, min(12vw, 14cqi), 5.6rem)",
  overlap: "clamp(-0.95rem, min(-3.8vw, -3.2cqi), -1.85rem)",
} as const

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function formatCeremonyTimePhrase(raw: string) {
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i)
  if (!match) return raw

  let hour24 = Number(match[1])
  const minutes = match[2] ?? "00"
  const meridiem = (match[3] || "").toUpperCase()

  if (meridiem === "PM" && hour24 !== 12) hour24 += 12
  if (meridiem === "AM" && hour24 === 12) hour24 = 0

  const period =
    hour24 >= 17 ? "in the evening" : hour24 >= 12 ? "in the afternoon" : "in the morning"

  let displayHour = hour24 % 12
  if (displayHour === 0) displayHour = 12

  return `${displayHour}:${minutes} ${period}`
}

// "ZION EVENT PLACE" → "Zion Event Place" (the venue is stored in caps for other sections)
function toTitleCase(text: string) {
  return text.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
}

function useCeremonyCountdown() {
  const siteConfig = useSiteConfig()

  const targetTimestamp = useMemo(() => {
    const parsedDate = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date)
    const monthMap: Record<string, string> = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    }
    const monthKey =
      parsedDate.month.charAt(0) + parsedDate.month.slice(1).toLowerCase()
    const monthNum = monthMap[monthKey] ?? "11"
    const timeRaw = siteConfig.ceremony.time ?? siteConfig.wedding.time
    const timeMatch = timeRaw.match(/(\d+):(\d+)\s*(AM|PM)/i)

    let hour = 9
    let minutes = 0
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10)
      minutes = parseInt(timeMatch[2], 10)
      const ampm = timeMatch[3].toUpperCase()
      if (ampm === "PM" && hour !== 12) hour += 12
      if (ampm === "AM" && hour === 12) hour = 0
    }

    return new Date(
      Date.UTC(
        parseInt(parsedDate.year, 10),
        parseInt(monthNum, 10) - 1,
        parseInt(parsedDate.day, 10),
        hour - 8,
        minutes,
        0,
      ),
    ).getTime()
  }, [
    siteConfig.ceremony.date,
    siteConfig.ceremony.time,
    siteConfig.wedding.date,
    siteConfig.wedding.time,
  ])

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const tick = () => {
      const difference = targetTimestamp - Date.now()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [targetTimestamp])

  return timeLeft
}

function CountdownUnit({
  value,
  label,
  pad = false,
}: {
  value: number
  label: string
  pad?: boolean
}) {
  const display = pad ? pad2(value) : String(value)

  return (
    <div className="flex min-w-[3rem] flex-1 flex-col items-center sm:min-w-[3.5rem]">
      <span
        className={`${cinzel.className} home-hero-countdown-value text-[clamp(1.2rem,5.4vw,1.75rem)] font-semibold leading-none tabular-nums tracking-[0.04em]`}
      >
        {display}
      </span>
      <span
        className={`${cinzel.className} home-hero-countdown-label mt-1.5 text-[0.48rem] font-medium uppercase tracking-[0.16em] sm:mt-2 sm:text-[0.54rem]`}
      >
        {label}
      </span>
    </div>
  )
}

function HeroCountdown() {
  const timeLeft = useCeremonyCountdown()
  const colonClass = `${cinzel.className} home-hero-countdown-value shrink-0 self-start px-0.5 text-[clamp(1.2rem,5.4vw,1.75rem)] font-semibold leading-none tabular-nums sm:px-1`

  return (
    <div className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-5">
      <p
        className={`${cinzel.className} home-hero-countdown-heading text-center text-[0.58rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.64rem] sm:tracking-[0.26em]`}
      >
        Time left til we say I do
      </p>
      <div
        className="mx-auto mt-2 flex max-w-md items-start justify-center sm:mt-2.5 sm:max-w-lg"
        aria-live="polite"
        aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
      >
        <CountdownUnit value={timeLeft.days} label="Days" />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.hours} label="Hours" pad />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.minutes} label="Minutes" pad />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.seconds} label="Seconds" pad />
      </div>
    </div>
  )
}

export function Hero() {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const isPlain = loading.display === "plain"
  // Decorations live in content/site.ts → homeHero
  const homeHero = siteConfig.homeHero ?? defaultSiteConfig.homeHero
  const cornerDecos = homeHero.decos ?? defaultSiteConfig.homeHero.decos
  const showFrame = homeHero.showFrame ?? defaultSiteConfig.homeHero.showFrame
  const coverVine = homeHero.coverVine ?? defaultSiteConfig.homeHero.coverVine
  const backgroundPhotos = loading.backgroundPhotos ?? []
  // Same sliding photo marquee as the loader and envelope (plain mode)
  const plainPhotos = useMemo(() => backgroundPhotos.map((src) => encodeURI(src)), [backgroundPhotos])
  const backgroundPhotosDesktop = loading.backgroundPhotosDesktop ?? []
  const plainPhotosDesktop = useMemo(
    () => backgroundPhotosDesktop.map((src) => encodeURI(src)),
    [backgroundPhotosDesktop],
  )
  // Plain mode cover: one natural couple photograph beside the invitation wording
  const coverPhoto = loading.coverPhoto ?? defaultSiteConfig.loadingScreen.coverPhoto
  const coverPhotoAlt = loading.coverPhotoAlt ?? defaultSiteConfig.loadingScreen.coverPhotoAlt
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 40)
    return () => window.clearTimeout(id)
  }, [])

  const parsedDate = useMemo(
    () => parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date),
    [siteConfig.ceremony.date, siteConfig.wedding.date],
  )

  const ceremonyTimePhrase = formatCeremonyTimePhrase(
    siteConfig.ceremony.time ?? siteConfig.wedding.time,
  )
  const ceremonyName = toTitleCase(siteConfig.ceremony.location || siteConfig.wedding.venue || "")

  const fadeUp = (delay: number) => {
    if (reduceMotion) {
      return { initial: false as const, animate: { opacity: 1, y: 0 } }
    }
    return {
      initial: { opacity: 0, y: 18 },
      animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
      transition: { duration: 0.9, delay, ease: entryEase },
    }
  }

  return (
    <section
      id="home"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} home-hero relative -mt-12 flex min-h-[100dvh] w-full flex-col overflow-hidden sm:-mt-14 md:-mt-16${isPlain ? " home-hero--plain" : " home-hero--photos"}`}
    >
      {isPlain ? (
        <>
          <PhotoBackground photos={plainPhotos} desktopPhotos={plainPhotosDesktop} />
          <div className="home-hero-plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, pos: "tl", className: "left-0 top-0" },
                { src: cornerDecos.topRight, pos: "tr", className: "right-0 top-0" },
                { src: cornerDecos.bottomLeft, pos: "bl", className: "left-0 bottom-0" },
                { src: cornerDecos.bottomRight, pos: "br", className: "right-0 bottom-0" },
              ] as const
            )
              .filter(({ src }) => src)
              .map(({ src, pos, className }) => (
                <div key={pos} className={`home-hero-corner-slot home-hero-corner-slot--${pos} absolute ${className}`}>
                  {/* Corners keep their original artwork colors (no tint) — same as the loader */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="home-hero-corner-img" />
                </div>
              ))}
          </div>
          {showFrame && <div className="home-hero-plain-frame" aria-hidden="true" />}
        </>
      ) : (
        <>
          <div
            className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--section"
            aria-hidden="true"
          >
            <InvitePhotoBackdrop
              className="invite-photo-backdrop--section"
              photos={backgroundPhotos}
            />
          </div>
          <div className="home-hero-photo-scrim pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
        </>
      )}

      <div className={`home-hero-content relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-[clamp(1rem,4vh,2rem)] pt-[clamp(6rem,24vw,7.5rem)] sm:pb-[clamp(2.5rem,9vh,5rem)] sm:pt-[clamp(3.75rem,10vw,6rem)] text-center sm:px-8${isPlain && coverPhoto ? " home-hero-content--cover" : ""}`}>
        {isPlain && coverPhoto && (
          <motion.figure className="home-hero-cover" {...fadeUp(0)}>
            <div className="home-hero-cover__frame">
              <Image
                src={encodeURI(coverPhoto)}
                alt={coverPhotoAlt}
                fill
                priority
                sizes="(min-width: 768px) 380px, 78vw"
                className="home-hero-cover__img"
              />
            </div>
            {coverVine && (
              // Sprig tucked under the photo (content/site.ts → homeHero.coverVine)
              // eslint-disable-next-line @next/next/no-img-element
              <img src={encodeURI(coverVine)} alt="" aria-hidden="true" className="home-hero-cover__vine" />
            )}
          </motion.figure>
        )}
        <div className="home-hero-copy relative flex w-full flex-col items-center">
        {/* Soft frosted mist behind the whole text block — no edges, fades into the photos */}
        <span aria-hidden className="home-hero-mist pointer-events-none" />
        <motion.h1
          className="relative mx-auto w-full max-w-full @container text-center"
          style={
            {
              "--hero-title-size": heroTitleSize.main,
              "--hero-script-size": heroTitleSize.script,
              "--hero-script-overlap": heroTitleSize.overlap,
            } as React.CSSProperties
          }
          {...fadeUp(0.08)}
        >
          <span
            aria-hidden
            className="home-hero-title-glow pointer-events-none absolute left-1/2 top-[42%] h-[min(18rem,58vw)] w-[min(36rem,96%)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          />
          <span className="sr-only">You&apos;re Invited!</span>
          <span
            aria-hidden
            className={`${theSeasons.className} home-hero-title-main relative block uppercase leading-[0.78] tracking-[0.06em] min-[400px]:tracking-[0.09em] sm:tracking-[0.11em] md:tracking-[0.12em]`}
            style={{ fontSize: "var(--hero-title-size)" }}
          >
            You
            <span
              className={`${cinzel.className} relative -top-[0.04em] mx-[0.02em] inline-block font-normal tracking-normal`}
            >
              &rsquo;
            </span>
            re
          </span>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} home-hero-title-script relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.82] sm:leading-[0.84]`}
            style={{
              marginTop: "var(--hero-script-overlap)",
              fontSize: "var(--hero-script-size)",
            }}
          >
            Invited
            <span
              className={`${cinzel.className} home-hero-title-script relative -top-[0.08em] ml-[0.05em] inline-block font-normal`}
            >
              !
            </span>
          </span>
        </motion.h1>

        <motion.p
          className="home-hero-eyebrow mt-5 text-[clamp(1.05rem,4.6vw,1.4rem)] italic leading-snug sm:mt-6"
          {...fadeUp(0.2)}
        >
          We are getting married
        </motion.p>

        <motion.div className="home-hero-date-block mt-5 flex flex-col items-center sm:mt-6" {...fadeUp(0.28)}>
          <span
            className={`${cinzel.className} home-hero-date-weekday text-[clamp(0.66rem,2.8vw,0.8rem)] font-semibold uppercase tracking-[0.42em]`}
          >
            {parsedDate.dayOfWeek}
          </span>
          <div className="home-hero-date-row mt-2 flex items-center justify-center gap-[clamp(0.75rem,4vw,1.5rem)]">
            <span
              className={`${cinzel.className} home-hero-date-side text-[clamp(0.72rem,3vw,0.9rem)] font-semibold uppercase tracking-[0.24em]`}
            >
              {/* Short month name ("Dec") */}
              {parsedDate.month.slice(0, 3)}
            </span>
            <span
              className="home-hero-date-day leading-none"
            >
              {pad2(Number(parsedDate.day))}
            </span>
            <span
              className={`${cinzel.className} home-hero-date-side text-[clamp(0.72rem,3vw,0.9rem)] font-semibold uppercase tracking-[0.24em]`}
            >
              {parsedDate.year}
            </span>
          </div>
        </motion.div>

        <motion.div className="home-hero-meta mt-5 flex flex-col items-center sm:mt-6" {...fadeUp(0.36)}>
          {/* "3:30 in the afternoon" between peach dots, then the venue in title case */}
          <span className="home-hero-meta-time">{ceremonyTimePhrase}</span>
          <span className="home-hero-meta-venue">{ceremonyName}</span>
        </motion.div>
        </div>
      </div>

      <motion.div className="home-hero-countdown-bar relative z-10 mt-auto w-full" {...fadeUp(0.42)}>
        <HeroCountdown />
      </motion.div>
    </section>
  )
}