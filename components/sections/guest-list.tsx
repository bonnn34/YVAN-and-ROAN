"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarCheck,
  User,
  Mail,
  MessageSquare,
  RefreshCw,
  Heart,
  Sparkles,
  Phone,
  ShieldCheck,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
} from "lucide-react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { fetchUntilReady, isAbortError } from "@/lib/fetch-until-ready"
import { fetchInvitationList, invalidateInvitationData, readCachedInvitationList } from "@/lib/invitation-data"
import { TintedDeco } from "@/components/tinted-deco"
import { GlyphText } from "@/lib/glyph-text"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
// navy titles, body-blue text, dusty-blue buttons, deep sage green for guest names.
const NAVY = "var(--color-welcome-navy)"
const TEAL = "var(--color-welcome-text)"
const BUTTON = "var(--color-welcome-heading)"
const IVORY = "#FFFFFF"
const PAPER = "#FFFFFF"
const DEEP_GRADIENT =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"
const HAIRLINE = "color-mix(in srgb, var(--color-motif-medium) 60%, transparent)"
// Secondary text / unselected options (muted blue, still readable)
const TEAL_SOFT = "color-mix(in srgb, var(--color-welcome-text) 75%, white)"
// Navy veil (with blur) behind modals
const DARK_OVERLAY = "color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)"

const palette = {
  body: TEAL,
  heading: TEAL,
  label: TEAL,
  accent: TEAL,
} as const

const modalCardStyle = {
  background: PAPER,
  border: "1px solid color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
  boxShadow:
    "0 0 0 6px rgb(255 255 255 / 40%), 0 30px 60px -24px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
} as const

const innerSurfaceStyle = {
  background: "color-mix(in srgb, var(--color-motif-medium) 12%, white)",
  borderColor: HAIRLINE,
} as const

const modalInputClass = `w-full rounded-lg border bg-white px-2.5 py-1.5 font-goudy-italic ${sectionType.text} transition-all duration-300 outline-none focus:border-[var(--color-welcome-heading)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-motif-medium)_55%,transparent)] placeholder:text-[color-mix(in_srgb,var(--color-welcome-text)_55%,white)] sm:px-3 sm:py-2`

const modalInputStyle = {
  borderColor: HAIRLINE,
  color: palette.heading,
} as const

const modalLabelClass = `font-goudy-italic mb-1.5 flex flex-wrap items-center gap-1.5 ${sectionType.text} font-semibold sm:mb-2 sm:gap-2`

const dividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
} as const

const primaryButtonStyle = {
  background: DEEP_GRADIENT,
  borderColor: "rgb(255 255 255 / 70%)",
  color: IVORY,
  boxShadow:
    "0 0 0 4px color-mix(in srgb, var(--color-motif-medium) 25%, transparent), 0 12px 24px -10px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
} as const

// Soft sage-green notice box
const noticeStyle = {
  background: "color-mix(in srgb, var(--color-motif-yellow) 14%, white)",
  borderColor: "color-mix(in srgb, var(--color-motif-yellow) 60%, transparent)",
  color: TEAL,
} as const

// "Hello {name}" → string with values, or React nodes when a value is a node
function fill(template: string, values: Record<string, React.ReactNode>): React.ReactNode {
  const parts = template.split(/(\{[a-zA-Z]+\})/)
  return parts.map((part, i) => {
    const key = part.match(/^\{([a-zA-Z]+)\}$/)?.[1]
    return key && key in values ? <span key={i}>{values[key]}</span> : part
  })
}

function fillText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (m, k) => (k in values ? String(values[k]) : m))
}

// "  juan  DELA cruz " → "juan dela cruz" so typed names match the guest list regardless of case/spacing
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim()
}

interface ApiGuest {
  id: string | number
  name: string
  role: string
  email: string
  contact: string
  message: string
  allowedGuests: number
  companions: Array<{ name: string; relationship: string }>
  tableNumber: string
  isVip: boolean
  status: string
  addedBy: string
  createdAt: string
  updatedAt: string
}

interface Guest {
  id: string | number
  Name: string
  Email: string
  Phone: string
  Status: string
  AllowedGuests: number
  Companions: Array<{ name: string; relationship: string }>
  UpdatedAt: string
}

type Companion = { name: string; relationship: string }

function mapApiGuests(data: ApiGuest[]): Guest[] {
  return data
    .filter((guest) => guest.name && guest.name.trim() !== "")
    .map((guest) => ({
      id: guest.id,
      Name: guest.name,
      Email: guest.email || "",
      Phone: guest.contact || "",
      Status: guest.status || "pending",
      AllowedGuests: guest.allowedGuests || 1,
      Companions: Array.isArray(guest.companions) ? guest.companions : [],
      UpdatedAt: guest.updatedAt || guest.createdAt || "",
    }))
}

async function loadGuestsFromApi(signal?: AbortSignal, reload = false): Promise<Guest[]> {
  const data = await fetchInvitationList<ApiGuest>("/api/guests", { signal, reload })
  return mapApiGuests(data)
}

// "2026-11-02T03:49:03.779Z" → "November 2, 2026 at 11:49 AM" (viewer's local time)
function formatConfirmedAt(value: string): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })
}

const EMPTY_FORM = { Name: "", Email: "", Phone: "", RSVP: "" }

export function GuestList() {
  const siteConfig = useSiteConfig()
  const copy = siteConfig.rsvp

  // The guest list loads quietly in the background. It is never shown — it only lets a typed
  // name be matched to an existing invitation (so reserved seats / companions still apply).
  const [guests, setGuests] = useState<Guest[]>([])
  const guestsLoadRef = useRef<AbortController | null>(null)

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [companions, setCompanions] = useState<Companion[]>([])
  const [companionStep, setCompanionStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submittedRsvp, setSubmittedRsvp] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  // Set when the typed name has already confirmed — shows their details instead of saving again
  const [alreadyConfirmed, setAlreadyConfirmed] = useState<Guest | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const loadGuests = async ({ reload = false } = {}) => {
    guestsLoadRef.current?.abort()
    const controller = new AbortController()
    guestsLoadRef.current = controller

    const cached = readCachedInvitationList<ApiGuest>("/api/guests")
    if (cached) {
      const cachedGuests = mapApiGuests(cached)
      if (cachedGuests.length > 0) setGuests(cachedGuests)
    }

    try {
      const mappedGuests = await fetchUntilReady({
        signal: controller.signal,
        load: (signal) => loadGuestsFromApi(signal, reload),
        isReady: (list) => list.length > 0,
        maxAttempts: 4,
        maxDelayMs: 3000,
      })
      setGuests(mappedGuests)
    } catch (error) {
      if (isAbortError(error)) return
      console.error("Error fetching guests:", error)
    } finally {
      if (guestsLoadRef.current === controller) guestsLoadRef.current = null
    }
  }

  useEffect(() => {
    void loadGuests()
    return () => guestsLoadRef.current?.abort()
  }, [])

  const findGuest = (list: Guest[], name: string) => {
    const key = normalizeName(name)
    if (!key) return null
    return list.find((guest) => normalizeName(guest.Name) === key) ?? null
  }

  // Exact (case-insensitive) match of the typed name against the invitation list
  const matchedGuest = useMemo(() => findGuest(guests, formData.Name), [guests, formData.Name])
  const allowedSeats = matchedGuest?.AllowedGuests || 1

  // Companion slots follow the matched invitation's reserved seats (main guest + companions)
  useEffect(() => {
    if (formData.RSVP !== "Yes" || !matchedGuest) {
      setCompanions([])
      setCompanionStep(0)
      return
    }
    const companionCount = Math.max(0, (matchedGuest.AllowedGuests || 1) - 1)
    setCompanions((prev) => {
      const base = prev.length > 0 ? [...prev] : [...matchedGuest.Companions]
      const next = base.slice(0, companionCount)
      while (next.length < companionCount) next.push({ name: "", relationship: "" })
      return next
    })
  }, [matchedGuest, formData.RSVP])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setCompanions([])
    setCompanionStep(0)
    setError(null)
  }

  const handleSubmitRSVP = async () => {
    const name = formData.Name.replace(/\s+/g, " ").trim()
    if (!name) {
      setError(copy.messages.nameRequired)
      return
    }
    if (!formData.RSVP) {
      setError(copy.messages.selectAttendance)
      return
    }
    const email = formData.Email.trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(copy.messages.invalidEmail)
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const status = formData.RSVP === "Yes" ? "confirmed" : "declined"

    try {
      // Make sure we check against the latest list so an invited guest updates their own row
      let list = guests
      try {
        invalidateInvitationData("/api/guests")
        const fresh = await loadGuestsFromApi(AbortSignal.timeout(15_000), true)
        if (fresh.length > 0) {
          list = fresh
          setGuests(fresh)
        }
      } catch (refreshError) {
        console.warn("Could not refresh guest list before submitting:", refreshError)
      }
      const existing = findGuest(list, name)

      // Already confirmed → show what's on file and let them decide (keep or cancel)
      if (existing && existing.Status === "confirmed") {
        setAlreadyConfirmed(existing)
        return
      }

      const response = existing
        ? await fetch("/api/guests", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(30_000),
            body: JSON.stringify({
              id: String(existing.id),
              name: existing.Name,
              email: email || existing.Email || "Pending",
              contact: formData.Phone.trim() || existing.Phone || "",
              status,
              // Declining keeps the invitation's reserved seats so they still apply if the guest changes their mind
              ...(status === "confirmed" ? { allowedGuests: existing.AllowedGuests || 1 } : {}),
              companions: status === "confirmed" ? companions : [],
            }),
          })
        : await fetch("/api/guests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(30_000),
            body: JSON.stringify({
              name,
              email: email || "Pending",
              contact: formData.Phone.trim(),
              status,
              allowedGuests: status === "confirmed" ? 1 : 0,
              companions: [],
            }),
          })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        console.warn("RSVP response was not OK:", response.status, payload)
        // Don't show "thank you" when the sheet didn't save — let the guest try again
        setError(copy.messages.submitFailed)
        return
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error)
      setError(copy.messages.submitFailed)
      return
    } finally {
      setIsLoading(false)
    }

    setSubmittedRsvp(formData.RSVP)
    setSuccess(copy.messages.thankYou)
    resetForm()
    window.dispatchEvent(new Event("rsvpUpdated"))
    invalidateInvitationData("/api/guests")
    void loadGuests({ reload: true })
  }

  const closeAlreadyConfirmed = () => {
    if (isCancelling) return
    setAlreadyConfirmed(null)
    setError(null)
  }

  // "I can no longer attend" → switch the confirmed RSVP to declined
  const handleCancelConfirmation = async () => {
    if (!alreadyConfirmed) return
    setIsCancelling(true)
    setError(null)

    try {
      const email = formData.Email.trim()
      const response = await fetch("/api/guests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          id: String(alreadyConfirmed.id),
          status: "declined",
          companions: [],
          ...(formData.Phone.trim() ? { contact: formData.Phone.trim() } : {}),
          ...(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { email } : {}),
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        console.warn("RSVP cancel response was not OK:", response.status, payload)
        setError(copy.messages.submitFailed)
        return
      }
    } catch (error) {
      console.error("Error cancelling RSVP:", error)
      setError(copy.messages.submitFailed)
      return
    } finally {
      setIsCancelling(false)
    }

    setAlreadyConfirmed(null)
    setSubmittedRsvp("No")
    setSuccess(copy.messages.thankYou)
    resetForm()
    window.dispatchEvent(new Event("rsvpUpdated"))
    invalidateInvitationData("/api/guests")
    void loadGuests({ reload: true })
  }

  useEffect(() => {
    if (!alreadyConfirmed) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAlreadyConfirmed()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [alreadyConfirmed, isCancelling])

  const closeSuccess = () => {
    setSuccess(null)
    setSubmittedRsvp("")
  }

  const choiceButtonClass = (selected: boolean) =>
    `relative rounded-lg border-2 p-2 transition-all duration-300 sm:p-2.5 ${selected ? "scale-[1.02] shadow-md" : "hover:shadow-sm"}`
  const selectedChoiceBg = "color-mix(in srgb, var(--color-motif-medium) 18%, white)"
  const optionalTag = (
    <span className="font-normal" style={{ color: TEAL_SOFT }}>
      {copy.form.optional}
    </span>
  )

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-visible`}
    >
    <section
      id="guest-list"
      className="relative z-30 scroll-mt-16 overflow-visible px-5 pb-10 pt-12 sm:scroll-mt-20 sm:px-8 sm:pb-12 sm:pt-14 md:scroll-mt-24"
    >
      <fieldset
        className="relative mx-auto w-full max-w-[22.5rem] overflow-visible rounded-[1.85rem] px-5 pb-8 pt-6 text-center @container/rsvp sm:max-w-[24rem] sm:px-7 sm:pb-9 sm:pt-7"
        style={modalCardStyle}
      >
        {/* Inner frame line */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-2 rounded-[1.5rem] border sm:inset-2.5"
          style={{ borderColor: HAIRLINE }}
        />
        {copy.headerOrnament ? (
          <TintedDeco src={copy.headerOrnament} className="relative mx-auto mb-3 block h-auto w-24 select-none sm:w-28" />
        ) : null}
        <h2
          className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
          style={
            {
              "--welcome-size": welcomeTitleSize.main,
              "--script-size": welcomeTitleSize.script,
            } as React.CSSProperties
          }
        >
          <span className="sr-only">{copy.title}. {copy.script}?</span>
          <span
            aria-hidden
            className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
            style={{
              fontSize: "var(--welcome-size)",
              color: NAVY,
            }}
          >
            <GlyphText text={copy.title} />
          </span>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
            style={{
              fontSize: "var(--script-size)",
              color: BUTTON,
              textShadow: "0 1px 0 #FFFFFF",
            }}
          >
            {copy.script}
            <span className={`${cinzel.className} relative -top-[0.06em] ml-[0.04em] inline-block font-normal`}>
              ?
            </span>
          </span>
        </h2>

        <p
          className={`font-goudy-italic mx-auto mt-3 max-w-[17.5rem] ${sectionType.textSnug} sm:mt-4`}
          style={{ color: TEAL }}
        >
          {copy.intro}
        </p>

        {siteConfig.details.rsvp.deadline ? (
          <p
            className={`${cinzel.className} ${sectionType.label} mx-auto mt-4 font-semibold uppercase tracking-[0.16em] sm:mt-5 sm:tracking-[0.18em]`}
            style={{ color: BUTTON }}
          >
            {copy.deadlineLabel}
            <span
              className={`${theSeasons.className} mt-2 block text-[1.45rem] font-normal normal-case leading-tight tracking-[0.04em] sm:text-[1.75rem] md:text-[1.95rem]`}
              style={{ color: TEAL }}
            >
              <GlyphText text={siteConfig.details.rsvp.deadline.replace(/\.\s*$/, "")} />
            </span>
          </p>
        ) : null}

        <div className="mx-auto mt-4 flex items-center justify-center gap-1.5 sm:mt-5">
          <span className="h-px w-6 sm:w-8" style={dividerLineStyle} />
          <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: palette.accent, fill: palette.accent }} aria-hidden />
          <span className="h-px w-6 sm:w-8" style={dividerLineStyle} />
        </div>

        {/* RSVP form — guests type their name directly, no search needed */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmitRSVP()
          }}
          className="relative mt-4 space-y-3 text-left sm:mt-5 sm:space-y-4"
          noValidate
        >
          <div>
            <label className={modalLabelClass} htmlFor="rsvp-name" style={{ color: palette.heading }}>
              <User className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
              <span>{copy.form.nameLabel}</span>
            </label>
            <input
              id="rsvp-name"
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleFormChange}
              autoComplete="name"
              aria-required="true"
              placeholder={copy.form.namePlaceholder}
              className={modalInputClass}
              style={modalInputStyle}
            />
            {matchedGuest && allowedSeats > 1 && (
              <p className={`font-goudy-italic mt-1.5 ${sectionType.label}`} style={{ color: palette.body }}>
                {fill(copy.invite.seats, {
                  count: (
                    <>
                      <span className="font-semibold">{allowedSeats}</span>{" "}
                      {copy.invite.seatPlural}
                    </>
                  ),
                })}
              </p>
            )}
          </div>

          <div>
            <label className={modalLabelClass} style={{ color: palette.heading }}>
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
              <span>{copy.form.attendLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                type="button"
                aria-pressed={formData.RSVP === "Yes"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, RSVP: "Yes" }))
                  setError(null)
                }}
                className={choiceButtonClass(formData.RSVP === "Yes")}
                style={
                  formData.RSVP === "Yes"
                    ? { borderColor: palette.accent, backgroundColor: selectedChoiceBg }
                    : { borderColor: HAIRLINE, backgroundColor: IVORY }
                }
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <CheckCircle
                    className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                    style={{ color: formData.RSVP === "Yes" ? palette.accent : TEAL_SOFT }}
                  />
                  <span className="font-goudy-italic text-xs font-semibold sm:text-sm" style={{ color: palette.heading }}>
                    {copy.form.yes}
                  </span>
                </div>
              </button>
              <button
                type="button"
                aria-pressed={formData.RSVP === "No"}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, RSVP: "No" }))
                  setError(null)
                }}
                className={choiceButtonClass(formData.RSVP === "No")}
                style={
                  formData.RSVP === "No"
                    ? { borderColor: TEAL_SOFT, backgroundColor: selectedChoiceBg }
                    : { borderColor: HAIRLINE, backgroundColor: IVORY }
                }
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <XCircle
                    className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                    style={{ color: formData.RSVP === "No" ? palette.heading : TEAL_SOFT }}
                  />
                  <span className="font-goudy-italic text-xs font-semibold sm:text-sm" style={{ color: palette.heading }}>
                    {copy.form.no}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {formData.RSVP === "Yes" && companions.length > 0 && (() => {
            const step = Math.min(companionStep, companions.length - 1)
            const current = companions[step]
            const doneCount = companions.filter((c) => c.name.trim() !== "").length
            const guestName = matchedGuest?.Name || formData.Name.trim()
            const updateCompanion = (patch: Partial<Companion>) => {
              setCompanions((prev) => {
                const next = [...prev]
                next[step] = { ...next[step], ...patch }
                return next
              })
            }
            const pillBase = `${cinzel.className} inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em]`
            const outlineButton = {
              color: palette.heading,
              borderColor: "color-mix(in srgb, var(--color-welcome-text) 55%, transparent)",
              background: IVORY,
            }
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className={`${modalLabelClass} !mb-0`} style={{ color: palette.heading }}>
                    <Users className="h-3.5 w-3.5 flex-shrink-0" style={{ color: palette.accent }} />
                    <span>{copy.form.companionsLabel}</span>
                  </label>
                  <span
                    className={`${cinzel.className} shrink-0 text-[0.6rem] font-semibold uppercase tracking-[0.12em]`}
                    style={{ color: palette.accent }}
                  >
                    {fillText(copy.form.companionsAdded, { done: doneCount, total: companions.length })}
                  </span>
                </div>

                {/* Guest tabs — tap to jump; a check shows once a name is entered */}
                {companions.length > 1 && (
                  <div className="flex flex-wrap gap-1" role="tablist" aria-label={copy.form.companionsLabel}>
                    {companions.map((c, i) => {
                      const active = i === step
                      const filled = c.name.trim() !== ""
                      return (
                        <button
                          key={i}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setCompanionStep(i)}
                          className={`${cinzel.className} inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-1.5 text-[0.62rem] font-semibold transition-all duration-200`}
                          style={
                            active
                              ? { background: DEEP_GRADIENT, color: IVORY, borderColor: "transparent" }
                              : filled
                                ? {
                                    background: selectedChoiceBg,
                                    color: palette.heading,
                                    borderColor: "color-mix(in srgb, var(--color-welcome-text) 45%, transparent)",
                                  }
                                : { background: IVORY, color: TEAL_SOFT, borderColor: HAIRLINE }
                          }
                          aria-label={fillText(copy.form.companionTitle, { n: i + 2 })}
                        >
                          {filled && !active ? <Check className="h-3 w-3" aria-hidden /> : i + 2}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* One companion at a time keeps the form short */}
                <div className="space-y-2 rounded-xl border p-2.5" style={innerSurfaceStyle}>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3 w-3" style={{ color: palette.accent }} />
                    <span className={`font-goudy-italic ${sectionType.label} font-semibold`} style={{ color: palette.heading }}>
                      {fillText(copy.form.companionProgress, { n: step + 2, total: companions.length + 1 })}
                    </span>
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <input
                      type="text"
                      value={current.name}
                      onChange={(e) => updateCompanion({ name: e.target.value })}
                      placeholder={fillText(copy.form.companionNamePlaceholder, { n: step + 2 })}
                      aria-label={copy.form.companionNameLabel}
                      className={modalInputClass}
                      style={modalInputStyle}
                    />
                    <input
                      type="text"
                      value={current.relationship}
                      onChange={(e) => updateCompanion({ relationship: e.target.value })}
                      placeholder={fillText(copy.form.relationshipLabel, {
                        name: guestName.split(" ")[0] || copy.form.relationshipFallbackName,
                      })}
                      aria-label={fillText(copy.form.relationshipLabel, {
                        name: guestName || copy.form.relationshipFallbackName,
                      })}
                      className={modalInputClass}
                      style={modalInputStyle}
                    />
                  </div>
                  {copy.form.relationshipOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {copy.form.relationshipOptions.map((option) => {
                        const picked = current.relationship.trim().toLowerCase() === option.toLowerCase()
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateCompanion({ relationship: option })}
                            className="font-goudy-italic rounded-full border px-2 py-0.5 text-[0.72rem] leading-tight transition-colors duration-200"
                            style={
                              picked
                                ? {
                                    background: "color-mix(in srgb, var(--color-motif-medium) 26%, white)",
                                    borderColor: palette.accent,
                                    color: palette.heading,
                                  }
                                : { background: IVORY, borderColor: HAIRLINE, color: palette.body }
                            }
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {companions.length > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setCompanionStep(Math.max(0, step - 1))}
                        disabled={step === 0}
                        className={`${pillBase} transition-opacity disabled:opacity-30`}
                        style={{ color: palette.heading }}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                        {copy.form.prevButton}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompanionStep(Math.min(companions.length - 1, step + 1))}
                        disabled={step >= companions.length - 1}
                        className={`${pillBase} border transition-all hover:brightness-110 disabled:opacity-30`}
                        style={outlineButton}
                      >
                        {copy.form.nextButton}
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          <div>
            <label className={modalLabelClass} htmlFor="rsvp-phone" style={{ color: palette.heading }}>
              <Phone className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
              <span>{copy.form.phoneLabel}</span>
              {optionalTag}
            </label>
            <input
              id="rsvp-phone"
              type="tel"
              name="Phone"
              value={formData.Phone}
              onChange={handleFormChange}
              autoComplete="tel"
              inputMode="tel"
              placeholder={copy.form.phonePlaceholder}
              className={modalInputClass}
              style={modalInputStyle}
            />
            <p
              className={`font-goudy-italic mt-1.5 flex items-start gap-1.5 ${sectionType.label} leading-snug`}
              style={{ color: palette.body }}
            >
              <ShieldCheck
                className="mt-0.5 h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5"
                style={{ color: palette.accent }}
                aria-hidden
              />
              <span>{copy.form.phoneNote}</span>
            </p>
          </div>

          <div>
            <label className={modalLabelClass} htmlFor="rsvp-email" style={{ color: palette.heading }}>
              <Mail className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
              <span>{copy.form.emailLabel}</span>
              {optionalTag}
            </label>
            <input
              id="rsvp-email"
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleFormChange}
              autoComplete="email"
              inputMode="email"
              placeholder={copy.form.emailPlaceholder}
              className={modalInputClass}
              style={modalInputStyle}
            />
          </div>

          {error && !alreadyConfirmed && (
            <div className="rounded-lg border px-2.5 py-1.5" style={noticeStyle} role="alert">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: TEAL }} />
                <span className={`font-goudy-italic font-semibold ${sectionType.label}`}>{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`${cinzel.className} ${sectionType.label} inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border px-6 py-2.5 font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98] disabled:opacity-70 sm:gap-2 sm:tracking-[0.14em]`}
            style={primaryButtonStyle}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                <span>{copy.form.submitting}</span>
              </>
            ) : (
              <>
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{copy.form.submit}</span>
              </>
            )}
          </button>
        </form>
      </fieldset>
    </section>

      {/* Already confirmed — show what's on file, offer to change to "can't attend" */}
      {isMounted && alreadyConfirmed && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200 sm:p-8"
          style={{ background: DARK_OVERLAY }}
          onClick={closeAlreadyConfirmed}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-confirmed-title"
            className="w-full max-w-[22rem] animate-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[1.6rem]" style={modalCardStyle}>
              {/* Inner frame line — matches the RSVP card */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-2 rounded-[1.3rem] border"
                style={{ borderColor: HAIRLINE }}
              />
              <button
                type="button"
                onClick={closeAlreadyConfirmed}
                disabled={isCancelling}
                className="absolute right-3.5 top-3.5 z-10 rounded-full p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-welcome-text)_10%,transparent)] disabled:opacity-40"
                style={{ color: TEAL_SOFT }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative px-6 pb-6 pt-7 text-center">
                {/* Seal */}
                <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 0 0 5px color-mix(in srgb, var(--color-motif-medium) 30%, transparent)" }}
                  />
                  <span className="flex h-14 w-14 items-center justify-center rounded-full shadow-md" style={{ background: DEEP_GRADIENT }}>
                    <CalendarCheck className="h-6 w-6" style={{ color: IVORY }} strokeWidth={1.8} />
                  </span>
                </div>

                <p
                  className={`${cinzel.className} text-[0.62rem] font-semibold uppercase tracking-[0.22em]`}
                  style={{ color: TEAL_SOFT }}
                >
                  <GlyphText text={copy.alreadyConfirmed.eyebrow} />
                </p>
                <p
                  className={`${aboveTheBeyond.className} mx-auto mt-1 block w-fit max-w-full px-1 text-[2rem] leading-[1.05] sm:text-[2.2rem]`}
                  style={{ color: BUTTON }}
                >
                  {alreadyConfirmed.Name}
                </p>
                <h4
                  id="rsvp-confirmed-title"
                  className={`${theSeasons.className} mt-2 text-[1.05rem] uppercase leading-tight tracking-[0.12em]`}
                  style={{ color: NAVY }}
                >
                  <GlyphText text={copy.alreadyConfirmed.title} />
                </h4>
                <p className={`font-goudy-italic mx-auto mt-1.5 max-w-[16rem] ${sectionType.textSnug}`} style={{ color: palette.body }}>
                  <GlyphText text={copy.alreadyConfirmed.text} />
                </p>

                {/* Details on file (contact info is left out on purpose — anyone can type a name) */}
                <div className="mt-4 overflow-hidden rounded-xl border text-left" style={{ borderColor: HAIRLINE }}>
                  <div className="grid grid-cols-2 divide-x" style={{ borderColor: HAIRLINE }}>
                    <div className="px-3 py-2.5 text-center" style={{ background: innerSurfaceStyle.background, borderColor: HAIRLINE }}>
                      <p className={`${cinzel.className} text-[0.56rem] font-semibold uppercase tracking-[0.16em]`} style={{ color: TEAL_SOFT }}>
                        {copy.alreadyConfirmed.statusLabel}
                      </p>
                      <span
                        className="font-goudy-italic mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.85rem] font-semibold"
                        style={{ background: "color-mix(in srgb, var(--color-motif-yellow) 22%, white)", color: NAVY }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                        {copy.alreadyConfirmed.statusValue}
                      </span>
                    </div>
                    <div className="px-3 py-2.5 text-center" style={{ background: innerSurfaceStyle.background, borderColor: HAIRLINE }}>
                      <p className={`${cinzel.className} text-[0.56rem] font-semibold uppercase tracking-[0.16em]`} style={{ color: TEAL_SOFT }}>
                        {copy.alreadyConfirmed.seatsLabel}
                      </p>
                      <p className={`${cinzel.className} mt-1 text-[1.35rem] font-semibold leading-none`} style={{ color: NAVY }}>
                        {alreadyConfirmed.AllowedGuests || 1}
                      </p>
                    </div>
                  </div>

                  {alreadyConfirmed.Companions.some((c) => c.name?.trim()) && (
                    <div className="border-t px-3 py-2.5" style={{ borderColor: HAIRLINE }}>
                      <p className={`${cinzel.className} mb-1.5 flex items-center gap-1.5 text-[0.56rem] font-semibold uppercase tracking-[0.16em]`} style={{ color: TEAL_SOFT }}>
                        <Users className="h-3 w-3" aria-hidden />
                        {copy.alreadyConfirmed.companionsLabel}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {alreadyConfirmed.Companions.filter((c) => c.name?.trim()).map((c, i) => (
                          <span
                            key={i}
                            className="font-goudy-italic rounded-full border px-2 py-0.5 text-[0.78rem] leading-tight"
                            style={{ borderColor: HAIRLINE, background: IVORY, color: palette.heading }}
                          >
                            <GlyphText text={c.name.trim()} />
                            {c.relationship?.trim() && (
                              <span style={{ color: TEAL_SOFT }}> · <GlyphText text={c.relationship.trim()} /></span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {alreadyConfirmed.UpdatedAt && (
                    <div className="flex items-center gap-2 border-t px-3 py-2.5" style={{ borderColor: HAIRLINE }}>
                      <CalendarCheck className="h-3.5 w-3.5 flex-shrink-0" style={{ color: TEAL_SOFT }} aria-hidden />
                      <p className={`${cinzel.className} text-[0.56rem] font-semibold uppercase tracking-[0.16em]`} style={{ color: TEAL_SOFT }}>
                        {copy.alreadyConfirmed.confirmedOnLabel}
                      </p>
                      <p className={`${cinzel.className} ml-auto text-right text-[0.7rem] font-semibold tracking-[0.04em]`} style={{ color: NAVY }}>
                        {formatConfirmedAt(alreadyConfirmed.UpdatedAt)}
                      </p>
                    </div>
                  )}
                </div>

                <p className={`font-goudy-italic mx-auto mt-4 max-w-[16rem] ${sectionType.textSnug}`} style={{ color: palette.body }}>
                  <GlyphText text={copy.alreadyConfirmed.question} />
                </p>

                {error && (
                  <div className="mt-3 rounded-lg border px-2.5 py-1.5 text-left" style={noticeStyle} role="alert">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: TEAL }} />
                      <span className={`font-goudy-italic font-semibold ${sectionType.label}`}>{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeAlreadyConfirmed}
                  disabled={isCancelling}
                  autoFocus
                  className={`${cinzel.className} mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:opacity-60`}
                  style={primaryButtonStyle}
                >
                  <Heart className="h-3.5 w-3.5 flex-shrink-0" />
                  {copy.alreadyConfirmed.keepButton}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCancelConfirmation()}
                  disabled={isCancelling}
                  className={`font-goudy-italic mt-3 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 ${sectionType.label} underline decoration-[color-mix(in_srgb,var(--color-welcome-text)_35%,transparent)] underline-offset-4 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-welcome-text)_8%,transparent)] disabled:opacity-60`}
                  style={{ color: palette.body }}
                >
                  {isCancelling ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      {copy.alreadyConfirmed.cancelling}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: TEAL_SOFT }} />
                      {copy.alreadyConfirmed.cancelButton}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* RSVP Success */}
      {isMounted && success && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-5 backdrop-blur-md animate-in fade-in duration-200 sm:p-8"
          style={{ background: DARK_OVERLAY }}
        >
          <div className="w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="overflow-hidden rounded-2xl" style={modalCardStyle}>
              <div
                aria-hidden
                className="h-[3px] w-full"
                style={{
                  background: DEEP_GRADIENT,
                }}
              />
              <div className="px-6 pb-6 pt-6 text-center">
                <div className="relative mb-4 inline-flex items-center justify-center">
                  <div
                    className="absolute h-14 w-14 animate-ping rounded-full"
                    style={{
                      animationDuration: "2.5s",
                      backgroundColor: "color-mix(in srgb, var(--color-welcome-text) 22%, transparent)",
                    }}
                  />
                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-full shadow-md"
                    style={{ background: DEEP_GRADIENT }}
                  >
                    <CheckCircle className="h-6 w-6" style={{ color: IVORY }} strokeWidth={2} />
                  </div>
                </div>

                <h4
                  className={`${theSeasons.className} mb-1 text-base uppercase tracking-[0.12em]`}
                  style={{ color: palette.heading }}
                >
                  <GlyphText text={submittedRsvp === "No" ? copy.success.declinedTitle : copy.success.title} />
                </h4>

                <p className="font-goudy-italic text-sm leading-snug" style={{ color: palette.body }}>
                  {submittedRsvp === "Yes"
                    ? copy.success.attending
                    : submittedRsvp === "No"
                      ? copy.success.declined
                      : copy.success.neutral}
                </p>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1" style={dividerLineStyle} />
                  <Heart className="h-2.5 w-2.5 flex-shrink-0" style={{ color: palette.accent }} />
                  <span className="h-px flex-1" style={dividerLineStyle} />
                </div>

                <p className="font-goudy-italic mb-4 text-sm leading-relaxed" style={{ color: palette.body }}>
                  {copy.success.messagePrompt}
                </p>

                <a
                  href="#messages"
                  onClick={() => {
                    closeSuccess()
                    setTimeout(() => {
                      const el = document.getElementById("messages")
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                    }, 100)
                  }}
                  className={`${cinzel.className} mb-3 inline-flex w-full items-center justify-center gap-2 rounded-full border py-3 ${sectionType.label} font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]`}
                  style={primaryButtonStyle}
                >
                  <MessageSquare className="h-3 w-3 flex-shrink-0" />
                  {copy.success.messageButton}
                </a>

                <button
                  type="button"
                  onClick={closeSuccess}
                  className={`font-goudy-italic ${sectionType.label} tracking-wide transition-colors duration-200`}
                  style={{ color: palette.body }}
                >
                  {copy.success.laterButton}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
