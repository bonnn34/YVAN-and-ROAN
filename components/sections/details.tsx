"use client"

import { Section } from "@/components/section"
import { useState, useEffect, type ReactNode } from "react"
import { useQrColors } from "@/hooks/use-css-color"
import { QRCodeSVG } from "qrcode.react"
import { useSiteConfig } from "@/hooks/use-site-config"
import type { AttireColor } from "@/content/site"
import Image from "next/image"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { Shirt, Copy, Check, Navigation, Heart, MapPin } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { TintedDeco } from "@/components/tinted-deco"
import { DecoCorners } from "@/components/deco-corners"
import { SectionBackdrop } from "@/components/section-backdrop"


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
const C = {
  heading: "var(--color-welcome-navy)",
  body: "var(--color-welcome-text)",
  soft: "var(--color-welcome-text-soft)",
  label: "var(--color-welcome-heading)",
  script: "var(--color-welcome-script)",
  accent: "var(--color-motif-accent)",
  blue: "var(--color-welcome-heading)",
  green: "var(--color-welcome-green)",
  paper: "var(--color-welcome-bg-soft)",
  light: "var(--color-motif-soft)",
} as const

// Same circle pattern as the gallery / love story sections (PlainBubbles paints the base)
const sectionBg = "var(--color-bg-pattern-base)"

// Soft white edge so text stays crisp over the circles (matches the gallery)
const onBgGlow = "0 1px 0 rgb(255 255 255 / 85%), 0 0 12px rgb(255 255 255 / 70%)"

// Text sitting directly on the background: deep slate titles, slate-blue labels
const onBg = { color: C.heading, textShadow: onBgGlow } as const
const onBgLabel = { color: C.blue, textShadow: onBgGlow } as const
const onBgBody = { color: C.body, textShadow: onBgGlow } as const

const hairline = "color-mix(in srgb, var(--color-motif-medium) 55%, transparent)"
const blushEdge = "color-mix(in srgb, var(--color-motif-blush) 90%, transparent)"

// Paper cards with a blush edge (same paper as the love story / gallery photo frames)
const cardStyle = {
  background: "var(--color-motif-soft)",
  boxShadow:
    `0 0 0 1px ${blushEdge}, 0 22px 48px -26px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)`,
} as const

const softPanelStyle = {
  backgroundColor: "color-mix(in srgb, var(--color-motif-blush) 28%, white)",
} as const

// Primary button: dusty rose → charcoal with white text (matches the rest of the invitation)
const primaryButtonBg =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"



function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return <TintedDeco src={src} className={className} />
}

// Warm-gray hairlines either side of a round blush-edged icon
function SectionIconDivider({ icon }: { icon: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-1 sm:pt-2">
      <span
        className="h-px w-10 sm:w-16 md:w-20"
        style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium))" }}
      />
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8"
        style={{ border: `1px solid ${blushEdge}`, background: "var(--color-motif-soft)" }}
      >
        {icon}
      </span>
      <span
        className="h-px w-10 sm:w-16 md:w-20"
        style={{ background: "linear-gradient(to left, transparent, var(--color-motif-medium))" }}
      />
    </div>
  )
}

function DetailsTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": "clamp(2.15rem, 11vw, 4.5rem)",
          "--script-size": "clamp(1.1rem, 4.5vw, 2.25rem)",
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.15em] md:tracking-[0.18em] pb-1 sm:pb-1.5`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
        style={{ fontSize: "var(--script-size)", ...onBg }}
      >
        {subtitle}
      </span>
      <span className="sr-only">{subtitle}</span>
    </h2>
  )
}

// Slightly compact type inside card containers (not the page header)
const ct = {
  label: "text-[11px] sm:text-xs md:text-sm",
  labelSm: "text-[10px] sm:text-[11px] md:text-xs",
  body: "text-xs sm:text-sm md:text-base",
  bodyLg: "text-sm sm:text-base md:text-lg",
  month: "text-base sm:text-xl md:text-2xl lg:text-3xl",
  dayNum: "text-2xl sm:text-4xl md:text-5xl lg:text-6xl",
  year: "text-base sm:text-xl md:text-2xl lg:text-3xl",
  sectionTitle: "text-sm sm:text-lg md:text-xl lg:text-2xl",
  attireCardTitle: "text-sm sm:text-lg md:text-xl lg:text-2xl",
  btn: "text-xs sm:text-sm md:text-base",
  reminderHead: "text-[0.8rem] sm:text-sm md:text-base",
  reminderBody: "text-xs sm:text-sm md:text-[0.95rem]",
} as const

type PaletteColor = { name: string; hex: string }

// Palette entries may be a plain "#HEX" or { name, hex }
function toPaletteColors(colors: readonly AttireColor[]): PaletteColor[] {
  return colors.map((c) => (typeof c === "string" ? { name: "", hex: c } : c))
}

function DressCodePaletteHeader({
  title,
  subtitle,
  guideTitle,
  guideNote,
}: {
  title: string
  subtitle: string
  guideTitle: string
  guideNote: string
}) {
  return (
    <div className="px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6">
    <div className="mx-auto max-w-3xl text-center">
      <h5
        className={`${cinzel.className} text-sm font-semibold uppercase tracking-[0.14em] sm:text-base md:text-lg lg:text-xl`}
        style={{ color: C.heading }}
      >
        {title}
      </h5>
      {subtitle ? (
        <p
          className={`${aboveTheBeyond.className} mt-1 text-lg leading-none sm:mt-1.5 sm:text-xl md:text-2xl`}
          style={{ color: C.blue }}
        >
          {subtitle}
        </p>
      ) : null}

      <div className="mx-auto mt-3 flex max-w-xs items-center justify-center gap-2 sm:mt-4 sm:max-w-sm md:max-w-md">
        <span className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium))" }} />
        <Heart className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" style={{ color: C.accent, fill: C.accent }} aria-hidden />
        <span className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, var(--color-motif-medium))" }} />
      </div>

      <p
        className={`${cinzel.className} mt-3 text-[10px] font-bold uppercase tracking-[0.12em] sm:mt-4 sm:text-xs md:text-sm`}
        style={{ color: C.label }}
      >
        {guideTitle}
      </p>
      <p className="font-goudy-italic mt-1.5 text-[10px] italic leading-relaxed sm:mt-2 sm:text-xs md:text-sm" style={{ color: C.body }}>
        {guideNote}
      </p>
    </div>
    </div>
  )
}

// Light swatches (cream, blush) get charcoal names; darker ones get white
function isLightHex(hex: string) {
  const h = hex.replace("#", "")
  if (h.length !== 6) return false
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 186
}

// Full-width color strip: every color gets an equal share of the card width
function DressCodePaletteSwatches({ palette }: { palette: readonly PaletteColor[] }) {
  const named = palette.filter((c) => c.name)
  return (
    <div
      className="flex w-full overflow-hidden rounded-xl border-2"
      style={{
        borderColor: "#FFFFFF",
        boxShadow:
          "0 0 0 1px color-mix(in srgb, var(--color-motif-blush) 90%, transparent), 0 10px 22px -14px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent)",
      }}
      role="img"
      aria-label={`Dress code color palette: ${(named.length ? named.map((c) => c.name) : palette.map((c) => c.hex)).join(", ")}`}
    >
      {palette.map((color, index) => (
        <div
          key={`${color.hex}-${index}`}
          className={`relative flex min-h-[88px] min-w-0 flex-1 items-center justify-center sm:min-h-[108px] md:min-h-[128px] lg:min-h-[148px] ${
            index === palette.length - 1 ? "" : "border-r border-white/80"
          }`}
          style={{ backgroundColor: color.hex }}
          title={color.name || color.hex}
        >
          {color.name ? (
            <span
              className="text-[6px] font-semibold uppercase tracking-[0.08em] sm:text-[7px] md:text-[8px] lg:text-[9px]"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                ...(isLightHex(color.hex)
                  ? { color: "var(--color-motif-deep)", textShadow: "0 1px 0 rgb(255 255 255 / 60%)" }
                  : { color: "#FFFFFF", textShadow: "0 1px 2px rgb(0 0 0 / 45%), 0 0 6px rgb(0 0 0 / 25%)" }),
              }}
            >
              {color.name}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function ColorPalette({ colors }: { colors: readonly string[] }) {
  const widthClass = colors.length > 4 ? "max-w-md" : "max-w-xs sm:max-w-sm"

  return (
    <div
      className={`mx-auto flex h-8 w-full overflow-hidden rounded-full border-2 shadow-sm sm:h-9 ${widthClass}`}
      style={{ borderColor: C.light, boxShadow: `0 0 0 1px ${blushEdge}` }}
      role="img"
      aria-label={`Color palette: ${colors.join(", ")}`}
    >
      {colors.map((color) => (
        <div key={color} className="min-w-0 flex-1" style={{ backgroundColor: color }} title={color} />
      ))}
    </div>
  )
}

function CoupleImagesCarousel({
  coupleImages,
  currentImageIndex,
  rotationOffset,
}: {
  coupleImages: readonly string[]
  currentImageIndex: number
  rotationOffset: number
}) {
  return (
    // Phones: photos overlap like a small stack; tablet/desktop: spaced row
    <div className="mb-4 flex justify-center sm:mb-5 sm:gap-2.5">
      {coupleImages.map((image, index) => {
        const isActive = index === currentImageIndex
        const baseRotation = index % 2 === 0 ? -5 + index : 5 - index
        const currentRotation = isActive
          ? baseRotation + Math.sin((rotationOffset * Math.PI) / 180) * 2
          : baseRotation
        const scale = isActive ? "scale(1.1)" : "scale(1)"

        return (
          <div
            key={image}
            className={`relative h-16 w-16 overflow-hidden rounded-lg border-[3px] shadow-md transition-all duration-700 ease-in-out ${
              index > 0 ? "-ml-2 sm:ml-0" : ""
            } ${isActive ? "z-10" : "opacity-90 sm:opacity-75"}`}
            style={{ transform: `rotate(${currentRotation}deg) ${scale}`, borderColor: C.light }}
          >
            <Image src={encodeURI(image)} alt={`Wedding couple ${index + 1}`} fill className="object-cover" sizes="64px" />
          </div>
        )
      })}
    </div>
  )
}

function FadeRule({ className = "" }: { className?: string }) {
  return (
    <span
      className={`mx-auto block h-px w-24 sm:w-32 ${className}`}
      style={{ background: "linear-gradient(to right, transparent, var(--color-motif-accent), transparent)" }}
      aria-hidden
    />
  )
}

const revealEase = [0.22, 1, 0.36, 1] as const

const reminderListVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const reminderItemVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: revealEase } },
}

function ReminderItem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div variants={reminderItemVariants} className="mx-auto flex max-w-xl flex-col items-center text-center">
      <h4
        className={`${cinzel.className} ${ct.reminderHead} font-semibold uppercase tracking-[0.16em]`}
        style={{ color: C.heading }}
      >
        {title}
      </h4>
      <div className={`font-goudy-italic ${ct.reminderBody} mt-1.5 leading-relaxed sm:mt-2`} style={{ color: C.body }}>
        {children}
      </div>
    </motion.div>
  )
}

function highlightPhrase(text: string, phrase?: string): ReactNode {
  if (!phrase) return text
  // Case-insensitive so "Formal Dresses" still matches "formal dresses" in the text
  const index = text.toLowerCase().indexOf(phrase.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <strong className="font-bold underline decoration-[var(--color-motif-medium)] underline-offset-2" style={{ color: C.heading }}>
        {text.slice(index, index + phrase.length)}
      </strong>
      {text.slice(index + phrase.length)}
    </>
  )
}

function AttirePaletteGroup({
  label,
  description,
  roles = [],
}: {
  label: string
  description?: ReactNode
  roles?: readonly { role: string; attire: string }[]
}) {
  return (
    <div className="mx-auto w-full max-w-md space-y-1.5 sm:space-y-2">
      <div className="flex items-center justify-center gap-2">
        <span className="h-px w-6 sm:w-10" style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium))" }} />
        <p
          className={`${cinzel.className} text-center text-[0.62rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.7rem]`}
          style={{ color: C.label }}
        >
          {label}
        </p>
        <span className="h-px w-6 sm:w-10" style={{ background: "linear-gradient(to left, transparent, var(--color-motif-medium))" }} />
      </div>
      {description ? (
        <p className="font-goudy-italic text-center text-[0.78rem] leading-snug sm:text-sm" style={{ color: C.body }}>
          {description}
        </p>
      ) : null}
      {roles.length > 0 && (
        <ul className="space-y-1.5 sm:space-y-2">
          {roles.map(({ role, attire }) => (
            <li key={role} className="text-center">
              <p
                className={`${cinzel.className} text-[0.6rem] font-semibold uppercase leading-tight tracking-[0.12em] sm:text-[0.68rem]`}
                style={{ color: C.heading }}
              >
                <SpecialCharFont text={role} />
              </p>
              <p className="font-goudy-italic text-[0.78rem] leading-snug sm:text-sm" style={{ color: C.body }}>
                {attire}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AttireCard({
  title,
  image,
  alt,
  children,
  dressCode,
  belowImage,
}: {
  title: string
  image?: string
  alt: string
  children: ReactNode
  dressCode?: string
  belowImage?: ReactNode
}) {
  return (
    <div className="relative group h-full">
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "color-mix(in srgb, var(--color-motif-accent) 14%, transparent)",
        }}
      />
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
        style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
      >
        <div className="flex flex-col items-center gap-1.5 px-4 pt-4 pb-2 sm:pt-6">
          <h4
            className={`${cinzel.className} text-sm sm:text-lg md:text-xl text-center uppercase tracking-[0.2em] font-semibold leading-tight`}
            style={{ color: C.heading }}
          >
            {title}
          </h4>
          {dressCode ? (
            <span
              className={`${cinzel.className} rounded-full px-2.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.62rem]`}
              style={{
                color: C.blue,
                background: "color-mix(in srgb, var(--color-motif-blush) 35%, white)",
                border: "1px solid color-mix(in srgb, var(--color-motif-blush) 90%, transparent)",
              }}
            >
              {dressCode}
            </span>
          ) : null}
        </div>

        {image ? (
          <div
            className="relative flex w-full shrink-0 items-center justify-center overflow-hidden"
            style={{
              background:
                "radial-gradient(70% 80% at 50% 40%, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-blush) 30%, white) 100%)",
            }}
          >
            {/* Any image shape works: the 3/2 size is only a placeholder until the
                file loads, then h-auto switches to the image's real proportions */}
            <Image
              src={image}
              alt={alt}
              width={1500}
              height={1000}
              className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.01]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
            />
          </div>
        ) : null}

        {belowImage}

        <div className="flex flex-1 flex-col px-3 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "&", ",", "-", numbers) in Cinzel, keep letters in The Seasons.
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

type VenueLabels = {
  arrival: string
  at: string
  scanForDirections: string
  getDirections: string
  copyAddress: string
  copied: string
}

type EventVenueCardProps = {
  badge: string
  images: readonly string[]
  activeImageIndex: number
  locationName: string
  venueAddress: string
  day: string
  dateString: string
  time: string
  arrivalTime?: string
  // Combined card: one row per event (e.g. Ceremony 3:00 PM / Reception 6:00 PM)
  schedule?: { label: string; time: string }[]
  venueSectionLabel: string
  mapsLink: string
  copyId: string
  fullVenue: string
  copiedItems: Set<string>
  onCopy: (text: string, id: string) => void
  onOpenMaps: (link: string) => void
  showDateDetails?: boolean
  labels: VenueLabels
}

function EventVenueCard({
  badge,
  images,
  activeImageIndex,
  locationName,
  venueAddress,
  day,
  dateString,
  time,
  arrivalTime,
  schedule,
  venueSectionLabel,
  mapsLink,
  copyId,
  fullVenue,
  copiedItems,
  onCopy,
  onOpenMaps,
  showDateDetails = true,
  labels,
}: EventVenueCardProps) {
  const { fg: qrFg, bg: qrBg } = useQrColors() // --color-qr-fg / --color-qr-bg in globals.css
  const eventDate = showDateDetails ? new Date(dateString) : null
  const copied = copiedItems.has(copyId)

  return (
    <div className="relative group">
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "color-mix(in srgb, var(--color-motif-accent) 14%, transparent)",
        }}
      />

      <div
        className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
        style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
      >
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[30rem] overflow-hidden" style={{ background: "color-mix(in srgb, var(--color-motif-blush) 40%, white)" }}>
          {images.map((src, index) => {
            const isActive = index === activeImageIndex
            return (
              <div
                key={src}
                className={`absolute inset-0 transition-[opacity,transform] duration-[1600ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] ${
                  isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.06] z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={src}
                  alt={locationName}
                  fill
                  className={`object-cover transition-transform duration-[9000ms] ease-out ${
                    isActive && images.length > 1 ? "scale-[1.08] group-hover:scale-[1.12]" : "scale-100"
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
                  // Load every slide up front so the next one is ready before it fades in
                  priority={index === 0}
                  loading={index === 0 ? undefined : "eager"}
                />
              </div>
            )
          })}
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--color-welcome-navy) 82%, transparent) 0%, color-mix(in srgb, var(--color-welcome-navy) 25%, transparent) 45%, transparent 100%)",
            }}
          />

          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 right-3 sm:right-4 md:right-6 z-30">
            <span
              className={`${cinzel.className} inline-block mb-2 px-3 py-1 rounded-full backdrop-blur-sm text-[10px] sm:text-xs uppercase tracking-[0.2em] border`}
              style={{
                color: C.light,
                background: "color-mix(in srgb, var(--color-motif-soft) 18%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-motif-soft) 45%, transparent)",
              }}
            >
              {badge}
            </span>
            <h3
              className={`${theSeasons.className} text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 sm:mb-1.5 drop-shadow-lg uppercase tracking-[0.12em] leading-tight`}
              style={{ color: C.light }}
            >
              <SpecialCharFont text={locationName} />
            </h3>
            <p
              className={`${theSeasons.className} text-[10px] sm:text-xs md:text-sm lg:text-base drop-shadow-md tracking-[0.06em] leading-snug`}
              style={{ color: "var(--color-motif-silver)" }}
            >
              <SpecialCharFont text={venueAddress} />
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-5 md:p-7 lg:p-9">
          <div className="text-center mb-5 sm:mb-8 md:mb-10 space-y-2 sm:space-y-2.5 md:space-y-3">
            {showDateDetails && eventDate && !Number.isNaN(eventDate.getTime()) && (
              <>
                <p className={`${cinzel.className} ${ct.label} font-semibold uppercase tracking-[0.2em]`} style={{ color: C.label }}>
                  {day}
                </p>
                <p className={`${cinzel.className} ${ct.month} font-semibold leading-none`} style={{ color: C.heading }}>
                  {eventDate.toLocaleString("default", { month: "long" })}
                </p>
                <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 py-1 sm:py-2">
                  <p className={`${cinzel.className} ${ct.dayNum} font-semibold leading-none`} style={{ color: C.blue }}>
                    {eventDate.getDate()}
                  </p>
                  <div
                    className="h-10 sm:h-12 md:h-14 w-[2px] rounded-full"
                    style={{ background: "var(--color-motif-medium)" }}
                  />
                  <p className={`${cinzel.className} ${ct.year} font-semibold leading-none`} style={{ color: C.heading }}>
                    {eventDate.getFullYear()}
                  </p>
                </div>
              </>
            )}

            {(!schedule || arrivalTime) && (
              <p
                className={`${cinzel.className} text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-[0.12em] uppercase ${showDateDetails ? "" : "py-2 sm:py-3"}`}
                style={{ color: C.heading }}
              >
                {arrivalTime ? `${labels.arrival}: ${arrivalTime}` : `${labels.at} ${time}`}
              </p>
            )}

            {schedule && schedule.length > 0 && (
              <div className="mx-auto flex max-w-sm items-stretch justify-center gap-3 pt-2 sm:gap-5 sm:pt-3">
                {schedule.map((item, i) => (
                  <div key={item.label} className="flex items-stretch gap-3 sm:gap-5">
                    {i > 0 && <span className="w-px self-stretch" style={{ background: hairline }} aria-hidden />}
                    <div className="flex flex-col items-center">
                      <p className={`${cinzel.className} ${ct.labelSm} font-semibold uppercase tracking-[0.2em]`} style={{ color: C.label }}>
                        {item.label}
                      </p>
                      <p className={`${cinzel.className} ${ct.bodyLg} mt-1 font-semibold tracking-[0.08em]`} style={{ color: C.blue }}>
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6" style={{ backgroundColor: softPanelStyle.backgroundColor }}>
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mt-0.5 flex-shrink-0" style={{ color: C.blue }} />
              <div className="flex-1 min-w-0">
                <p className={`${cinzel.className} ${ct.label} font-semibold mb-1.5 sm:mb-2 uppercase tracking-wide`} style={{ color: C.label }}>
                  {venueSectionLabel}
                </p>
                <p
                  className={`${theSeasons.className} text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-snug tracking-[0.06em] uppercase`}
                  style={{ color: C.heading }}
                >
                  <SpecialCharFont text={locationName} />
                </p>
                <p className={`${theSeasons.className} ${ct.body} leading-relaxed mt-1 tracking-[0.04em]`} style={{ color: C.body }}>
                  <SpecialCharFont text={venueAddress} />
                </p>
              </div>
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <div className="p-1.5 sm:p-2 md:p-2.5 rounded-lg shadow-sm" style={{ backgroundColor: qrBg }}>
                  <QRCodeSVG value={mapsLink} size={80} level="M" includeMargin={false} fgColor={qrFg} bgColor={qrBg} />
                </div>
                <p className={`font-goudy-italic ${ct.label} text-center max-w-[90px]`} style={{ color: C.label }}>
                  {labels.scanForDirections}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => onOpenMaps(mapsLink)}
              className={`${cinzel.className} flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-full border font-semibold uppercase tracking-[0.12em] ${ct.btn} transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]`}
              style={{
                background: primaryButtonBg,
                borderColor: "rgb(255 255 255 / 70%)",
                color: "#FFFFFF",
                boxShadow: "0 12px 24px -10px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
              }}
              aria-label={`Get directions to ${badge.toLowerCase()} venue`}
            >
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span>{labels.getDirections}</span>
            </button>
            <button
              type="button"
              onClick={() => onCopy(fullVenue, copyId)}
              className={`${cinzel.className} flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 border rounded-full font-semibold uppercase tracking-[0.12em] ${ct.btn} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
              style={{
                color: C.heading,
                backgroundColor: "var(--color-motif-soft)",
                borderColor: blushEdge,
              }}
              aria-label={`Copy ${badge.toLowerCase()} venue address`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: C.blue }} />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              )}
              <span>{copied ? labels.copied : labels.copyAddress}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Details() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.eventDetails
  const { decos, venues, labels, attire, reminders } = content
  const { ceremony, reception } = siteConfig

  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())
  const [ceremonyImageIndex, setCeremonyImageIndex] = useState(0)
  const [receptionImageIndex, setReceptionImageIndex] = useState(0)
  const [reminderImageIndex, setReminderImageIndex] = useState(0)
  const [rotationOffset, setRotationOffset] = useState(0)
  const reduceMotion = useReducedMotion()

  // "combined" = one card for both events at the ceremony venue (eventDetails.venues.layout)
  const isCombined = venues.layout === "combined"
  const ceremonyImages = ceremony.image
  const receptionImages = isCombined ? [] : reception.image
  // Photos above the reminders (shown in every display mode)
  const reminderImages = reminders.images
  const paletteHexes = toPaletteColors(attire.palette).map((c) => c.hex)
  // Guard against null entries (e.g. a stray comma in ATTIRE.show)
  const attireGroups = attire.groups.filter(Boolean)

  useEffect(() => {
    if (ceremonyImages.length <= 1) return
    const timer = setInterval(() => setCeremonyImageIndex((prev) => (prev + 1) % ceremonyImages.length), 4500)
    return () => clearInterval(timer)
  }, [ceremonyImages.length])

  useEffect(() => {
    if (receptionImages.length <= 1) return
    const timer = setInterval(() => setReceptionImageIndex((prev) => (prev + 1) % receptionImages.length), 4500)
    return () => clearInterval(timer)
  }, [receptionImages.length])

  // Gentle reminders couple photos — subtle carousel + wobble animation
  useEffect(() => {
    if (reminderImages.length === 0) return
    const interval = setInterval(() => {
      setReminderImageIndex((prev) => (prev + 1) % reminderImages.length)
      setRotationOffset((prev) => (prev + 10) % 360)
    }, 2600)
    return () => clearInterval(interval)
  }, [reminderImages.length])

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems((prev) => new Set(prev).add(itemId))
      setTimeout(() => {
        setCopiedItems((prev) => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const openInMaps = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer")
  }

  const fillTimes = (text: string) =>
    text.split("{guestsTime}").join(ceremony.guestsTime).split("{ceremonyTime}").join(ceremony.time)

  const ceremonyVenue = `${ceremony.location}, ${ceremony.venue}`
  const receptionVenue = `${reception.location}, ${reception.venue}`
  const receptionMapsLink = reception.map || `https://maps.google.com/?q=${encodeURIComponent(receptionVenue)}`

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={{ background: sectionBg }}
    >
      {/* Circle pattern + pink paper wash and rising hearts, same as the love story (section-backdrop.tsx) */}
      <PlainBubbles />
      <SectionBackdrop />
      <Section
        id="details"
        className="relative z-10 pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20 overflow-hidden"
      >
        {/* Corner florals + double border (content/site.ts → eventDetails.decos / showFrame) */}
        {content.showFrame && <div className="deco-frame" aria-hidden="true" />}
        <DecoCorners decos={decos} />

        {/* Header */}
        <div className="relative z-20 mb-6 px-6 text-center sm:mb-8 sm:px-10 md:mb-10 md:px-12">
          <DecoImg
            src={decos.headerOrnament}
            className="mx-auto mb-3 block h-auto w-28 select-none sm:mb-4 sm:w-36 md:w-44"
          />
          <p
            className={`${cinzel.className} mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.34em] min-[400px]:tracking-[0.38em] sm:text-[0.65rem] sm:tracking-[0.44em]`}
            style={onBgLabel}
          >
            {content.eyebrow}
          </p>
          <div className="my-4 sm:my-5 md:my-6">
            <DetailsTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className="font-goudy-italic mx-auto max-w-2xl px-2 text-[0.8rem] leading-[1.62] sm:text-[0.875rem] sm:leading-[1.65] md:text-[0.9375rem]"
            style={{ ...onBgBody, fontWeight: 600 }}
          >
            {content.description}
          </p>

          {content.verse ? (
            <figure className="mx-auto mt-4 max-w-xl px-2 sm:mt-5">
              <blockquote
                className="font-goudy-italic text-[0.8rem] leading-[1.62] sm:text-[0.875rem] md:text-[0.9375rem]"
                style={onBgBody}
              >
                &ldquo;{content.verse}&rdquo;
              </blockquote>
              {content.verseCitation ? (
                <figcaption
                  className={`${cinzel.className} mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.24em] sm:text-[0.65rem]`}
                  style={onBgLabel}
                >
                  {content.verseCitation}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <div className="mt-4 sm:mt-5">
            <SectionIconDivider icon={<MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />} />
          </div>
        </div>

        {/* Venue and Event Information */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mb-10 sm:mb-12 md:mb-14 space-y-6 sm:space-y-10 md:space-y-14">
          {isCombined && (
            <EventVenueCard
              badge={venues.combined.badge}
              images={ceremonyImages}
              activeImageIndex={ceremonyImageIndex}
              locationName={ceremony.location}
              venueAddress={ceremony.venue}
              day={ceremony.day}
              dateString={ceremony.date}
              time={ceremony.time}
              arrivalTime={venues.combined.showArrival ? ceremony.guestsTime : undefined}
              schedule={[
                { label: venues.combined.ceremonyLabel, time: ceremony.time },
                ...(venues.combined.showReceptionTime
                  ? [{ label: venues.combined.receptionLabel, time: reception.time }]
                  : []),
              ]}
              venueSectionLabel={venues.combined.sectionLabel}
              mapsLink={ceremony.map}
              copyId="combined"
              fullVenue={ceremonyVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.combined.showDate}
              labels={labels}
            />
          )}

          {!isCombined && venues.ceremony.show && (
            <EventVenueCard
              badge={venues.ceremony.badge}
              images={ceremonyImages}
              activeImageIndex={ceremonyImageIndex}
              locationName={ceremony.location}
              venueAddress={ceremony.venue}
              day={ceremony.day}
              dateString={ceremony.date}
              time={ceremony.time}
              arrivalTime={venues.ceremony.showArrival ? ceremony.guestsTime : undefined}
              venueSectionLabel={venues.ceremony.sectionLabel}
              mapsLink={ceremony.map}
              copyId="ceremony"
              fullVenue={ceremonyVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.ceremony.showDate}
              labels={labels}
            />
          )}

          {!isCombined && venues.reception.show && (
            <EventVenueCard
              badge={venues.reception.badge}
              images={receptionImages}
              activeImageIndex={receptionImageIndex}
              locationName={reception.location}
              venueAddress={reception.venue}
              day={reception.day}
              dateString={reception.date}
              time={reception.time}
              arrivalTime={venues.reception.showArrival ? ceremony.guestsTime : undefined}
              venueSectionLabel={venues.reception.sectionLabel}
              mapsLink={receptionMapsLink}
              copyId="reception"
              fullVenue={receptionVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.reception.showDate}
              labels={labels}
            />
          )}
        </div>

        {/* Attire Guidelines */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          {attireGroups.length > 0 && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <SectionIconDivider icon={<Shirt className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />} />
            <h3
              className={`${theSeasons.className} ${ct.sectionTitle} mt-3 uppercase font-semibold leading-tight tracking-[0.12em] sm:mt-4 md:tracking-[0.15em]`}
              style={onBg}
            >
              {attire.title}
            </h3>
            <p className={`font-goudy-italic ${ct.bodyLg} mt-3 leading-relaxed sm:mt-4`} style={{ ...onBgBody, fontWeight: 600 }}>
              {attire.description}
            </p>
          </div>
          )}


          <div className="mx-auto mb-6 w-full max-w-3xl space-y-5 sm:mb-8 sm:space-y-6 md:mb-10">
            {attireGroups.map((group) => {
              const palette = toPaletteColors(group.palette)
              const hasPalette = palette.length > 0
              const halves = [group.ladies, group.gentlemen].filter(
                (half) => half.details.trim() || half.roles.length > 0,
              )
              return (
                <AttireCard
                  key={group.id}
                  title={group.title}
                  image={group.image}
                  alt={`${group.title} attire guide`}
                  dressCode={group.dressCode}
                >
                  <div className="space-y-4 sm:space-y-5">
                    {halves.map((half) => (
                      <AttirePaletteGroup
                        key={half.label}
                        label={half.label}
                        description={half.details.trim() ? highlightPhrase(half.details, half.highlight) : undefined}
                        roles={half.roles}
                      />
                    ))}
                    {/* Palette at the bottom of the card (only cards that have colors) */}
                    {hasPalette ? (
                      <div>
                        <DressCodePaletteHeader
                          title={attire.paletteTitle}
                          subtitle={attire.paletteSubtitle}
                          guideTitle={attire.colorGuideTitle}
                          guideNote={group.note?.trim() || attire.colorGuideNote}
                        />
                        <DressCodePaletteSwatches palette={palette} />
                      </div>
                    ) : group.note?.trim() ? (
                      <p className="font-goudy-italic text-center text-[0.78rem] leading-snug sm:text-sm" style={{ color: C.body }}>
                        {group.note}
                      </p>
                    ) : null}
                  </div>
                </AttireCard>
              )
            })}
          </div>

          {/* Gentle Reminders */}
          <motion.div
            className="relative mx-auto mt-10 max-w-2xl sm:mt-12"
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: revealEase }}
          >
            <div
              className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
              style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
            >
              <motion.div
                className="relative z-10 flex flex-col items-center px-5 py-7 text-center sm:px-10 sm:py-9 md:px-12"
                variants={reminderListVariants}
                initial={reduceMotion ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                <motion.div variants={reminderItemVariants} className="flex flex-col items-center">
                  {reminderImages.length > 0 ? (
                    <CoupleImagesCarousel
                      coupleImages={reminderImages}
                      currentImageIndex={reminderImageIndex}
                      rotationOffset={rotationOffset}
                    />
                  ) : (
                    <DecoImg
                      src={decos.headerOrnament}
                      className="mx-auto mb-3 block h-auto w-20 select-none sm:w-24"
                    />
                  )}
                  <h3
                    className={`${theSeasons.className} ${ct.sectionTitle} font-semibold uppercase tracking-[0.18em]`}
                    style={{ color: C.heading }}
                  >
                    {reminders.title}
                  </h3>
                  <p className={`font-goudy-italic ${ct.body} mx-auto mt-1.5 max-w-md leading-relaxed`} style={{ color: C.soft }}>
                    {reminders.description}
                  </p>
                  <FadeRule className="mt-3.5 sm:mt-4" />
                </motion.div>

                <div className="mt-5 w-full sm:mt-6">
                  {reminders.items.map((item, index) => (
                    <div key={item.title}>
                      {index > 0 ? (
                        <motion.span
                          variants={reminderItemVariants}
                          className="mx-auto my-4 block h-px w-1/2 max-w-[14rem] sm:my-5"
                          style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium), transparent)" }}
                          aria-hidden
                        />
                      ) : null}
                      <ReminderItem title={item.title}>
                        <div className="space-y-2">
                          {item.paragraphs.map((text, i) => (
                            <div key={i} className="space-y-2.5">
                              <p>{fillTimes(text)}</p>
                              {item.showPalette && i === 0 ? <ColorPalette colors={paletteHexes} /> : null}
                            </div>
                          ))}
                        </div>
                      </ReminderItem>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
