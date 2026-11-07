"use client"

import { useEffect, useRef, useState } from "react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { useAudio } from "@/contexts/audio-context"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { Music2, Disc3 } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { SectionBackdrop } from "@/components/section-backdrop"
import { TintedDeco } from "@/components/tinted-deco"
import { DecoCorners } from "@/components/deco-corners"

interface SpotifyPlaybackUpdate {
  playingURI: string
  isPaused: boolean
  isBuffering: boolean
  duration: number
  position: number
}

interface SpotifyEmbedController {
  addListener: (
    event: "playback_update" | "playback_started" | "ready",
    callback: (event: { data: SpotifyPlaybackUpdate }) => void
  ) => void
  removeListener: (
    event: "playback_update" | "playback_started" | "ready",
    callback: (event: { data: SpotifyPlaybackUpdate }) => void
  ) => void
  destroy: () => void
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string; height?: string },
    callback: (controller: SpotifyEmbedController) => void
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIframeApi) => void
  }
}

let cachedSpotifyIframeApi: SpotifyIframeApi | null = null
const spotifyApiReadyQueue: Array<(api: SpotifyIframeApi) => void> = []

function getSpotifyUri(spotifyUrl: string): string {
  const match = spotifyUrl.match(
    /open\.spotify\.com\/(playlist|album|track|episode)\/([^/?]+)/
  )
  if (!match) return spotifyUrl
  return `spotify:${match[1]}:${match[2]}`
}

function loadSpotifyIframeApi(onReady: (api: SpotifyIframeApi) => void) {
  if (cachedSpotifyIframeApi) {
    onReady(cachedSpotifyIframeApi)
    return
  }

  spotifyApiReadyQueue.push(onReady)

  if (spotifyApiReadyQueue.length > 1) return

  const previousReady = window.onSpotifyIframeApiReady
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    cachedSpotifyIframeApi = IFrameAPI
    previousReady?.(IFrameAPI)
    spotifyApiReadyQueue.splice(0).forEach((callback) => callback(IFrameAPI))
  }

  const existingScript = document.querySelector(
    'script[src="https://open.spotify.com/embed/iframe-api/v1"]'
  )
  if (!existingScript) {
    const script = document.createElement("script")
    script.src = "https://open.spotify.com/embed/iframe-api/v1"
    script.async = true
    document.body.appendChild(script)
  }
}


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

// Palette lives in globals.css → motif / welcome tokens.
// White card, navy headings, body-blue text; dusty-blue buttons (no yellow for text).
const TEAL = "var(--color-welcome-navy)"
const BUTTON =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"
const BUTTON_SHADOW =
  "0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 22%, transparent), 0 12px 24px -12px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)"
const IVORY = "#FFFFFF"
const PAPER = "#FFFFFF"
const NAVY = TEAL
const BODY = "var(--color-welcome-text)"
const ACCENT = "var(--color-welcome-heading)"
const HAIRLINE = "color-mix(in srgb, var(--color-motif-medium) 60%, transparent)"

// Same circle pattern as the gallery (PlainBubbles paints the base)
const sectionBg = "var(--color-bg-pattern-base)"

// Text sitting directly on the circle pattern: navy (or dusty blue) with a soft white edge
const textGlow = "0 1px 0 rgb(255 255 255 / 90%), 0 0 12px rgb(255 255 255 / 75%)"
const onBg = {
  color: "var(--color-welcome-navy)",
  textShadow: textGlow,
} as const
const onBgBlue = { color: "var(--color-welcome-heading)", textShadow: textGlow } as const

const cardStyle = {
  background:
    "radial-gradient(90% 35% at 50% 0%, rgb(255 255 255 / 95%) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 10%, white) 100%)",
  border: `1px solid ${HAIRLINE}`,
  boxShadow:
    "0 0 0 6px rgb(255 255 255 / 40%), 0 28px 60px -32px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

const ct = {
  body: "text-sm sm:text-[0.95rem] md:text-base",
  bodyLg: "text-sm sm:text-base md:text-lg",
  btn: "text-[0.65rem] sm:text-[0.7rem] md:text-xs",
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return <TintedDeco src={src} className={className} />
}

// Dusty-blue hairlines either side of a slate-blue diamond
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to right, transparent, var(--color-motif-yellow))" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to left, transparent, var(--color-motif-yellow))" }} />
    </div>
  )
}

// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "&", "'", "-", numbers) in Cinzel, keep letters in The Seasons.
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function PlaylistTitle({ title, script }: { title: string; script: string }) {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": "clamp(1.6rem, 8.5vw, 4.2rem)",
          "--script-size": "clamp(1rem, 4.2vw, 2.25rem)",
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.85] tracking-[0.06em] min-[400px]:tracking-[0.1em] sm:tracking-[0.14em] md:tracking-[0.16em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        <SpecialCharFont text={title} />
      </span>
      {script ? (
        <>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.9] sm:mt-3`}
            style={{ fontSize: "var(--script-size)", ...onBgBlue }}
          >
            {script}
          </span>
          <span className="sr-only">{script}</span>
        </>
      ) : null}
    </h2>
  )
}

export function WeddingPlaylist() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.playlist
  const { title, subtitle, spotifyUrl, decos } = content
  const { groomNickname, brideNickname } = siteConfig.couple
  const fillCouple = (text: string) => text.split("{couple}").join(`${groomNickname} & ${brideNickname}`)
  const playlistName = fillCouple(content.playlistName)
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : "hidden"
  const spotifyUri = getSpotifyUri(spotifyUrl)
  const embedContainerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const playbackStateRef = useRef<"playing" | "paused">("paused")
  const [playerReady, setPlayerReady] = useState(false)
  const { pauseMusic, resumeMusic } = useAudio()

  useEffect(() => {
    const container = embedContainerRef.current
    if (!container) return

    let mounted = true

    const handlePlaybackStateChange = (isPlaying: boolean) => {
      if (isPlaying && playbackStateRef.current !== "playing") {
        playbackStateRef.current = "playing"
        pauseMusic()
      } else if (!isPlaying && playbackStateRef.current === "playing") {
        playbackStateRef.current = "paused"
        resumeMusic()
      }
    }

    const initController = (IFrameAPI: SpotifyIframeApi) => {
      if (!mounted || !embedContainerRef.current) return

      IFrameAPI.createController(
        embedContainerRef.current,
        {
          uri: spotifyUri,
          width: "100%",
          // 352 is Spotify's full layout (artwork + track list); in-between heights render cropped
          height: "352",
        },
        (EmbedController) => {
          if (!mounted) return

          controllerRef.current = EmbedController

          const handleReady = () => {
            if (mounted) setPlayerReady(true)
          }

          const handlePlaybackUpdate = (event: { data: SpotifyPlaybackUpdate }) => {
            handlePlaybackStateChange(!event.data.isPaused)
          }

          const handlePlaybackStarted = () => {
            handlePlaybackStateChange(true)
          }

          EmbedController.addListener("ready", handleReady)
          EmbedController.addListener("playback_update", handlePlaybackUpdate)
          EmbedController.addListener("playback_started", handlePlaybackStarted)
        }
      )
    }

    loadSpotifyIframeApi(initController)

    return () => {
      mounted = false
      if (playbackStateRef.current === "playing") {
        resumeMusic()
      }
      playbackStateRef.current = "paused"
      controllerRef.current?.destroy()
      controllerRef.current = null
      setPlayerReady(false)
    }
  }, [pauseMusic, resumeMusic, spotifyUri])

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={{ background: sectionBg }}
    >
      {/* Same circle pattern as the gallery */}
      <PlainBubbles />
      {/* Pink paper wash + grain and rising hearts, same as the love story (section-backdrop.tsx) */}
      <SectionBackdrop />
      <section
        id="playlist"
        className="relative z-10 overflow-hidden pt-10 pb-9 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Corner florals + double border (content/site.ts → playlist.decos / showFrame) */}
        {content.showFrame && <div className="deco-frame" aria-hidden="true" />}
        <DecoCorners decos={decos} />

        <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
          {/* Header */}
          <motion.div
            className="relative px-4 text-center sm:px-10"
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Soft white glow so the heading reads cleanly over the circles */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[min(40rem,110%)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{ background: "radial-gradient(ellipse at center, rgb(255 255 255 / 70%) 0%, rgb(255 255 255 / 30%) 50%, transparent 72%)" }}
            />
            <DecoImg
              src={decos.headerOrnament}
              className="mx-auto mb-2 block h-auto w-20 select-none sm:mb-4 sm:w-36 md:w-44"
            />
            <DiamondDivider />
            {content.eyebrow ? (
              <p
                className={`${cinzel.className} mt-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] sm:mt-5 sm:text-[0.8rem] sm:tracking-[0.24em]`}
                style={onBgBlue}
              >
                {content.eyebrow}
              </p>
            ) : null}
            <div className="mx-auto mt-2 sm:mt-4">
              <PlaylistTitle title={title} script={content.script} />
            </div>
            <p
              className={`font-goudy-italic ${ct.bodyLg} mx-auto mt-3 max-w-lg px-2 leading-relaxed sm:mt-5`}
              style={{ ...onBg, fontWeight: 600 }}
            >
              {subtitle}
            </p>
          </motion.div>

          {/* Playlist card — stacked on mobile, side by side on desktop */}
          <motion.div
            className="relative mt-6 overflow-hidden rounded-[1.5rem] sm:mt-10 sm:rounded-[2.25rem] md:mt-12"
            style={cardStyle}
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="relative z-20 grid grid-cols-1 items-center gap-4 px-3 py-4 sm:gap-6 sm:px-7 sm:py-9 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 md:px-10 md:py-10">
              {/* Info */}
              <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 px-1 text-left sm:flex-col sm:flex-nowrap sm:gap-0 sm:px-0 sm:text-center md:items-start md:text-left">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16"
                  style={{
                    background: BUTTON,
                    boxShadow: `0 0 0 4px ${PAPER}, 0 0 0 5px ${HAIRLINE}, 0 14px 28px -12px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)`,
                  }}
                  aria-hidden
                >
                  <Disc3
                    className={`h-6 w-6 sm:h-8 sm:w-8 ${reduceMotion ? "" : "animate-[spin_6s_linear_infinite]"}`}
                    style={{ color: IVORY }}
                  />
                </span>
                <div className="min-w-0 sm:contents">
                  <p
                    className={`${cinzel.className} text-[0.55rem] font-semibold uppercase tracking-[0.22em] sm:mt-4 sm:text-[0.65rem]`}
                    style={{ color: ACCENT }}
                  >
                    {content.cardEyebrow}
                  </p>
                  <h3
                    className={`${theSeasons.className} mt-0.5 truncate text-base uppercase leading-tight tracking-[0.06em] sm:mt-1.5 sm:whitespace-normal sm:text-2xl sm:tracking-[0.08em]`}
                    style={{ color: NAVY }}
                    title={playlistName}
                  >
                    <SpecialCharFont text={playlistName} />
                  </h3>
                </div>
                {content.cardNote ? (
                  <p
                    className={`font-goudy-italic w-full text-[0.82rem] leading-snug sm:mt-3 sm:w-auto sm:max-w-sm sm:text-[0.95rem] sm:leading-relaxed md:text-base`}
                    style={{ color: BODY }}
                  >
                    {content.cardNote}
                  </p>
                ) : null}
                <span
                  aria-hidden
                  className="my-5 hidden h-px w-24 md:block"
                  style={{ background: "linear-gradient(to right, var(--color-motif-yellow), transparent)" }}
                />
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cinzel.className} mt-5 hidden items-center sm:inline-flex justify-center gap-2 rounded-full border px-7 py-2.5 font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:py-3 md:mt-0 ${ct.btn}`}
                  style={{
                    background: BUTTON,
                    borderColor: "rgb(255 255 255 / 70%)",
                    color: IVORY,
                    boxShadow: BUTTON_SHADOW,
                  }}
                >
                  <Music2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {content.buttonText}
                </a>
              </div>

              {/* Spotify player */}
              <div
                className="relative w-full overflow-hidden rounded-[14px] p-1 sm:rounded-2xl sm:p-2"
                style={{ background: IVORY, boxShadow: `0 0 0 1px ${HAIRLINE}, 0 18px 36px -24px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)` }}
              >
                <div
                  ref={embedContainerRef}
                  title={`${playlistName} — Spotify playlist`}
                  aria-label={`${playlistName} — Spotify playlist`}
                  className="h-[352px] w-full overflow-hidden rounded-[12px] [&_iframe]:block [&_iframe]:border-0"
                  style={{ background: "color-mix(in srgb, var(--color-motif-medium) 14%, white)" }}
                />
                {/* Placeholder while the Spotify embed loads */}
                {!playerReady && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-1 flex flex-col items-center justify-center gap-3 rounded-[12px] sm:inset-2"
                    style={{ background: "color-mix(in srgb, var(--color-motif-medium) 14%, white)" }}
                  >
                    <Disc3
                      className={`h-9 w-9 opacity-60 ${reduceMotion ? "" : "animate-[spin_3s_linear_infinite]"}`}
                      style={{ color: ACCENT }}
                    />
                    <span
                      className={`${cinzel.className} text-[0.6rem] font-semibold uppercase tracking-[0.22em] opacity-70`}
                      style={{ color: TEAL }}
                    >
                      Loading playlist
                    </span>
                  </div>
                )}
              </div>

              {/* Phone: compact full-width button under the player */}
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cinzel.className} inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full py-3 font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.98] sm:hidden ${ct.btn}`}
                style={{
                  background: BUTTON,
                  color: IVORY,
                  boxShadow: BUTTON_SHADOW,
                }}
              >
                <Music2 className="h-3.5 w-3.5" />
                {content.buttonText}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
