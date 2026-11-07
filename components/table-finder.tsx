"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Armchair,
  CheckCircle2,
  Clock,
  QrCode,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { TintedDeco } from "@/components/tinted-deco"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

// Motif colors (app/globals.css) — no yellow for text (hard to read):
// navy titles, dusty-blue labels, body-blue text, deep sage green for your name,
// dusty-blue buttons; sunshine only as a tiny ornament.
const IVORY = "#FFFFFF"
const GOLD = "var(--color-welcome-heading)" // accent labels & icons (dusty blue)
const NAVY = "var(--color-welcome-navy)"
const SCRIPT = "var(--color-welcome-heading)"
const BODY = "var(--color-welcome-text)"
const LEAF = "color-mix(in srgb, var(--color-motif-yellow) 70%, #002059)" // deep sage green
const SUN = "var(--color-motif-accent)"
const NAV_GOLD =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"
const GOLD_BORDER = "color-mix(in srgb, var(--color-motif-medium) 65%, transparent)"
const GOLD_BORDER_SOFT = "color-mix(in srgb, var(--color-motif-medium) 35%, transparent)"
const CHAMPAGNE = "var(--color-motif-medium)" // sky — used for soft highlight tints

// Soft white edge so text stays crisp over the circle pattern
const textGlow = "0 1px 0 rgb(255 255 255 / 90%), 0 0 12px rgb(255 255 255 / 75%)"

// Sage hairlines
const goldDividerStyle = {
  background: "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
} as const

const goldDividerStyleLeft = {
  background: "linear-gradient(to left, transparent, var(--color-motif-yellow), transparent)",
} as const

const cardStyle = {
  background:
    "radial-gradient(90% 35% at 50% 0%, rgb(255 255 255 / 95%) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 10%, white) 100%)",
  borderColor: GOLD_BORDER,
  borderWidth: "1px",
  borderStyle: "solid" as const,
  boxShadow:
    "0 18px 38px -22px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)",
} as const

const innerSurfaceStyle = {
  background: "color-mix(in srgb, var(--color-motif-medium) 12%, white)",
  borderColor: GOLD_BORDER_SOFT,
} as const

const primaryButtonStyle = {
  background: NAV_GOLD,
  borderColor: "rgb(255 255 255 / 70%)",
  color: IVORY,
  boxShadow:
    "0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 22%, transparent), 0 10px 22px -10px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

const CORNER_DECO_CLASS =
  "block h-auto w-auto max-w-[120px] sm:max-w-[180px] md:max-w-[260px] lg:max-w-[320px] xl:max-w-[380px] select-none"

type RsvpStatus = "pending" | "confirmed" | "declined" | "request"

interface ApiGuest {
  id: string | number
  name: string
  role?: string
  allowedGuests?: number
  companions?: Array<{ name: string; relationship: string }>
  tableNumber?: string
  isVip?: boolean
  status?: RsvpStatus
}

interface SeatEntry {
  key: string
  name: string
  tableNumber: string
  status: RsvpStatus
  isCompanion: boolean
  relationship?: string
  primaryName?: string
  isVip: boolean
}

function tableSortValue(label: string) {
  const match = label.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER
}

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .map((part) =>
          part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part,
        )
        .join("-"),
    )
    .join(" ")
}

function formatTableLabel(raw: string) {
  const value = raw.trim()
  if (!value) return ""
  const labeled = /^table\b/i.test(value) ? value : `Table ${value}`
  return toTitleCase(labeled)
}

function TableLabel({
  label,
  className,
  style,
}: {
  label: string
  className?: string
  style?: CSSProperties
}) {
  const match = label.match(/^(.*?)(\d+)\s*$/)
  if (!match) {
    return (
      <span className={className} style={style}>
        {label}
      </span>
    )
  }

  return (
    <span className={className} style={style}>
      {match[1]}
      <span className={`${cinzel.className} font-bold`} style={{ fontWeight: 700 }}>
        {match[2]}
      </span>
    </span>
  )
}

function foldName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’.`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function nameTokens(value: string) {
  return foldName(value).split(/\s+/).filter(Boolean)
}

function scoreSeatMatch(entry: SeatEntry, query: string) {
  const foldedQuery = foldName(query)
  if (!foldedQuery) return null

  const queryParts = foldedQuery.split(/\s+/).filter(Boolean)
  const haystacks = [entry.name, entry.primaryName].filter(Boolean) as string[]

  let best: number | null = null
  const consider = (score: number) => {
    best = best === null ? score : Math.min(best, score)
  }

  for (const hay of haystacks) {
    const folded = foldName(hay)
    const words = nameTokens(hay)
    if (!folded) continue

    if (folded === foldedQuery) consider(0)
    else if (folded.startsWith(foldedQuery)) consider(1)
    else if (words.some((word) => word === foldedQuery)) consider(2)
    else if (words.some((word) => word.startsWith(foldedQuery))) consider(3)
    else if (
      queryParts.length > 1 &&
      queryParts.every((part) => words.some((word) => word.startsWith(part)))
    ) {
      consider(4)
    } else if (folded.includes(foldedQuery)) consider(5)
  }

  return best
}

const SUGGESTION_LIMIT = 5

function HighlightedText({ text, query }: { text: string; query: string }) {
  const tokens = nameTokens(query)
  if (tokens.length === 0) return <>{text}</>

  return (
    <>
      {text.split(/(\s+)/).map((part, index) => {
        if (!part.trim()) return <span key={index}>{part}</span>
        const folded = foldName(part)
        const matched = tokens.some((token) =>
          token.length === 1 ? folded.startsWith(token) : folded.startsWith(token) || folded.includes(token),
        )
        if (!matched) return <span key={index}>{part}</span>
        return (
          <span
            key={index}
            className="rounded-sm font-semibold"
            style={{ color: NAVY, background: "color-mix(in srgb, var(--color-motif-yellow) 28%, transparent)" }}
          >
            {part}
          </span>
        )
      })}
    </>
  )
}

function tableAnchorId(label: string) {
  return `seating-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
}

function rsvpCopy(status: RsvpStatus) {
  if (status === "confirmed") {
    return { label: "RSVP confirmed", short: "Confirmed" }
  }
  if (status === "declined") {
    return { label: "Unable to attend", short: "Declined" }
  }
  return { label: "Awaiting RSVP", short: "Pending" }
}

function OutsideDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-px w-10 sm:w-16" style={goldDividerStyle} />
      <span className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" style={{ background: SUN }} aria-hidden />
      <span className="h-px w-10 sm:w-16" style={goldDividerStyleLeft} />
    </div>
  )
}

function RsvpBadge({ status, compact = false }: { status: RsvpStatus; compact?: boolean }) {
  const copy = rsvpCopy(status)
  const isConfirmed = status === "confirmed"
  const isDeclined = status === "declined"
  const Icon = isConfirmed ? CheckCircle2 : isDeclined ? XCircle : Clock

  return (
    <span
      className={`${cinzel.className} inline-flex shrink-0 items-center gap-1 rounded-full border font-semibold uppercase tracking-[0.1em] ${
        compact
          ? "px-1.5 py-px text-[0.5rem] sm:px-2 sm:text-[0.575rem]"
          : "px-2 py-0.5 text-[0.55rem] sm:px-2.5 sm:text-[0.625rem]"
      }`}
      style={{
        color: isConfirmed ? LEAF : isDeclined ? "color-mix(in srgb, var(--color-welcome-text) 65%, white)" : GOLD,
        borderColor: isConfirmed
          ? "color-mix(in srgb, var(--color-motif-yellow) 70%, transparent)"
          : isDeclined
            ? "color-mix(in srgb, var(--color-welcome-text) 25%, transparent)"
            : GOLD_BORDER,
        backgroundColor: isConfirmed
          ? "color-mix(in srgb, var(--color-motif-yellow) 16%, white)"
          : isDeclined
            ? "color-mix(in srgb, var(--color-welcome-text) 6%, white)"
            : "color-mix(in srgb, var(--color-motif-medium) 14%, white)",
      }}
    >
      <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} aria-hidden />
      {copy.short}
    </span>
  )
}

function buildSeatEntries(guests: ApiGuest[]): SeatEntry[] {
  const entries: SeatEntry[] = []

  for (const guest of guests) {
    const name = guest.name?.trim()
    if (!name) continue

    const tableNumber = (guest.tableNumber || "").trim()
    const status = guest.status || "pending"
    const companions = Array.isArray(guest.companions)
      ? guest.companions.filter((companion) => companion.name?.trim())
      : []

    const displayName = toTitleCase(name)

    entries.push({
      key: `guest-${guest.id}`,
      name: displayName,
      tableNumber,
      status,
      isCompanion: false,
      isVip: guest.isVip === true,
    })

    companions.forEach((companion, index) => {
      entries.push({
        key: `guest-${guest.id}-companion-${index}`,
        name: toTitleCase(companion.name),
        tableNumber,
        status,
        isCompanion: true,
        relationship: companion.relationship?.trim()
          ? toTitleCase(companion.relationship)
          : "",
        primaryName: displayName,
        isVip: false,
      })
    })
  }

  return entries
}

function groupSeatsByTable(entries: SeatEntry[]) {
  const groups = new Map<string, SeatEntry[]>()

  for (const entry of entries) {
    if (!entry.tableNumber) continue
    const existing = groups.get(entry.tableNumber) ?? []
    existing.push(entry)
    groups.set(entry.tableNumber, existing)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      const diff = tableSortValue(a) - tableSortValue(b)
      return diff !== 0 ? diff : a.localeCompare(b)
    })
    .map(([tableNumber, seats]) => ({
      tableNumber,
      label: formatTableLabel(tableNumber),
      seats: [...seats].sort((a, b) => a.name.localeCompare(b.name)),
    }))
}

const howItWorks = [
  {
    step: "One",
    title: "Scan",
    icon: QrCode,
    body: "Open your camera and scan the code. You'll arrive on this seating page.",
  },
  {
    step: "Two",
    title: "Search",
    icon: Search,
    body: "Type your name to see your table number.",
  },
  {
    step: "Three",
    title: "Sit",
    icon: Armchair,
    body: "Walk to your table, take your seat, and enjoy the evening.",
  },
] as const

export function TableFinder() {
  const siteConfig = useSiteConfig()
  const tfDecos = siteConfig.tableFinder.decos
  const groomName = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const brideName = siteConfig.couple.brideNickname || siteConfig.couple.bride

  const [entries, setEntries] = useState<SeatEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<SeatEntry | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const fetchGuests = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/guests")
      if (!response.ok) throw new Error("Failed to fetch guests")
      const data: ApiGuest[] = await response.json()
      setEntries(buildSeatEntries(Array.isArray(data) ? data : []))
    } catch (err) {
      console.error("Error fetching guests:", err)
      setError("We couldn't load the seating list. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  const { suggestions, extraCount } = useMemo(() => {
    const query = searchQuery.trim()
    if (!query) return { suggestions: [] as SeatEntry[], extraCount: 0 }

    const ranked = entries
      .map((entry) => ({ entry, score: scoreSeatMatch(entry, query) }))
      .filter((item): item is { entry: SeatEntry; score: number } => item.score !== null)
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score
        return a.entry.name.localeCompare(b.entry.name)
      })
      .map((item) => item.entry)

    return {
      suggestions: ranked.slice(0, SUGGESTION_LIMIT),
      extraCount: Math.max(0, ranked.length - SUGGESTION_LIMIT),
    }
  }, [searchQuery, entries])

  useEffect(() => {
    setIsSearching(searchQuery.trim().length > 0 && suggestions.length > 0 && !selectedSeat)
  }, [searchQuery, suggestions.length, selectedSeat])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const tables = useMemo(() => groupSeatsByTable(entries), [entries])

  const tablemates = useMemo(() => {
    if (!selectedSeat?.tableNumber) return []
    return entries
      .filter(
        (entry) =>
          entry.tableNumber === selectedSeat.tableNumber && entry.key !== selectedSeat.key,
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [entries, selectedSeat])

  const handleSelectSeat = (seat: SeatEntry) => {
    setSelectedSeat(seat)
    setSearchQuery(seat.name)
    setIsSearching(false)
  }

  return (
    <main
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative min-h-screen overflow-x-hidden`}
      style={{ background: "var(--color-bg-pattern-base)" }}
    >
      {/* Same circle pattern as the invitation sections */}
      <PlainBubbles />
      <div className="pointer-events-none absolute left-0 top-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {tfDecos.topLeft ? <TintedDeco src={tfDecos.topLeft} className={CORNER_DECO_CLASS} /> : null}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {tfDecos.topRight ? <TintedDeco src={tfDecos.topRight} className={CORNER_DECO_CLASS} /> : null}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {tfDecos.bottomLeft ? <TintedDeco src={tfDecos.bottomLeft} className={CORNER_DECO_CLASS} /> : null}
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {tfDecos.bottomRight ? <TintedDeco src={tfDecos.bottomRight} className={CORNER_DECO_CLASS} /> : null}
      </div>

      <section className="relative z-20 mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:px-8">
        <div className="relative mx-auto max-w-xl text-center @container/table-hero">
          {/* Soft white glow so the heading reads cleanly over the circles */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[90%] w-[min(40rem,120%)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: "radial-gradient(ellipse at center, rgb(255 255 255 / 75%) 0%, rgb(255 255 255 / 30%) 50%, transparent 72%)" }}
          />
          <div className="mx-auto mb-4 sm:mb-5">
            <OutsideDivider />
          </div>

          <p
            className={`${cinzel.className} ${sectionType.label} font-semibold uppercase leading-normal tracking-[0.18em] min-[400px]:tracking-[0.28em] sm:tracking-[0.36em]`}
            style={{ color: GOLD, textShadow: textGlow }}
          >
            {groomName}
            <span
              className={`${aboveTheBeyond.className} mx-1 inline-block normal-case tracking-normal sm:mx-2`}
              style={{
                fontSize: "1.35em",
                color: SCRIPT,
                verticalAlign: "middle",
              }}
              aria-hidden
            >
              &
            </span>
            {brideName}
          </p>

          <h1
            className="welcome-title-lockup relative mx-auto mt-4 w-full max-w-full text-center sm:mt-6"
            style={
              {
                "--title-size": layeredSectionTitleSize.main,
                "--script-size": layeredSectionTitleSize.script,
                "--script-overlap": layeredSectionTitleSize.overlap,
              } as CSSProperties
            }
          >
            <span
              className={`${theSeasons.className} block uppercase leading-[0.76] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
              style={{ fontSize: "var(--title-size)", color: NAVY, textShadow: textGlow }}
            >
              Find Your Table
            </span>
            <span
              aria-hidden
              className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-[var(--script-overlap)] block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9]`}
              style={{
                fontSize: "var(--script-size)",
                color: SCRIPT,
                textShadow: textGlow,
              }}
            >
              Please be seated
            </span>
            <span className="sr-only">Please be seated</span>
          </h1>

          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-md px-2 sm:mt-5 ${sectionType.textRelaxed}`}
            style={{ color: BODY, textShadow: textGlow, fontWeight: 600 }}
          >
            Search your name to find your table, then walk in and take your seat.
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 sm:mt-5">
            <span className="h-px w-8 sm:w-12" style={goldDividerStyle} />
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8"
              style={{ background: IVORY, boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-motif-yellow) 70%, transparent)" }}
              aria-hidden
            >
              <Armchair className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: GOLD }} />
            </span>
            <span className="h-px w-8 sm:w-12" style={goldDividerStyleLeft} />
          </div>

          <div ref={searchRef} className="relative z-30 mx-auto mt-6 w-full sm:mt-8">
            <label htmlFor="table-search" className="sr-only">
              Search your name to find your table
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 sm:h-5 sm:w-5"
                style={{ color: GOLD }}
              />
              <input
                id="table-search"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedSeat(null)
                }}
                onFocus={() => {
                  if (searchQuery.trim() && suggestions.length > 0 && !selectedSeat) {
                    setIsSearching(true)
                  }
                }}
                placeholder="Search your name..."
                className="w-full rounded-full border py-3.5 pl-12 pr-5 font-goudy-italic text-base outline-none transition-shadow duration-300 placeholder:text-[color-mix(in_srgb,var(--color-welcome-text)_55%,white)] focus:border-[var(--color-welcome-heading)] focus:shadow-lg sm:py-4 sm:pl-14"
                style={{
                  borderColor: GOLD_BORDER,
                  color: NAVY,
                  backgroundColor: IVORY,
                  boxShadow:
                    "0 0 0 4px rgb(255 255 255 / 45%), 0 12px 28px -14px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent)",
                }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {isSearching && (
              <div
                className="absolute left-0 right-0 z-[9999] mt-2 overflow-hidden rounded-2xl border shadow-2xl"
                style={{
                  backgroundColor: IVORY,
                  borderColor: GOLD_BORDER,
                }}
              >
                {suggestions.map((seat) => (
                  <button
                    key={seat.key}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectSeat(seat)}
                    className="flex w-full items-center gap-3 border-b px-3.5 py-2.5 text-left last:border-b-0 sm:px-4"
                    style={{ borderColor: GOLD_BORDER_SOFT }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${CHAMPAGNE} 16%, ${IVORY})`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9"
                      style={{ background: NAV_GOLD }}
                    >
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: IVORY }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate font-goudy-italic text-[0.98rem] normal-case"
                        style={{ color: NAVY }}
                      >
                        <HighlightedText text={seat.name} query={searchQuery} />
                      </div>
                      {seat.isCompanion && seat.primaryName ? (
                        <div className={`${sectionType.label} mt-0.5 truncate normal-case`} style={{ color: BODY }}>
                          Guest of {seat.primaryName}
                        </div>
                      ) : null}
                    </div>
                    <span
                      className={`${theSeasons.className} shrink-0 text-base tracking-[0.02em]`}
                      style={{ color: NAVY }}
                    >
                      {seat.tableNumber ? (
                        <TableLabel label={formatTableLabel(seat.tableNumber)} />
                      ) : (
                        <span className={`font-goudy-italic ${sectionType.label}`} style={{ color: BODY }}>
                          No table yet
                        </span>
                      )}
                    </span>
                  </button>
                ))}
                {extraCount > 0 ? (
                  <p
                    className={`font-goudy-italic px-4 py-2 text-center ${sectionType.label}`}
                    style={{ color: BODY }}
                  >
                    Keep typing to narrow {extraCount} more {extraCount === 1 ? "name" : "names"}
                  </p>
                ) : null}
              </div>
            )}

            {searchQuery.trim() && suggestions.length === 0 && !isLoading && (
              <div
                className="absolute left-0 right-0 z-[9999] mt-2 rounded-2xl border px-4 py-3.5 text-left shadow-xl"
                style={{
                  backgroundColor: IVORY,
                  borderColor: GOLD_BORDER,
                }}
              >
                <p className={`font-goudy-italic ${sectionType.textSnug}`} style={{ color: BODY }}>
                  We couldn&apos;t find that name. Try another spelling, or ask the couple if
                  you&apos;re not on the list.
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedSeat && (
          <div
            className="relative mx-auto mt-5 max-w-xl overflow-hidden rounded-2xl border px-5 py-6 text-center sm:mt-7 sm:px-8 sm:py-8"
            style={cardStyle}
          >
            <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />
            <p className={`font-goudy-italic ${sectionType.text}`} style={{ color: BODY }}>
              Hello{" "}
              <span className="font-semibold" style={{ color: LEAF }}>
                {selectedSeat.name}
              </span>
              {selectedSeat.isCompanion && selectedSeat.primaryName
                ? `, guest of ${selectedSeat.primaryName}`
                : ""}
            </p>

            {selectedSeat.tableNumber ? (
              <>
                <div className="mx-auto my-4 h-px w-16" style={goldDividerStyle} />
                <p
                  className={`${cinzel.className} text-[0.65rem] font-semibold uppercase tracking-[0.22em]`}
                  style={{ color: GOLD }}
                >
                  Your table
                </p>
                <p
                  className={`${theSeasons.className} mt-2 text-[2.15rem] leading-none tracking-[0.04em] sm:text-5xl`}
                  style={{ color: NAVY }}
                >
                  <TableLabel label={formatTableLabel(selectedSeat.tableNumber)} />
                </p>
              </>
            ) : (
              <p
                className={`${theSeasons.className} mt-4 text-lg tracking-[0.04em] sm:text-xl`}
                style={{ color: NAVY }}
              >
                Your table will be posted soon
              </p>
            )}

            <div className="mt-3 flex justify-center">
              <RsvpBadge status={selectedSeat.status} />
            </div>

            <p
              className={`font-goudy-italic mx-auto mt-3 max-w-md ${sectionType.textSnug}`}
              style={{ color: BODY }}
            >
              {selectedSeat.status === "confirmed" && selectedSeat.tableNumber
                ? "You're all set. Find your table and enjoy the celebration."
                : selectedSeat.status === "confirmed"
                  ? "You're confirmed. Your table will appear here once seating is posted."
                  : selectedSeat.status === "declined"
                    ? "You've let us know you can't attend. If plans change, please tell the couple."
                    : selectedSeat.tableNumber
                      ? "A seat is waiting for you. Please RSVP so we can confirm it."
                      : "Please RSVP first. Your table will appear here once seating is posted."}
            </p>

            {selectedSeat.status !== "confirmed" && selectedSeat.status !== "declined" && (
              <Link
                href="/#guest-list"
                className={`${cinzel.className} mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border px-5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:tracking-[0.2em]`}
                style={primaryButtonStyle}
              >
                Confirm your attendance
              </Link>
            )}

            {tablemates.length > 0 && (
              <div className="mt-5 rounded-xl border p-3 text-left sm:p-4" style={innerSurfaceStyle}>
                <p
                  className={`${cinzel.className} mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em]`}
                  style={{ color: GOLD }}
                >
                  Seated with you
                </p>
                <ul className="space-y-2">
                  {tablemates.map((mate) => (
                    <li key={mate.key} className="flex items-center justify-between gap-2">
                      <span
                        className={`min-w-0 truncate font-goudy-italic ${sectionType.text}`}
                        style={{ color: NAVY }}
                      >
                        {mate.name}
                      </span>
                      <RsvpBadge status={mate.status} compact />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mx-auto mt-10 max-w-6xl sm:mt-16">
          <div className="mb-5 text-center sm:mb-7">
            <div className="mx-auto mb-3">
              <OutsideDivider />
            </div>
            <h2
              className={`${theSeasons.className} text-xl uppercase tracking-[0.12em] sm:text-3xl`}
              style={{ color: NAVY, textShadow: textGlow }}
            >
              Seating Chart
            </h2>
            <p
              className={`${aboveTheBeyond.className} mx-auto mt-1 block w-fit`}
              style={{ color: SCRIPT, fontSize: "clamp(1.05rem, 3.4vw, 1.75rem)", textShadow: textGlow }}
            >
              everyone together
            </p>
            <p className={`font-goudy-italic mx-auto mt-2 max-w-xl px-2 ${sectionType.text}`} style={{ color: BODY, textShadow: textGlow, fontWeight: 600 }}>
              Everyone is grouped by table. RSVP status sits beside each name.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <RsvpBadge status="confirmed" compact />
              <RsvpBadge status="pending" compact />
              <RsvpBadge status="declined" compact />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10" style={{ color: BODY }}>
              <RefreshCw className="h-4 w-4 animate-spin" style={{ color: GOLD }} />
              <span className={`font-goudy-italic ${sectionType.text}`}>Loading seating...</span>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md rounded-2xl border p-5 text-center" style={cardStyle}>
              <AlertCircle className="mx-auto mb-2 h-5 w-5" style={{ color: "var(--color-welcome-text-soft)" }} />
              <p className={`font-goudy-italic ${sectionType.text}`} style={{ color: BODY }}>
                {error}
              </p>
              <button
                type="button"
                onClick={fetchGuests}
                className={`${cinzel.className} mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
                style={primaryButtonStyle}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          ) : tables.length === 0 ? (
            <p className={`font-goudy-italic text-center ${sectionType.text}`} style={{ color: BODY }}>
              Seating is still being arranged. Search your name above, or check back soon.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {tables.map((table) => {
                const isSelectedTable = selectedSeat?.tableNumber === table.tableNumber
                const confirmedCount = table.seats.filter((seat) => seat.status === "confirmed").length

                return (
                  <article
                    key={table.tableNumber}
                    id={tableAnchorId(table.tableNumber)}
                    className="rounded-2xl border p-3.5 sm:p-5"
                    style={{
                      ...cardStyle,
                      borderColor: isSelectedTable ? "var(--color-welcome-heading)" : GOLD_BORDER,
                      boxShadow: isSelectedTable
                        ? "0 0 0 3px color-mix(in srgb, var(--color-motif-yellow) 45%, transparent), 0 18px 38px -18px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)"
                        : cardStyle.boxShadow,
                    }}
                  >
                    <div
                      className="mb-3 flex items-center gap-3 border-b pb-3"
                      style={{ borderColor: GOLD_BORDER_SOFT }}
                    >
                      <div
                        className={`${cinzel.className} flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold sm:h-12 sm:w-12 sm:text-xl`}
                        style={{
                          background: NAV_GOLD,
                          color: IVORY,
                          fontWeight: 700,
                        }}
                      >
                        {table.tableNumber.match(/(\d+)/)?.[1] ?? "—"}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`${theSeasons.className} text-lg tracking-[0.04em] sm:text-xl`}
                          style={{ color: NAVY }}
                        >
                          <TableLabel label={table.label} />
                        </p>
                        <p className={`font-goudy-italic ${sectionType.label}`} style={{ color: BODY }}>
                          {table.seats.length} {table.seats.length === 1 ? "guest" : "guests"}
                          {" · "}
                          {confirmedCount} confirmed
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-1 sm:space-y-1.5">
                      {table.seats.map((seat) => {
                        const isSelected = selectedSeat?.key === seat.key
                        return (
                          <li
                            key={seat.key}
                            className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 sm:px-2"
                            style={{
                              backgroundColor: isSelected
                                ? "color-mix(in srgb, var(--color-motif-yellow) 18%, white)"
                                : "transparent",
                            }}
                          >
                            <div className="min-w-0">
                              <p
                                className={`truncate font-goudy-italic text-[0.8125rem] sm:text-[0.9375rem] ${
                                  seat.status === "declined" ? "line-through opacity-70" : ""
                                }`}
                                style={{ color: isSelected ? LEAF : NAVY, fontWeight: isSelected ? 600 : undefined }}
                              >
                                {seat.name}
                              </p>
                              {seat.isCompanion && seat.primaryName ? (
                                <p className={`${sectionType.label} truncate`} style={{ color: BODY }}>
                                  Guest of {seat.primaryName}
                                  {seat.relationship ? ` · ${seat.relationship}` : ""}
                                </p>
                              ) : null}
                            </div>
                            <RsvpBadge status={seat.status} compact />
                          </li>
                        )
                      })}
                    </ul>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <div
          className="mx-auto mt-12 max-w-4xl border-t pt-8 sm:mt-16 sm:pt-10"
          style={{ borderColor: "color-mix(in srgb, var(--color-motif-yellow) 55%, transparent)" }}
        >
          <p
            className={`${cinzel.className} mb-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.6875rem] sm:tracking-[0.22em]`}
            style={{ color: GOLD, textShadow: textGlow }}
          >
            How it works
          </p>
          <p
            className={`font-goudy-italic mx-auto mb-5 max-w-md px-2 text-center sm:mb-6 ${sectionType.textSnug}`}
            style={{ color: BODY, textShadow: textGlow, fontWeight: 600 }}
          >
            Three simple steps from the doorway to your seat.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {howItWorks.map((item) => (
              <div key={item.title} className="rounded-xl border px-2 py-4 text-center sm:px-4 sm:py-5" style={cardStyle}>
                <p
                  className={`${cinzel.className} text-[0.5rem] font-semibold uppercase tracking-[0.16em] sm:text-[0.625rem] sm:tracking-[0.22em]`}
                  style={{ color: GOLD }}
                >
                  {item.step}
                </p>
                <div
                  className="mx-auto my-2.5 flex h-9 w-9 items-center justify-center rounded-full sm:my-3 sm:h-10 sm:w-10"
                  style={{ background: NAV_GOLD }}
                >
                  <item.icon className="h-4 w-4" style={{ color: IVORY }} />
                </div>
                <h3
                  className={`${theSeasons.className} text-[0.9rem] tracking-[0.06em] sm:text-xl sm:tracking-[0.08em]`}
                  style={{ color: NAVY }}
                >
                  {item.title}
                </h3>
                <p
                  className={`font-goudy-italic mx-auto mt-1.5 max-w-[16rem] text-[0.65rem] leading-snug sm:mt-2 sm:text-[inherit] ${sectionType.textSnug}`}
                  style={{ color: BODY }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
