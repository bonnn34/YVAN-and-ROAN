"use client"

import { useState, useEffect, useRef } from "react"
import { RefreshCw, Users, Armchair, Crown, ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import localFont from "next/font/local"
import { Cinzel } from "next/font/google"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { fetchInvitationList } from "@/lib/invitation-data"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { SectionBackdrop } from "@/components/section-backdrop"
import { TintedDeco } from "@/components/tinted-deco"
import { DecoCorners } from "@/components/deco-corners"
import { GlyphText } from "@/lib/glyph-text"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

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

// Palette lives in globals.css → motif / welcome tokens. No yellow for text (hard to read):
// deep slate headings, slate body text, slate-blue buttons and guest names.
const TEAL = "var(--color-welcome-navy)"
const IVORY = "#FFFFFF"
const PAPER = "#FFFFFF"
const NAVY = TEAL
const BODY = "var(--color-welcome-text)"
const ACCENT = "var(--color-welcome-heading)"
const HAIRLINE = "color-mix(in srgb, var(--color-motif-medium) 60%, transparent)"
const TEAL_SOFT = "color-mix(in srgb, var(--color-welcome-text) 70%, white)"
// Slate blue — guest names
const LEAF = "var(--color-motif-accent)"
const DEEP_GRADIENT =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"
// Dusty blue → slate blue — monograms
const SAGE_GRADIENT =
  "linear-gradient(180deg, var(--color-motif-medium) 0%, var(--color-motif-accent) 100%)"

// Section background = the circle pattern used across the invitation (PlainBubbles paints the base)
const sectionBg = "var(--color-bg-pattern-base)"

// Text sitting directly on the circle pattern: navy (or dusty blue) with a soft white edge
const textGlow = "0 1px 0 rgb(255 255 255 / 90%), 0 0 12px rgb(255 255 255 / 75%)"
const onBg = {
  color: "var(--color-welcome-navy)",
  textShadow: textGlow,
} as const
const onBgBlue = { color: "var(--color-welcome-heading)", textShadow: textGlow } as const

const palette = {
  body: BODY,
  heading: NAVY,
  label: ACCENT,
  accent: ACCENT,
} as const

const cardStyle = {
  background:
    "radial-gradient(90% 40% at 50% 0%, rgb(255 255 255 / 95%) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 10%, white) 100%)",
  border: "1px solid color-mix(in srgb, var(--color-motif-medium) 65%, transparent)",
  boxShadow:
    "0 22px 48px -26px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

const refreshButtonStyle = {
  borderColor: "rgb(255 255 255 / 70%)",
  background: DEEP_GRADIENT,
  boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent)",
} as const

const chipPrimaryStyle = {
  color: NAVY,
  borderColor: "color-mix(in srgb, var(--color-welcome-heading) 45%, transparent)",
  backgroundColor: "color-mix(in srgb, var(--color-motif-medium) 20%, white)",
} as const

const chipSecondaryStyle = {
  color: NAVY,
  borderColor: HAIRLINE,
  backgroundColor: IVORY,
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease } },
  exit: { opacity: 0, y: -14, scale: 0.98, filter: "blur(3px)", transition: { duration: 0.35, ease } },
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return <TintedDeco src={src} className={className} />
}

// Dusty-blue hairlines either side of a slate-blue diamond
function DiamondDivider() {
  const line = "var(--color-motif-yellow)"
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${line})` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${line})` }} />
    </div>
  )
}

const ct = {
  label: sectionType.label,
  body: sectionType.text,
  bodyLg: sectionType.subheader,
  stat: "text-2xl sm:text-3xl md:text-4xl",
  guestName: sectionType.subheader,
  meta: sectionType.label,
} as const

function BookOfGuestsTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em] pb-1 sm:pb-1.5`}
        style={{
          fontSize: "var(--title-size)",
          ...onBg,
        }}
      >
        <GlyphText text={title} />
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          ...onBgBlue,
        }}
      >
        {subtitle}
      </span>
      <span className="sr-only">{subtitle}</span>
    </h2>
  )
}

interface Guest {
  id: string | number
  name: string
  role: string
  email?: string
  contact?: string
  message?: string
  allowedGuests: number
  companions: { name: string; relationship: string }[]
  tableNumber: string
  isVip: boolean
  status: 'pending' | 'confirmed' | 'declined' | 'request'
  addedBy?: string
  createdAt?: string
  updatedAt?: string
}

// background: false when a parent already paints one continuous circle pattern
// behind this and the next section (see components/invitation-page.tsx)
export function BookOfGuests({ background = true }: { background?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  const copy = siteConfig.bookOfGuests
  const { decos } = copy
  const CARDS_PER_VIEW = Math.max(1, copy.cardsPerView || 4)
  const reduceMotion = useReducedMotion()
  const [totalGuests, setTotalGuests] = useState(0)
  const [rsvpCount, setRsvpCount] = useState(0)
  const [confirmedGuests, setConfirmedGuests] = useState<Guest[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  // Set on the client only — rendering the clock on the server made the time differ at hydration
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  useEffect(() => {
    setLastUpdate((d) => d ?? new Date())
  }, [])
  const [showIncrease, setShowIncrease] = useState(false)
  // Carousel page + autoplay pause (hover/focus/touch, or a few seconds after manual navigation)
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Cards whose full companion list is open
  const [expandedCompanions, setExpandedCompanions] = useState<Set<string>>(new Set())
  const COMPANION_PREVIEW = 4

  const toggleCompanions = (id: string) =>
    setExpandedCompanions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // "Juan  dela Cruz-Santos" → "JC" (letters only, so punctuation never becomes an initial)
  const getInitials = (name: string): string => {
    const words = name
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
      .filter(Boolean)
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    return (words[0] || "").substring(0, 2).toUpperCase()
  }

  // "5" → "Table 5"; "Table 5" / "VIP Table" stay as written
  const formatTable = (table: string): string =>
    /table/i.test(table) ? table : copy.tableLabel.replace("{table}", table)

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatLastUpdate = (date: Date): string =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

  const fetchGuests = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true)
    
    try {
      const data = await fetchInvitationList<Guest>("/api/guests")

      // Filter only confirmed/attending guests
      const attendingGuests = data.filter((guest) => guest.status === "confirmed")
      
      // Sort guests: VIPs first, then by updatedAt (most recent first)
      const sortedGuests = attendingGuests.sort((a, b) => {
        // VIPs come first
        if (a.isVip && !b.isVip) return -1
        if (!a.isVip && b.isVip) return 1
        
        // Then sort by most recent update
        const dateA = new Date(a.updatedAt || 0).getTime()
        const dateB = new Date(b.updatedAt || 0).getTime()
        return dateB - dateA
      })
      
      // Calculate total guests by summing allowedGuests for each confirmed guest
      const totalGuestCount = attendingGuests.reduce((sum, guest) => {
        return sum + (guest.allowedGuests || 1)
      }, 0)
      
      // Show increase animation if count went up
      if (totalGuestCount > totalGuests && totalGuests > 0) {
        setShowIncrease(true)
        setTimeout(() => setShowIncrease(false), 2000)
      }
      
      setTotalGuests(totalGuestCount)
      setRsvpCount(attendingGuests.length)
      setConfirmedGuests(sortedGuests)
      setLastUpdate(new Date())
    } catch (error: any) {
      console.error("Failed to load guests:", error)
    } finally {
      if (showLoading) {
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }

  // Fixed pages (no wrap-around duplicates on the last page)
  const pageCount = Math.max(1, Math.ceil(confirmedGuests.length / CARDS_PER_VIEW))
  const safePage = Math.min(page, pageCount - 1)
  const visibleGuests = confirmedGuests.slice(safePage * CARDS_PER_VIEW, safePage * CARDS_PER_VIEW + CARDS_PER_VIEW)

  // Manual navigation pauses autoplay for a while so the guest can read
  const goToPage = (next: number, dir: 1 | -1) => {
    setDirection(dir)
    setPage(((next % pageCount) + pageCount) % pageCount)
    setIsPaused(true)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 15000)
  }

  useEffect(() => () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchGuests()

    // Set up automatic polling every 30 seconds for real-time updates
    const pollInterval = setInterval(() => {
      fetchGuests()
    }, 30000) // 30 seconds

    // Set up event listener for RSVP updates
    const handleRsvpUpdate = () => {
      // Add a small delay to allow Google Sheets to update
      setTimeout(() => {
        fetchGuests(true)
      }, 2000)
    }

    window.addEventListener("rsvpUpdated", handleRsvpUpdate)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener("rsvpUpdated", handleRsvpUpdate)
    }
  }, [totalGuests])

  // Auto-advance every 7 seconds when there's more than one page (not while paused / reduced motion)
  useEffect(() => {
    if (pageCount <= 1 || isPaused || reduceMotion) return
    const interval = setInterval(() => {
      setDirection(1)
      setPage((prev) => (prev + 1) % pageCount)
    }, 7000)
    return () => clearInterval(interval)
  }, [pageCount, isPaused, reduceMotion])

  const initial = reduceMotion ? false : "hidden"

  return (
    <div
      id="guests"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative isolate z-10 overflow-hidden pt-12 pb-10 sm:pt-14 sm:pb-12 md:pt-16 md:pb-14 lg:pt-20 lg:pb-16`}
      style={background ? { background: sectionBg } : undefined}
    >
      {/* Same circle pattern as the gallery, with the light wash + double border
          (on the invitation page the shared wrapper paints these behind Book of Guests and FAQ) */}
      {background && <PlainBubbles />}
      {background && <SectionBackdrop />}
      {background && copy.showFrame && <div className="deco-frame" aria-hidden="true" />}

      {/* Corner florals (content/site.ts → bookOfGuests.decos) — top only; FAQ continues below */}
      <DecoCorners decos={{ topLeft: decos.topLeft, topRight: decos.topRight }} />

      {/* Section Header */}
      <motion.div
        className="relative z-20 mx-auto mb-8 max-w-5xl px-6 text-center @container/book-of-guests sm:mb-10 sm:px-10 md:px-12"
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
          className="mx-auto mb-3 block h-auto w-28 select-none sm:mb-4 sm:w-36 md:w-44"
        />
        <DiamondDivider />
        <div className="mt-4 mb-4 sm:mt-5 sm:mb-5">
          <BookOfGuestsTitle title={copy.title} subtitle={copy.subtitle} />
        </div>
        <p
          className={`font-goudy-italic mx-auto max-w-2xl px-2 ${sectionType.textRelaxed}`}
          style={{ ...onBg, fontWeight: 600 }}
        >
          {copy.description}
        </p>
        <div className="flex items-center justify-center pt-4 sm:pt-5">
          <span
            className="h-px w-16 sm:w-24 md:w-32"
            style={{ background: "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)" }}
          />
        </div>
      </motion.div>

      <div className="relative z-20 px-5 sm:px-10 md:px-12">
        {/* Stats card */}
        <motion.div
          className="relative mx-auto mb-10 max-w-2xl text-center sm:mb-12 md:mb-14"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div
            className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
            style={cardStyle}
          >
            {/* Inner frame */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-2.5 rounded-[1.4rem] border sm:inset-3 sm:rounded-[1.85rem]"
              style={{ borderColor: HAIRLINE }}
            />

            <button
              type="button"
              onClick={() => fetchGuests(true)}
              disabled={isRefreshing}
              className="group absolute top-5 right-5 z-30 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-45 disabled:hover:scale-100 sm:top-6 sm:right-6 sm:h-9 sm:w-9"
              style={refreshButtonStyle}
              title={copy.refreshLabel}
              aria-label={copy.refreshLabel}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-500 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`}
                style={{ color: IVORY }}
                aria-hidden
              />
            </button>

            <div className="relative z-[1] px-6 py-8 text-center sm:px-10 sm:py-10 md:px-12">
              <div
                className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full sm:mb-4 sm:h-12 sm:w-12"
                style={{
                  background: DEEP_GRADIENT,
                  boxShadow: `0 0 0 4px ${PAPER}, 0 0 0 5px ${HAIRLINE}`,
                }}
                aria-hidden
              >
                <Users className="h-5 w-5" style={{ color: IVORY }} />
              </div>
              <p
                className={`${cinzel.className} ${ct.label} uppercase tracking-[0.22em] font-semibold mb-3 sm:mb-4`}
                style={{ color: palette.label }}
              >
                {copy.statsEyebrow}
              </p>

              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={totalGuests}
                    initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: showIncrease ? 1.12 : 1 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.5, ease }}
                    className={`${cinzel.className} text-4xl font-semibold tabular-nums leading-none sm:text-5xl md:text-6xl`}
                    style={{ color: palette.heading }}
                  >
                    {totalGuests}
                  </motion.span>
                </AnimatePresence>
                <p
                  className={`${cinzel.className} ${ct.bodyLg} font-semibold uppercase leading-snug tracking-[0.12em] text-left`}
                  style={{ color: palette.heading }}
                >
                  {totalGuests === 1 ? copy.guestSingular : copy.guestPlural}
                  <span
                    className="block text-[0.72em] font-normal normal-case tracking-[0.04em]"
                    style={{ color: palette.label }}
                  >
                    {copy.statsCaption}
                  </span>
                </p>
              </div>

              <div className="mt-5 mb-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
                <span
                  className={`${cinzel.className} ${ct.meta} px-3.5 py-1 rounded-full border font-semibold uppercase tracking-[0.12em]`}
                  style={chipPrimaryStyle}
                >
                  {rsvpCount} {rsvpCount === 1 ? copy.rsvpSingular : copy.rsvpPlural}
                </span>
                <span
                  className={`${cinzel.className} ${ct.meta} px-3.5 py-1 rounded-full border font-semibold uppercase tracking-[0.12em]`}
                  style={chipSecondaryStyle}
                >
                  {confirmedGuests.length} {confirmedGuests.length === 1 ? copy.partySingular : copy.partyPlural}
                </span>
              </div>

              <DiamondDivider />

              <p className={`font-goudy-italic ${ct.body} mx-auto mt-4 max-w-md leading-relaxed sm:mt-5`} style={{ color: palette.body }}>
                {copy.thankYou}
              </p>

              <p
                className={`${cinzel.className} ${ct.meta} mt-3 sm:mt-4 uppercase tracking-[0.14em]`}
                style={{ color: TEAL_SOFT }}
              >
                {copy.updatedLabel} {lastUpdate ? formatLastUpdate(lastUpdate) : "—"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Guest List Display */}
        {confirmedGuests.length > 0 && (
          <div className="relative mx-auto max-w-4xl">
            <motion.div
              className="mb-5 text-center sm:mb-7 md:mb-8"
              variants={revealVariants}
              initial={initial}
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
            >
              <p
                className={`${cinzel.className} ${ct.label} uppercase tracking-[0.22em] font-semibold`}
                style={onBgBlue}
              >
                {copy.listEyebrow}
              </p>
              <p className={`font-goudy-italic ${ct.body} mt-1.5`} style={{ ...onBg, fontWeight: 600 }}>
                {copy.listDescription}
              </p>
            </motion.div>

            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocusCapture={() => setIsPaused(true)}
              onBlurCapture={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
            >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={safePage}
                className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
                variants={listVariants}
                initial={initial}
                animate="show"
                exit="exit"
                drag={pageCount > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) goToPage(safePage + 1, 1)
                  else if (info.offset.x > 60) goToPage(safePage - 1, -1)
                }}
                style={{ touchAction: "pan-y" }}
              >
                {visibleGuests.map((guest) => {
                  const table = guest.tableNumber?.trim() || ""
                  const role = guest.role?.trim() || ""
                  const showRole = role !== "" && role.toLowerCase() !== "guest"
                  const companions = (guest.companions || []).filter((c) => c.name && c.name.trim() !== "")
                  const partySize = Math.max(guest.allowedGuests || 1, companions.length + 1)
                  const metaItems = [
                    table ? (
                      <span key="table" className="inline-flex items-center gap-1 whitespace-nowrap" style={{ color: palette.heading }}>
                        <Armchair className="h-3 w-3 shrink-0" aria-hidden />
                        <GlyphText text={formatTable(table)} />
                      </span>
                    ) : null,
                    showRole ? (
                      <span key="role" className="max-w-full truncate">
                        <GlyphText text={role} />
                      </span>
                    ) : null,
                  ].filter(Boolean)
                  return (
                    <motion.article
                      key={String(guest.id)}
                      variants={cardVariants}
                      whileHover={reduceMotion ? undefined : { y: -3 }}
                      transition={{ duration: 0.3, ease }}
                      className="group relative flex flex-col overflow-hidden rounded-2xl px-4 pb-3 pt-3.5 sm:px-5 sm:pb-3.5 sm:pt-4"
                      style={cardStyle}
                    >
                      {/* Hairline inner frame — turns dusty blue on hover */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-1.5 rounded-[0.85rem] border transition-colors duration-300 group-hover:border-[color-mix(in_srgb,var(--color-welcome-heading)_50%,transparent)]"
                        style={{ borderColor: HAIRLINE }}
                      />

                      <div className="relative z-[1] flex items-center gap-3">
                        {/* Monogram */}
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-105 sm:h-[3.25rem] sm:w-[3.25rem]"
                          style={{
                            background: SAGE_GRADIENT,
                            boxShadow: `0 0 0 2px ${IVORY}, 0 0 0 3px ${HAIRLINE}, 0 6px 14px -6px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)`,
                          }}
                          aria-hidden
                        >
                          <span className={`${cinzel.className} text-[0.95rem] font-semibold tracking-[0.06em]`} style={{ color: IVORY }}>
                            {getInitials(guest.name)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          {guest.isVip && (
                            <span
                              className={`${cinzel.className} mb-1 inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[0.55rem] font-semibold uppercase leading-none tracking-[0.14em]`}
                              style={{ background: DEEP_GRADIENT, color: IVORY }}
                            >
                              <Crown className="h-2.5 w-2.5" aria-hidden />
                              {copy.vipLabel}
                            </span>
                          )}
                          {/* Full name — wraps instead of being cut off */}
                          <h3
                            className={`${theSeasons.className} line-clamp-2 break-words text-[1.08rem] uppercase leading-[1.15] tracking-[0.06em] sm:text-[1.15rem]`}
                            style={{ color: LEAF }}
                            title={guest.name}
                          >
                            <GlyphText text={guest.name} />
                          </h3>
                          {metaItems.length > 0 && (
                            <div
                              className={`${cinzel.className} mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.12em]`}
                              style={{ color: palette.label }}
                            >
                              {metaItems.map((item, i) => (
                                <span key={i} className="inline-flex items-center gap-2">
                                  {i > 0 && <span aria-hidden className="h-1 w-1 shrink-0 rotate-45" style={{ background: TEAL_SOFT }} />}
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Party size */}
                        <div
                          className="flex shrink-0 flex-col items-center justify-center rounded-xl px-2.5 py-1.5 text-center"
                          style={{ background: "color-mix(in srgb, var(--color-motif-medium) 16%, white)", boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                          aria-label={`${partySize} ${partySize === 1 ? copy.guestSingular : copy.guestPlural}`}
                        >
                          <span className={`${cinzel.className} text-[1.3rem] font-semibold leading-none tabular-nums`} style={{ color: NAVY }}>
                            {partySize}
                          </span>
                          <span className={`${cinzel.className} mt-1 text-[0.5rem] font-semibold uppercase leading-none tracking-[0.14em]`} style={{ color: TEAL_SOFT }}>
                            {partySize === 1 ? copy.guestSingular : copy.guestPlural}
                          </span>
                        </div>
                      </div>

                      {companions.length > 0 && (() => {
                        const cardId = String(guest.id)
                        const expanded = expandedCompanions.has(cardId)
                        const shown = expanded ? companions : companions.slice(0, COMPANION_PREVIEW)
                        const hidden = companions.length - shown.length
                        return (
                          <div className="relative z-[1] mt-3 border-t pt-2.5" style={{ borderColor: HAIRLINE }}>
                            <p
                              className={`${cinzel.className} mb-1.5 flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em]`}
                              style={{ color: TEAL_SOFT }}
                            >
                              <Users className="h-3 w-3" aria-hidden />
                              {copy.companionsLabel}
                            </p>
                            <ul className="flex flex-wrap gap-1.5">
                              {shown.map((companion, idx) => (
                                <li
                                  key={idx}
                                  className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full py-[3px] pl-[3px] pr-2.5"
                                  style={{ background: IVORY, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                                >
                                  <span
                                    className={`${cinzel.className} flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-semibold leading-none`}
                                    style={{ background: SAGE_GRADIENT, color: IVORY }}
                                    aria-hidden
                                  >
                                    {getInitials(companion.name).slice(0, 1)}
                                  </span>
                                  <span className="font-goudy-italic min-w-0 truncate text-[0.8rem] leading-tight" style={{ color: palette.heading }}>
                                    <GlyphText text={companion.name.trim()} />
                                  </span>
                                  {companion.relationship && companion.relationship.trim() !== "" ? (
                                    <span
                                      className={`${cinzel.className} shrink-0 text-[0.52rem] font-semibold uppercase leading-none tracking-[0.1em]`}
                                      style={{ color: TEAL_SOFT }}
                                    >
                                      <GlyphText text={companion.relationship.trim()} />
                                    </span>
                                  ) : null}
                                </li>
                              ))}
                              {(hidden > 0 || expanded) && companions.length > COMPANION_PREVIEW && (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => toggleCompanions(cardId)}
                                    className={`${cinzel.className} inline-flex h-[1.65rem] items-center rounded-full px-2.5 text-[0.55rem] font-semibold uppercase leading-none tracking-[0.12em] transition-all hover:brightness-110`}
                                    style={{ background: DEEP_GRADIENT, color: IVORY }}
                                    aria-expanded={expanded}
                                  >
                                    {expanded ? copy.companionsLess : copy.companionsMore.replace("{count}", String(hidden))}
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        )
                      })()}

                      {guest.updatedAt && (
                        <p
                          className={`${cinzel.className} relative z-[1] mt-auto flex items-center justify-end gap-1 pt-2.5 text-[0.55rem] font-semibold uppercase leading-none tracking-[0.12em]`}
                          style={{ color: TEAL_SOFT }}
                        >
                          <CalendarCheck className="h-3 w-3" aria-hidden />
                          {copy.confirmedLabel} {formatDate(guest.updatedAt)}
                        </p>
                      )}
                    </motion.article>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Pager: arrows + clickable dots */}
            {pageCount > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8">
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1, -1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95"
                  style={refreshButtonStyle}
                  aria-label={copy.prevLabel}
                >
                  <ChevronLeft className="h-4 w-4" style={{ color: IVORY }} aria-hidden />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: pageCount }).map((_, idx) => {
                    const isActive = safePage === idx
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => goToPage(idx, idx >= safePage ? 1 : -1)}
                        className="flex h-6 items-center justify-center"
                        aria-label={copy.pageLabel.replace("{n}", String(idx + 1))}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: isActive ? "1.5rem" : "0.375rem",
                            background: isActive ? "var(--color-welcome-heading)" : "color-mix(in srgb, var(--color-welcome-heading) 30%, transparent)",
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1, 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95"
                  style={refreshButtonStyle}
                  aria-label={copy.nextLabel}
                >
                  <ChevronRight className="h-4 w-4" style={{ color: IVORY }} aria-hidden />
                </button>
              </div>
            )}
            </div>
          </div>
        )}

        {confirmedGuests.length === 0 && !isRefreshing && (
          <motion.div
            className="relative mx-auto max-w-xl px-4 text-center"
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="rounded-[1.5rem] px-6 py-10 sm:py-12" style={cardStyle}>
              <p className={`${cinzel.className} ${ct.bodyLg} mb-2 font-semibold uppercase tracking-[0.1em]`} style={{ color: palette.heading }}>
                {copy.emptyTitle}
              </p>
              <p className={`font-goudy-italic ${ct.body}`} style={{ color: palette.body }}>
                {copy.emptyText}
              </p>
            </div>
          </motion.div>
        )}

        <DecoImg
          src={decos.footerVine}
          className="mx-auto mt-10 block h-auto w-56 select-none opacity-90 sm:mt-12 sm:w-72 md:w-96"
        />
      </div>
    </div>
  )
}
