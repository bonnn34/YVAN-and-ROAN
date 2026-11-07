"use client"

import { useState, useEffect, useRef, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  RefreshCw,
  X,
  Heart,
  Sparkles,
  Phone,
  ShieldCheck,
  UserPlus,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { modalTitleSize, sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { fetchUntilReady, isAbortError } from "@/lib/fetch-until-ready"
import { fetchInvitationList, invalidateInvitationData, readCachedInvitationList } from "@/lib/invitation-data"
import { TintedDeco } from "@/components/tinted-deco"

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

// Palette (app/globals.css motif tokens): navy #002059 for text, slate navy for labels,
// peach #F28F75 / #F7B7A3 / #FDE3DB for accents, frames and soft surfaces.
const NAVY = "var(--color-welcome-navy)"
const TEAL = "var(--color-welcome-text)"
const BUTTON = "var(--color-welcome-heading)"
const PEACH = "var(--color-motif-medium)"
const PEACH_MID = "var(--color-motif-blush)"
const PEACH_LIGHT = "#FDE3DB"
const IVORY = "#FFFFFF"
const PAPER = "#FFFFFF"
// Guest names and avatars
const LEAF = NAVY
const DEEP_GRADIENT = "linear-gradient(180deg, var(--color-welcome-heading) 0%, var(--color-welcome-navy) 100%)"
// Round avatar behind the person icon in search results
const SAGE_GRADIENT = `linear-gradient(160deg, ${PEACH_MID} 0%, ${PEACH} 100%)`
const HAIRLINE = "color-mix(in srgb, var(--color-motif-medium) 55%, transparent)"
// Secondary text / unselected options (muted navy, still readable)
const TEAL_SOFT = "color-mix(in srgb, var(--color-welcome-text) 70%, white)"
// Navy veil (with blur) behind modals
const LIGHT_OVERLAY = "color-mix(in srgb, var(--color-welcome-navy) 38%, transparent)"
const DARK_OVERLAY = "color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)"

const palette = {
  body: TEAL,
  heading: NAVY,
  label: BUTTON,
  accent: PEACH,
} as const

// Ivory paper card with a peach glow at the top, peach edge and a soft halo
const modalCardStyle = {
  background: `radial-gradient(90% 38% at 50% 0%, ${PEACH_LIGHT} 0%, transparent 72%), linear-gradient(180deg, ${PAPER} 0%, ${PAPER} 62%, color-mix(in srgb, ${PEACH_LIGHT} 70%, white) 100%)`,
  border: "1px solid color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
  boxShadow:
    "0 0 0 6px rgb(255 255 255 / 45%), 0 0 0 7px color-mix(in srgb, var(--color-motif-blush) 45%, transparent), 0 30px 60px -24px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

const innerSurfaceStyle = {
  background: `color-mix(in srgb, ${PEACH_LIGHT} 55%, white)`,
  borderColor: HAIRLINE,
} as const

const modalInputClass = `w-full rounded-xl border bg-white px-3 py-2 font-goudy-italic ${sectionType.text} transition-all duration-300 outline-none focus:border-[var(--color-motif-medium)] focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--color-motif-blush)_60%,transparent)] placeholder:text-[0.92em] placeholder:text-[color-mix(in_srgb,var(--color-welcome-text)_50%,white)] sm:px-3.5 sm:py-2.5`

const modalInputStyle = {
  borderColor: HAIRLINE,
  color: NAVY,
} as const

// Field labels: small Cinzel capitals in slate navy (icons in peach)
const modalLabelClass = `${cinzel.className} mb-1.5 flex flex-wrap items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] sm:mb-2 sm:gap-2 sm:text-[0.68rem]`

const dividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-motif-medium), transparent)",
} as const

// Navy button with a peach ring
const primaryButtonStyle = {
  background: DEEP_GRADIENT,
  borderColor: "rgb(255 255 255 / 70%)",
  color: IVORY,
  boxShadow:
    "0 0 0 4px color-mix(in srgb, var(--color-motif-blush) 55%, transparent), 0 12px 24px -10px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
} as const

// Soft peach notice box with navy text
const noticeStyle = {
  background: `color-mix(in srgb, ${PEACH_LIGHT} 75%, white)`,
  borderColor: "color-mix(in srgb, var(--color-motif-medium) 55%, transparent)",
  color: NAVY,
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

function HighlightedName({ name, query }: { name: string; query: string }) {
  const trimmed = query.trim()
  if (!trimmed) return <>{name}</>

  const lowerName = name.toLowerCase()
  const lowerQuery = trimmed.toLowerCase()
  const index = lowerName.indexOf(lowerQuery)
  if (index === -1) return <>{name}</>

  return (
    <>
      {name.slice(0, index)}
      <span className="font-semibold" style={{ color: NAVY, background: `linear-gradient(transparent 58%, color-mix(in srgb, ${PEACH_MID} 75%, transparent) 58%)` }}>
        {name.slice(index, index + trimmed.length)}
      </span>
      {name.slice(index + trimmed.length)}
    </>
  )
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
  RSVP: string
  Guest: string
  Message: string
  Status: string
  AllowedGuests: number
  Companions?: Array<{ name: string; relationship: string }>
}

function mapApiGuests(data: ApiGuest[]): Guest[] {
  return data
    .filter((guest) => guest.name && guest.name.trim() !== "")
    .map((guest) => ({
      id: guest.id,
      Name: guest.name,
      Email: guest.email || "",
      Phone: guest.contact || "",
      RSVP: guest.status === "confirmed" ? "Yes" : guest.status === "declined" ? "No" : "",
      Guest: guest.allowedGuests?.toString() || "1",
      Message: guest.message || "",
      Status: guest.status || "pending",
      AllowedGuests: guest.allowedGuests || 1,
      Companions: Array.isArray(guest.companions) ? guest.companions : [],
    }))
}

async function loadGuestsFromApi(signal?: AbortSignal, reload = false): Promise<Guest[]> {
  const data = await fetchInvitationList<ApiGuest>("/api/guests", { signal, reload })
  return mapApiGuests(data)
}

export function GuestList() {
  const siteConfig = useSiteConfig()
  const copy = siteConfig.rsvp
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingGuests, setIsFetchingGuests] = useState(true)
  const [guestsLoadFailed, setGuestsLoadFailed] = useState(false)
  const guestsLoadRef = useRef<AbortController | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [hasResponded, setHasResponded] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    RSVP: "",
    Guest: "1",
    Message: "",
    Status: "pending",
  })

  // Companion state
  const [companions, setCompanions] = useState<Array<{ name: string; relationship: string }>>([])

  // Request form state
  const [requestFormData, setRequestFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Guest: "1",
    Message: "",
  })

  const searchRef = useRef<HTMLDivElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [showPhoneAlert, setShowPhoneAlert] = useState(false)
  const [companionStep, setCompanionStep] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!showSearchModal) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !showModal && !showRequestModal) {
        setShowSearchModal(false)
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [showSearchModal, showModal, showRequestModal])

  // Update companions array based on allowedGuests when a guest is selected
  useEffect(() => {
    if (selectedGuest && formData.RSVP === "Yes") {
      const allowedGuests = selectedGuest.AllowedGuests || 1
      const companionCount = Math.max(0, allowedGuests - 1) // Main guest + companions
      
      setCompanions((prev) => {
        // If we have existing companions from the selected guest, use them as base
        const existingCompanions = selectedGuest.Companions && selectedGuest.Companions.length > 0 
          ? [...selectedGuest.Companions] 
          : [...prev]
        
        const newCompanions = [...existingCompanions]
        if (newCompanions.length < companionCount) {
          // Add empty slots
          for (let i = newCompanions.length; i < companionCount; i++) {
            newCompanions.push({ name: '', relationship: '' })
          }
        } else if (newCompanions.length > companionCount) {
          // Remove excess slots
          newCompanions.splice(companionCount)
        }
        return newCompanions
      })
    } else {
      // Clear companions if not attending or no guest selected
      setCompanions([])
    }
  }, [selectedGuest, formData.RSVP])

  // Load guests: show the last known list instantly, then refresh with bounded retries
  const loadGuests = async ({ reload = false } = {}) => {
    guestsLoadRef.current?.abort()
    const controller = new AbortController()
    guestsLoadRef.current = controller

    const cached = readCachedInvitationList<ApiGuest>("/api/guests")
    const cachedGuests = cached ? mapApiGuests(cached) : []
    if (cachedGuests.length > 0) {
      setGuests(cachedGuests)
    }
    setIsFetchingGuests(cachedGuests.length === 0)
    setGuestsLoadFailed(false)

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
      if (cachedGuests.length === 0) setGuestsLoadFailed(true)
    } finally {
      if (guestsLoadRef.current === controller) {
        guestsLoadRef.current = null
        setIsFetchingGuests(false)
      }
    }
  }

  useEffect(() => {
    void loadGuests()
    return () => guestsLoadRef.current?.abort()
  }, [])

  // Opening the search after a failed load tries again automatically
  useEffect(() => {
    if (showSearchModal && guestsLoadFailed && !isFetchingGuests) {
      void loadGuests({ reload: true })
    }
  }, [showSearchModal])

  // Filter guests based on search query with real-time auto-suggestion
  // Shows suggestions for ANY letter typed (even just 1 character)
  // Matches names that START with OR CONTAIN the typed letters (case-insensitive)
  // Results automatically narrow down as more letters are typed
  useEffect(() => {
    // Don't show suggestions if search is empty
    if (!searchQuery.trim()) {
      setFilteredGuests([])
      return
    }

    // Convert search query to lowercase for case-insensitive matching
    const query = searchQuery.toLowerCase().trim()
    
    // Filter guests where name contains the search query anywhere in the name
    // This includes both:
    // - Names that START with the query (e.g., "Ro" matches "Rolando")
    // - Names that CONTAIN the query (e.g., "ro" matches "Aaron")
    const filtered = guests.filter((guest) => {
      // Safety check: ensure guest.Name exists and is not empty
      if (!guest.Name || guest.Name.trim() === "") {
        return false
      }
      
      const guestName = guest.Name.toLowerCase()
      return guestName.includes(query)
    })

    // Sort results to prioritize names that START with the query
    // This provides a better user experience
    const sorted = filtered.sort((a, b) => {
      const aName = a.Name.toLowerCase()
      const bName = b.Name.toLowerCase()
      const aStarts = aName.startsWith(query)
      const bStarts = bName.startsWith(query)
      
      // If one starts with query and other doesn't, prioritize the one that starts
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      
      // Otherwise maintain alphabetical order
      return aName.localeCompare(bName)
    })

    setFilteredGuests(sorted)
  }, [searchQuery, guests])

  const fetchGuests = async () => {
    try {
      invalidateInvitationData("/api/guests")
      const mappedGuests = await loadGuestsFromApi(undefined, true)
      if (mappedGuests.length > 0) {
        setGuests(mappedGuests)
      }
    } catch (error) {
      console.error("Error fetching guests:", error)
    }
  }

  const handleSearchSelect = (guest: Guest) => {
    setSelectedGuest(guest)
    setSearchQuery(guest.Name)
    
    // Set form data with existing guest info
    setFormData({
      Name: guest.Name,
      Email: guest.Email && guest.Email !== "Pending" && guest.Email !== "" ? guest.Email : "",
      Phone: guest.Phone || "",
      RSVP: guest.RSVP || "",
      Guest: guest.Guest && guest.Guest !== "" ? guest.Guest : "1",
      Message: guest.Message || "",
      Status: guest.Status || "pending",
    })
    
    // Load existing companions if available
    if (guest.Companions && guest.Companions.length > 0) {
      setCompanions(guest.Companions)
    } else {
      setCompanions([])
    }
    
    // Check if guest has already responded (status is confirmed or declined)
    setHasResponded(!!(guest.Status && (guest.Status === "confirmed" || guest.Status === "declined")))
    
    setCompanionStep(0)
    setShowSearchModal(false)
    setShowModal(true)
  }

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitRSVP = async () => {
    if (!selectedGuest) return

    if (!formData.RSVP) {
      setError(copy.messages.selectAttendance)
      setTimeout(() => setError(null), 5000)
      return
    }

    const phoneDigits = formData.Phone.replace(/\D/g, "")
    if (!formData.Phone.trim() || phoneDigits.length < 7) {
      setShowPhoneAlert(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const guestCount = formData.RSVP === "Yes" ? selectedGuest.AllowedGuests.toString() : "0"
    const status = formData.RSVP === "Yes" ? "confirmed" : formData.RSVP === "No" ? "declined" : "pending"

    try {
      const response = await fetch("/api/guests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          id: String(selectedGuest.id),
          name: formData.Name,
          email: formData.Email || "Pending",
          contact: formData.Phone.trim(),
          status: status,
          allowedGuests: parseInt(guestCount),
          message: formData.Message || "",
          companions: companions,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const apiError =
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error?: unknown }).error || "").trim()
            : ""
        // Don't show "thank you" when the sheet didn't save — let the guest try again
        console.warn("RSVP update response was not OK:", response.status, apiError)
        setError(copy.messages.submitFailed)
        setIsLoading(false)
        return
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error)
      setError(copy.messages.submitFailed)
      setIsLoading(false)
      return
    }

    setError(null)
    setSuccess(copy.messages.thankYou)
    setHasResponded(true)
    setSelectedGuest((prev) =>
      prev
        ? {
            ...prev,
            Email: formData.Email,
            Phone: formData.Phone.trim(),
            RSVP: formData.RSVP,
            Message: formData.Message || "",
            Status: status,
            Companions: companions,
          }
        : prev,
    )
    window.dispatchEvent(new Event("rsvpUpdated"))
    void fetchGuests()
    setIsLoading(false)
  }

  // With companions to enter, tighten the RSVP modal so everything fits on a phone screen
  const isCompactRsvp = !hasResponded && formData.RSVP === "Yes" && companions.length > 0

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedGuest(null)
    setSearchQuery("")
    setFormData({ Name: "", Email: "", Phone: "", RSVP: "", Guest: "1", Message: "", Status: "pending" })
    setCompanions([])
    setCompanionStep(0)
    setHasResponded(false)
    setError(null)
    setShowPhoneAlert(false)
  }

  const handleClosePhoneAlert = () => {
    setShowPhoneAlert(false)
    requestAnimationFrame(() => phoneInputRef.current?.focus())
  }

  useEffect(() => {
    if (!showPhoneAlert) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        handleClosePhoneAlert()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showPhoneAlert])

  const handleSubmitRequest = async () => {
    if (!requestFormData.Name) {
      setError(copy.messages.nameRequired)
      setTimeout(() => setError(null), 5000)
      return
    }

    setIsLoading(true)
    setError(null)
    setRequestSuccess(null)

    try {
      // Submit to guest-requests API
      const response = await fetch("/api/guest-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: requestFormData.Name,
          Email: requestFormData.Email || "",
          Phone: requestFormData.Phone || "",
          RSVP: "",
          Guest: requestFormData.Guest || "1",
          Message: requestFormData.Message || "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit request")
      }

      setRequestSuccess(copy.messages.requestSubmitted)
      
      // Close modal and reset after showing success
      setTimeout(() => {
        setShowRequestModal(false)
        setRequestFormData({ Name: "", Email: "", Phone: "", Guest: "1", Message: "" })
        setSearchQuery("")
        setRequestSuccess(null)
      }, 3000)
    } catch (error) {
      console.error("Error submitting request:", error)
      setError(copy.messages.requestFailed)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseRequestModal = () => {
    setShowRequestModal(false)
    setRequestFormData({ Name: "", Email: "", Phone: "", Guest: "1", Message: "" })
    setError(null)
    setRequestSuccess(null)
  }

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
            {copy.title}
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
              {siteConfig.details.rsvp.deadline.replace(/\.\s*$/, "")}
            </span>
          </p>
        ) : null}

        <div className="mx-auto mt-5 flex items-center justify-center gap-1.5 sm:mt-6" aria-hidden>
          <span className="h-px w-8 sm:w-10" style={dividerLineStyle} />
          <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: PEACH, fill: PEACH }} />
          <span className="h-px w-8 sm:w-10" style={dividerLineStyle} />
        </div>

        <button
          type="button"
          onClick={() => {
            setSearchQuery("")
            setShowSearchModal(true)
          }}
          className={`${cinzel.className} ${sectionType.label} mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 font-semibold uppercase tracking-[0.12em] relative border transition-all duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98] sm:mt-5 sm:tracking-[0.14em]`}
          style={primaryButtonStyle}
        >
          <Search className="h-3.5 w-3.5" aria-hidden />
          {copy.openButton}
        </button>
      </fieldset>
    </section>

      {isMounted && showSearchModal && createPortal(
        <div
          className="fixed inset-0 z-[9998] flex items-start justify-center overflow-hidden px-4 pb-6 pt-[max(4.75rem,11dvh)] backdrop-blur-[6px] animate-in fade-in sm:px-6 sm:pt-[max(5.5rem,13dvh)]"
          style={{ background: LIGHT_OVERLAY }}
          onClick={() => setShowSearchModal(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-search-title"
            className="relative w-full max-w-[22.75rem] @container/guest-modal sm:max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative overflow-hidden rounded-[1.35rem]"
              style={modalCardStyle}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-welcome-text)_10%,transparent)]"
                style={{ color: palette.heading }}
                aria-label="Close search"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <div className="px-5 pb-4 pt-6 sm:px-6 sm:pt-7">
                <h2
                  id="rsvp-search-title"
                  className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
                  style={
                    {
                      "--title-size": modalTitleSize.main,
                      "--script-size": modalTitleSize.script,
                    } as CSSProperties
                  }
                >
                  <span className="sr-only">{copy.search.title} — {copy.search.script}</span>
                  <span
                    aria-hidden
                    className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em]`}
                    style={{
                      fontSize: "var(--title-size)",
                      color: palette.heading,
                    }}
                  >
                    {copy.search.title}
                  </span>
                  <span
                    aria-hidden
                    className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
                    style={{
                      fontSize: "var(--script-size)",
                      color: palette.accent,
                    }}
                  >
                    {copy.search.script}
                  </span>
                </h2>

                <div className="mx-auto mt-3 flex items-center justify-center gap-1.5 sm:mt-4">
                  <span className="h-px w-6 sm:w-8" style={dividerLineStyle} />
                  <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: palette.accent, fill: palette.accent }} aria-hidden />
                  <span className="h-px w-6 sm:w-8" style={dividerLineStyle} />
                </div>

                <div ref={searchRef} className="relative mt-4 sm:mt-5">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: palette.accent }}
                  />
                  <input
                    id="rsvp-name-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={copy.search.placeholder}
                    autoFocus
                    autoComplete="off"
                    className="w-full rounded-full border bg-white py-2.5 pl-10 pr-4 font-goudy-italic text-[0.95rem] shadow-sm outline-none transition-all duration-200 placeholder:text-[color-mix(in_srgb,var(--color-welcome-text)_55%,white)] sm:py-3 sm:text-base"
                    style={{
                      borderColor: searchQuery ? PEACH : HAIRLINE,
                      color: palette.heading,
                      boxShadow: searchQuery
                        ? "0 0 0 3px color-mix(in srgb, var(--color-motif-blush) 60%, transparent)"
                        : undefined,
                    }}
                  />
                </div>
              </div>

              {guestsLoadFailed && guests.length === 0 && !isFetchingGuests && (
                <div
                  className="border-t px-5 py-4 text-center sm:px-6 sm:py-5"
                  style={{
                    borderColor: HAIRLINE,
                    background: innerSurfaceStyle.background,
                  }}
                >
                  <p
                    className={`font-goudy-italic mb-2 ${sectionType.textSnug}`}
                    style={{ color: palette.body }}
                  >
                    {copy.messages.loadFailed}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadGuests({ reload: true })}
                    className={`${cinzel.className} inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[0.68rem] font-semibold tracking-[0.12em] transition-all duration-200 hover:brightness-110`}
                    style={primaryButtonStyle}
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    Try again
                  </button>
                </div>
              )}

              {isFetchingGuests && guests.length === 0 && (
                <div
                  className="border-t px-5 py-4 text-center sm:px-6 sm:py-5"
                  style={{
                    borderColor: HAIRLINE,
                    background: innerSurfaceStyle.background,
                  }}
                >
                  <RefreshCw
                    className="mx-auto mb-2 h-4 w-4 animate-spin"
                    style={{ color: palette.accent }}
                    aria-hidden
                  />
                  <p
                    className={`font-goudy-italic ${sectionType.textSnug}`}
                    style={{ color: palette.body }}
                  >
                    {copy.search.loading}
                  </p>
                </div>
              )}

              {searchQuery.trim() && filteredGuests.length > 0 && (
                <div
                  className="border-t"
                  style={{
                    borderColor: HAIRLINE,
                    background: IVORY,
                  }}
                >
                  {filteredGuests.slice(0, 6).map((guest, index) => (
                    <button
                      key={guest.id ?? index}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSearchSelect(guest)}
                      className="group flex w-full items-center gap-3 border-b px-5 py-3 text-left last:border-b-0 transition-colors hover:bg-[color-mix(in_srgb,var(--color-motif-medium)_14%,transparent)] sm:px-6 sm:py-3.5"
                      style={{
                        borderColor: HAIRLINE,
                      }}
                    >
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9"
                        style={{ background: SAGE_GRADIENT }}
                      >
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: IVORY }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate font-goudy-italic text-[0.95rem] sm:text-base"
                          style={{ color: LEAF }}
                        >
                          <HighlightedName name={guest.Name} query={searchQuery} />
                        </div>
                        {guest.Email && guest.Email !== "Pending" && (
                          <div
                            className={`mt-0.5 truncate ${sectionType.label}`}
                            style={{ color: TEAL_SOFT }}
                          >
                            {guest.Email}
                          </div>
                        )}
                      </div>
                      <ChevronRight
                        className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                        style={{ color: palette.accent }}
                      />
                    </button>
                  ))}
                  {filteredGuests.length > 6 && (
                    <p
                      className={`${cinzel.className} px-5 py-2.5 text-center text-[0.62rem] font-medium tracking-[0.14em] sm:px-6`}
                      style={{ color: palette.accent }}
                    >
                      {copy.search.refine}
                    </p>
                  )}
                </div>
              )}

              {searchQuery.trim() && filteredGuests.length === 0 && !isFetchingGuests && !(guestsLoadFailed && guests.length === 0) && (
                <div
                  className="border-t px-5 py-4 sm:px-6 sm:py-5"
                  style={{
                    borderColor: HAIRLINE,
                    background: innerSurfaceStyle.background,
                  }}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: SAGE_GRADIENT }}
                    >
                      <UserPlus className="h-4 w-4" style={{ color: IVORY }} />
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`${cinzel.className} text-[0.78rem] font-semibold tracking-[0.08em]`}
                        style={{ color: palette.heading }}
                      >
                        {copy.search.notFoundTitle}
                      </h4>
                      <p
                        className={`font-goudy-italic mt-1 ${sectionType.textSnug}`}
                        style={{ color: palette.body }}
                      >
                        {copy.search.notFoundText}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestFormData({ ...requestFormData, Name: searchQuery })
                      setShowRequestModal(true)
                    }}
                    className={`${cinzel.className} flex w-full items-center justify-center rounded-full py-2.5 text-[0.72rem] font-semibold tracking-[0.12em] border transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]`}
                    style={primaryButtonStyle}
                  >
                    <UserPlus className="mr-2 h-3.5 w-3.5" />
                    {copy.search.requestButton}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* RSVP Modal — portaled to escape motion/filter stacking context */}
      {isMounted && showModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-3 backdrop-blur-sm animate-in fade-in sm:p-4"
          style={{ background: LIGHT_OVERLAY }}
          onClick={handleCloseModal}
        >
          <div
            className="relative mx-1 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl animate-in zoom-in-95 duration-300 @container/guest-modal sm:mx-2 sm:max-h-[calc(100dvh-2rem)] sm:max-w-lg md:mx-4"
            style={modalCardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-5 top-0 z-10 h-px sm:inset-x-8"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
              }}
            />

            {/* Modal Header */}
            <div
              className={`relative flex-shrink-0 px-4 text-center sm:px-6 ${
                isCompactRsvp ? "pb-2.5 pt-4" : "pb-4 pt-5 sm:pb-5 sm:pt-6"
              }`}
            >
              {!hasResponded && (
                <button
                  onClick={handleCloseModal}
                  className="absolute right-2 top-2 rounded-full p-1 transition-colors hover:bg-[color-mix(in_srgb,var(--color-welcome-text)_10%,transparent)] sm:right-3 sm:top-3 sm:p-1.5"
                  style={{ color: palette.heading }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}

              {!isCompactRsvp && (
                <div className="mx-auto mb-4 flex items-center justify-center gap-1.5 sm:mb-5">
                  <span className="h-px w-6 sm:w-10" style={dividerLineStyle} />
                  <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: palette.accent }} aria-hidden />
                  <span className="h-px w-6 sm:w-10" style={dividerLineStyle} />
                </div>
              )}

              <h3
                className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
                style={
                  {
                    "--title-size": isCompactRsvp ? "clamp(1.1rem, 5.5vw, 1.6rem)" : modalTitleSize.main,
                    "--script-size": isCompactRsvp ? "clamp(0.95rem, 4.6vw, 1.35rem)" : modalTitleSize.script,
                  } as CSSProperties
                }
              >
                <span
                  className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] pb-1 sm:pb-1.5`}
                  style={{ fontSize: "var(--title-size)", color: NAVY }}
                >
                  {copy.invite.title}
                </span>
                <span
                  aria-hidden
                  className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] ${
                    isCompactRsvp ? "mt-1" : "mt-2 sm:mt-2.5 md:mt-3"
                  }`}
                  style={{
                    fontSize: "var(--script-size)",
                    color: BUTTON,
                  }}
                >
                  {selectedGuest?.Name || copy.invite.scriptFallback}
                </span>
              </h3>

              {!isCompactRsvp && (
                <p
                  className={`font-goudy-italic mx-auto mt-4 max-w-md sm:mt-5 ${sectionType.textSnug}`}
                  style={{ color: palette.body }}
                >
                  {fill(copy.invite.greeting, {
                    name: <span className="font-semibold" style={{ color: LEAF }}>{selectedGuest?.Name}</span>,
                  })}
                </p>
              )}
              <p
                className={`font-goudy-italic mx-auto ${isCompactRsvp ? "mt-1 text-[0.8rem]" : `mt-2 ${sectionType.text}`}`}
                style={{ color: palette.body }}
              >
                {fill(copy.invite.seats, {
                  count: (
                    <>
                      <span className="font-semibold" style={{ color: palette.accent }}>
                        {selectedGuest?.AllowedGuests || 1}
                      </span>{" "}
                      {(selectedGuest?.AllowedGuests || 1) === 1 ? copy.invite.seatSingular : copy.invite.seatPlural}
                    </>
                  ),
                })}
              </p>
            </div>

            {/* Modal Content */}
            <div className="flex min-h-0 flex-1 flex-col">
                {hasResponded ? (
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 py-3 text-center sm:px-6 sm:py-4 md:px-7 md:py-6">
                    <div
                      className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full sm:mb-4 sm:h-14 sm:w-14 md:h-16 md:w-16"
                      style={{ background: DEEP_GRADIENT }}
                    >
                      <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" style={{ color: IVORY }} />
                    </div>
                    <h4
                      className={`${theSeasons.className} mb-2 uppercase tracking-[0.12em] sm:text-lg md:text-xl ${sectionType.subheader}`}
                      style={{ color: palette.heading }}
                    >
                      {copy.responded.title}
                    </h4>
                    <p
                      className={`font-goudy-italic mb-4 px-2 ${sectionType.text}`}
                      style={{ color: palette.body }}
                    >
                      {copy.responded.text}
                    </p>
                    <div
                      className="space-y-2.5 rounded-lg border p-3 sm:space-y-3 sm:p-4"
                      style={innerSurfaceStyle}
                    >
                      <div className="mb-1.5 flex items-center justify-center gap-2 sm:mb-2">
                        {selectedGuest?.RSVP === "Yes" && (
                          <>
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: TEAL }} />
                            <span className="font-goudy-italic text-xs font-semibold sm:text-sm" style={{ color: TEAL }}>
                              {copy.responded.attending}
                            </span>
                          </>
                        )}
                        {selectedGuest?.RSVP === "No" && (
                          <>
                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: TEAL_SOFT }} />
                            <span className="font-goudy-italic text-xs font-semibold sm:text-sm" style={{ color: palette.body }}>
                              {copy.responded.declined}
                            </span>
                          </>
                        )}
                      </div>
                      {selectedGuest?.RSVP === "Yes" && (
                        <div className="rounded-lg border p-2.5 sm:p-3" style={innerSurfaceStyle}>
                          <div className="text-center">
                            <p
                              className={`font-goudy-italic mb-1 ${sectionType.label} font-medium`}
                              style={{ color: palette.label }}
                            >
                              {copy.responded.guestCountLabel}
                            </p>
                            <p
                              className={`${theSeasons.className} text-lg sm:text-xl md:text-2xl`}
                              style={{ color: palette.heading }}
                            >
                              {selectedGuest.AllowedGuests || 1}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedGuest && selectedGuest.Message && selectedGuest.Message.trim() !== "" && (
                        <div className="border-t pt-2" style={{ borderColor: innerSurfaceStyle.borderColor }}>
                          <p
                            className={`font-goudy-italic px-1 ${sectionType.label} italic`}
                            style={{ color: palette.body }}
                          >
                            &ldquo;{selectedGuest.Message}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className={`${cinzel.className} mt-4 rounded-full border px-8 py-2.5 ${sectionType.label} font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:mt-5 sm:px-10 sm:py-3 md:mt-6`}
                      style={primaryButtonStyle}
                    >
                      {copy.responded.closeButton}
                    </button>
                  </div>
                ) : (
                  // RSVP Form for guests who haven't responded
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmitRSVP()
                    }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                  {/* Body — fits on screen; scrolls only as a last resort on very short screens */}
                  <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 md:px-7 ${isCompactRsvp ? "space-y-2.5" : "space-y-2.5 sm:space-y-3 md:space-y-4"}`}>
                    <div>
                      <label className={modalLabelClass} style={{ color: palette.heading }}>
                        <Sparkles className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
                        <span>{copy.form.attendLabel}</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, RSVP: "Yes", Guest: "1" }))
                          }
                          className={`relative rounded-lg border-2 transition-all duration-300 ${isCompactRsvp ? "p-2" : "p-2 sm:p-2.5 md:p-3 lg:p-4"} ${
                            formData.RSVP === "Yes"
                              ? "scale-[1.02] shadow-md"
                              : "hover:shadow-sm"
                          }`}
                          style={
                            formData.RSVP === "Yes"
                              ? {
                                  borderColor: palette.accent,
                                  backgroundColor: "color-mix(in srgb, var(--color-motif-medium) 18%, white)",
                                }
                              : { borderColor: HAIRLINE, backgroundColor: IVORY }
                          }
                        >
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <CheckCircle
                              className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                              style={{
                                color:
                                  formData.RSVP === "Yes" ? palette.accent : TEAL_SOFT,
                              }}
                            />
                            <span
                              className="font-goudy-italic text-xs font-semibold sm:text-sm"
                              style={{ color: palette.heading }}
                            >
                              {copy.form.yes}
                            </span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, RSVP: "No" }))}
                          className={`relative rounded-lg border-2 transition-all duration-300 ${isCompactRsvp ? "p-2" : "p-2 sm:p-2.5 md:p-3 lg:p-4"} ${
                            formData.RSVP === "No" ? "scale-[1.02] shadow-md" : "hover:shadow-sm"
                          }`}
                          style={
                            formData.RSVP === "No"
                              ? {
                                  borderColor: TEAL_SOFT,
                                  backgroundColor: "color-mix(in srgb, var(--color-motif-medium) 18%, white)",
                                }
                              : { borderColor: HAIRLINE, backgroundColor: IVORY }
                          }
                        >
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <XCircle
                              className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                              style={{ color: formData.RSVP === "No" ? palette.heading : TEAL_SOFT }}
                            />
                            <span
                              className="font-goudy-italic text-xs font-semibold sm:text-sm"
                              style={{ color: palette.heading }}
                            >
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
                      const updateCompanion = (patch: Partial<{ name: string; relationship: string }>) => {
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
                                              background: "color-mix(in srgb, var(--color-motif-medium) 18%, white)",
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

                          {/* One companion at a time keeps the modal short */}
                          <div className="space-y-2 rounded-xl border p-2.5" style={innerSurfaceStyle}>
                            <span className="inline-flex items-center gap-1.5">
                              <User className="h-3 w-3" style={{ color: palette.accent }} />
                              <span className={`font-goudy-italic ${sectionType.label} font-semibold`} style={{ color: palette.heading }}>
                                {fillText(copy.form.companionProgress, { n: step + 2, total: companions.length + 1 })}
                              </span>
                            </span>
                            <div className="grid grid-cols-1 gap-1.5 min-[380px]:grid-cols-2">
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
                                  name: selectedGuest?.Name?.split(" ")[0] || copy.form.relationshipFallbackName,
                                })}
                                aria-label={fillText(copy.form.relationshipLabel, {
                                  name: selectedGuest?.Name || copy.form.relationshipFallbackName,
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
                                {step < companions.length - 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => setCompanionStep(step + 1)}
                                    className={`${pillBase} border transition-all hover:brightness-110`}
                                    style={outlineButton}
                                  >
                                    {copy.form.nextButton}
                                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => phoneInputRef.current?.focus()}
                                    className={`${pillBase} border`}
                                    style={outlineButton}
                                  >
                                    <Phone className="h-3 w-3" aria-hidden />
                                    {copy.form.phoneLabel.replace(/\s*\*$/, "")}
                                  </button>
                                )}
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
                      </label>
                      <input
                        ref={phoneInputRef}
                        id="rsvp-phone"
                        type="tel"
                        name="Phone"
                        value={formData.Phone}
                        onChange={handleFormChange}
                        autoComplete="tel"
                        inputMode="tel"
                        aria-required="true"
                        placeholder={copy.form.phonePlaceholder}
                        className={modalInputClass}
                        style={modalInputStyle}
                      />
                      <p
                        className={`font-goudy-italic mt-1.5 items-start gap-1.5 ${sectionType.label} leading-snug ${isCompactRsvp ? "hidden" : "flex"}`}
                        style={{ color: palette.body }}
                      >
                        <ShieldCheck
                          className="mt-0.5 h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5"
                          style={{ color: palette.accent }}
                          aria-hidden
                        />
                        <span>
                          {copy.form.phoneNote}
                        </span>
                      </p>
                    </div>

                  </div>

                  {/* Sticky footer — Submit is always visible */}
                  <div
                    className="flex-shrink-0 space-y-2 border-t px-4 pb-4 pt-3 sm:px-6 sm:pb-5 md:px-7"
                    style={{ borderColor: HAIRLINE, background: "color-mix(in srgb, var(--color-motif-medium) 10%, white)" }}
                  >
                    {error && !success && (
                      <div className="rounded-lg border px-2.5 py-1.5" style={noticeStyle}>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: TEAL }} />
                          <span className={`font-goudy-italic font-semibold ${sectionType.label}`}>{error}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`${cinzel.className} flex w-full items-center justify-center gap-1.5 rounded-full border py-2.5 ${sectionType.label} font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-70 sm:gap-2 sm:py-3`}
                        style={primaryButtonStyle}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                            <span className="text-xs sm:text-sm">{copy.form.submitting}</span>
                          </>
                        ) : (
                          <>
                            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">{copy.form.submit}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  </form>
                )}
              </div>

            </div>
          </div>,
        document.body
      )}

      {isMounted && showPhoneAlert && createPortal(
        <div
          className="fixed inset-0 z-[10050] flex items-center justify-center p-5 backdrop-blur-md animate-in fade-in duration-200 sm:p-8"
          style={{ background: DARK_OVERLAY }}
          onClick={handleClosePhoneAlert}
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="phone-alert-title"
            aria-describedby="phone-alert-copy"
            className="w-full max-w-sm animate-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl" style={modalCardStyle}>
              <div
                aria-hidden
                className="h-[3px] w-full"
                style={{
                  background: DEEP_GRADIENT,
                }}
              />
              <div className="px-6 pb-6 pt-6 text-center">
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: DEEP_GRADIENT }}
                >
                  <Phone className="h-6 w-6" style={{ color: IVORY }} strokeWidth={2} />
                </div>

                <h4
                  id="phone-alert-title"
                  className={`${theSeasons.className} mb-2 text-base uppercase tracking-[0.12em]`}
                  style={{ color: palette.heading }}
                >
                  {copy.phoneAlert.title}
                </h4>

                <div
                  id="phone-alert-copy"
                  className={`font-goudy-italic space-y-2.5 ${sectionType.text} leading-relaxed`}
                  style={{ color: palette.body }}
                >
                  {copy.phoneAlert.paragraphs.map((text, i) => (
                    <p key={i}>{text}</p>
                  ))}
                </div>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1" style={dividerLineStyle} />
                  <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" style={{ color: palette.accent }} />
                  <span className="h-px flex-1" style={dividerLineStyle} />
                </div>

                <button
                  type="button"
                  onClick={handleClosePhoneAlert}
                  className={`${cinzel.className} inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 py-2.5 ${sectionType.label} font-semibold uppercase tracking-[0.16em] border transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]`}
                  style={primaryButtonStyle}
                >
                  {copy.phoneAlert.button}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

        {/* RSVP Success — rendered outside RSVP modal to escape transform stacking context */}
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
                    {copy.success.title}
                  </h4>

                  {formData.RSVP === "Yes" && (
                    <p className="font-goudy-italic text-sm leading-snug" style={{ color: palette.body }}>
                      {copy.success.attending}
                    </p>
                  )}
                  {formData.RSVP === "No" && (
                    <p className="font-goudy-italic text-sm leading-snug" style={{ color: palette.body }}>
                      {copy.success.declined}
                    </p>
                  )}
                  {!formData.RSVP && (
                    <p className="font-goudy-italic text-sm leading-snug" style={{ color: palette.body }}>
                      {copy.success.neutral}
                    </p>
                  )}

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
                      setSuccess(null)
                      setShowModal(false)
                      setSearchQuery("")
                      setSelectedGuest(null)
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
                    onClick={() => {
                      setSuccess(null)
                      setShowModal(false)
                      setSearchQuery("")
                      setSelectedGuest(null)
                    }}
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

        {/* Request to Join Modal */}
        {isMounted && showRequestModal && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-3 backdrop-blur-sm animate-in fade-in sm:p-4"
            style={{ background: LIGHT_OVERLAY }}
            onClick={handleCloseRequestModal}
          >
            <div
              className="relative mx-1 flex w-full max-w-md flex-col overflow-visible rounded-xl animate-in zoom-in-95 duration-300 @container/guest-modal sm:mx-2 sm:max-w-lg sm:rounded-2xl md:mx-4"
              style={modalCardStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-5 top-0 h-px sm:inset-x-8"
                style={{
                  background:
                    "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
                }}
              />

              <div className="relative flex-shrink-0 px-4 pb-4 pt-5 text-center sm:px-6 sm:pb-5 sm:pt-6">
                <button
                  onClick={handleCloseRequestModal}
                  className="absolute right-2 top-2 rounded-full p-1 transition-colors hover:bg-[color-mix(in_srgb,var(--color-welcome-text)_10%,transparent)] sm:right-3 sm:top-3 sm:p-1.5"
                  style={{ color: palette.heading }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <div className="mx-auto mb-4 flex items-center justify-center gap-1.5 sm:mb-5">
                  <span className="h-px w-6 sm:w-10" style={dividerLineStyle} />
                  <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: palette.accent }} aria-hidden />
                  <span className="h-px w-6 sm:w-10" style={dividerLineStyle} />
                </div>

                <h3
                  className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
                  style={
                    {
                      "--title-size": modalTitleSize.main,
                      "--script-size": modalTitleSize.script,
                    } as CSSProperties
                  }
                >
                  <span
                    className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] pb-1 sm:pb-1.5`}
                    style={{ fontSize: "var(--title-size)", color: NAVY }}
                  >
                    {copy.request.title}
                  </span>
                  <span
                    aria-hidden
                    className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
                    style={{
                      fontSize: "var(--script-size)",
                      color: palette.accent,
                    }}
                  >
                    {copy.request.script}
                  </span>
                </h3>

                <p
                  className={`font-goudy-italic mx-auto mt-4 max-w-md sm:mt-5 ${sectionType.textSnug}`}
                  style={{ color: palette.body }}
                >
                  {requestFormData.Name
                    ? fill(copy.request.greetingNamed, {
                        name: <span style={{ color: palette.heading }}>{requestFormData.Name}</span>,
                      })
                    : copy.request.greeting}
                </p>
              </div>

              <div className="px-4 pb-4 sm:px-6 sm:pb-5 md:px-7 md:pb-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmitRequest()
                  }}
                  className="space-y-2.5 sm:space-y-3 md:space-y-4"
                >
                  <div>
                    <label className={modalLabelClass} style={{ color: palette.heading }}>
                      <User className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
                      <span>{copy.request.nameLabel}</span>
                    </label>
                    <input
                      type="text"
                      name="Name"
                      value={requestFormData.Name}
                      onChange={(e) => setRequestFormData({ ...requestFormData, Name: e.target.value })}
                      required
                      placeholder={copy.request.namePlaceholder}
                      className={modalInputClass}
                      style={modalInputStyle}
                    />
                  </div>

                  <div>
                    <label className={modalLabelClass} style={{ color: palette.heading }}>
                      <Mail className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
                      <span>{copy.request.emailLabel}</span>
                      <span className={`${sectionType.label} font-normal`} style={{ color: palette.body }}>
                        {copy.request.optional}
                      </span>
                    </label>
                    <input
                      type="email"
                      name="Email"
                      value={requestFormData.Email}
                      onChange={(e) => setRequestFormData({ ...requestFormData, Email: e.target.value })}
                      placeholder={copy.request.emailPlaceholder}
                      className={modalInputClass}
                      style={modalInputStyle}
                    />
                  </div>

                  <div>
                    <label className={modalLabelClass} style={{ color: palette.heading }}>
                      <Phone className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
                      <span>{copy.request.phoneLabel}</span>
                      <span className={`${sectionType.label} font-normal`} style={{ color: palette.body }}>
                        {copy.request.optional}
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="Phone"
                      value={requestFormData.Phone}
                      onChange={(e) => setRequestFormData({ ...requestFormData, Phone: e.target.value })}
                      placeholder={copy.request.phonePlaceholder}
                      className={modalInputClass}
                      style={modalInputStyle}
                    />
                  </div>

                  <div>
                    <label className={modalLabelClass} style={{ color: palette.heading }}>
                      <Users className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
                      <span>{copy.request.guestsLabel}</span>
                    </label>
                    <input
                      type="number"
                      name="Guest"
                      value={requestFormData.Guest}
                      onChange={(e) => setRequestFormData({ ...requestFormData, Guest: e.target.value })}
                      min="1"
                      required
                      placeholder={copy.request.guestsPlaceholder}
                      className={modalInputClass}
                      style={modalInputStyle}
                    />
                  </div>

                  <div>
                    <label className={modalLabelClass} style={{ color: palette.heading }}>
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: palette.accent }} />
                      <span>{copy.request.messageLabel}</span>
                      <span className={`${sectionType.label} font-normal`} style={{ color: palette.body }}>
                        {copy.request.optional}
                      </span>
                    </label>
                    <textarea
                      name="Message"
                      value={requestFormData.Message}
                      onChange={(e) => setRequestFormData({ ...requestFormData, Message: e.target.value })}
                      placeholder={copy.request.messagePlaceholder}
                      rows={3}
                      className={`${modalInputClass} resize-none`}
                      style={modalInputStyle}
                    />
                  </div>

                  <div className="pt-2 sm:pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`${cinzel.className} flex w-full items-center justify-center gap-1.5 rounded-full border py-2.5 ${sectionType.label} font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-70 sm:gap-2 sm:py-3`}
                      style={primaryButtonStyle}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                          <span className="text-xs sm:text-sm">{copy.request.submitting}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">{copy.request.submit}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Enhanced Success Overlay */}
              {requestSuccess && (
                <div className="absolute inset-0 bg-motif-soft/98 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-2 sm:p-3 md:p-4">
                  <div className="text-center p-3 sm:p-4 md:p-5 lg:p-6 max-w-sm mx-auto">
                    {/* Enhanced Icon Circle */}
                    <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                      {/* Animated rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-motif-teal/20 animate-ping" />
                      <div className="absolute inset-0 rounded-full border-2 border-motif-teal/30" />
                      {/* Icon container */}
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center shadow-xl" style={{ background: DEEP_GRADIENT }}>
                        <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10" style={{ color: IVORY }} strokeWidth={2.5} />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h4 className={`${theSeasons.className} mb-2 uppercase tracking-[0.12em] sm:mb-3 ${sectionType.subheader}`} style={{ color: palette.heading }}>
                      {copy.request.sentTitle}
                    </h4>
                    
                    {/* Message */}
                    <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
                      <p className={`font-goudy-italic font-medium ${sectionType.text}`} style={{ color: palette.body }}>
                        {copy.request.sentText}
                      </p>
                      <p className={`font-goudy-italic ${sectionType.label}`} style={{ color: TEAL_SOFT }}>
                        {copy.request.sentSubtext}
                      </p>
                    </div>
                    
                    {/* Subtle closing indicator */}
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-2 sm:mt-3">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-motif-teal/60 rounded-full animate-pulse" />
                      <p className={`text-motif-teal/70 ${sectionType.label}`}>
                        {copy.request.autoClose}
                      </p>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-motif-teal/60 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && !requestSuccess && (
                <div className="px-2 sm:px-2.5 md:px-4 lg:px-6 xl:px-8 pb-2 sm:pb-2.5 md:pb-4 lg:pb-6">
                  <div className="rounded-xl border p-2 sm:p-2.5 md:p-3 lg:p-4" style={noticeStyle}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" style={{ color: TEAL }} />
                      <span className={`font-goudy-italic font-semibold ${sectionType.text}`}>{error}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
        document.body
      )}

      {/* Floating Status Messages (outside modals) */}
      {success && !showModal && !showRequestModal && !requestSuccess && (
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-2 sm:mx-4">
          <div
            className="rounded-xl border p-2 shadow-lg animate-in slide-in-from-top sm:p-3 md:p-4"
            style={{ ...modalCardStyle, borderColor: HAIRLINE }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" style={{ color: TEAL }} />
              <span className={`font-goudy-italic font-semibold ${sectionType.text}`} style={{ color: palette.heading }}>{success}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}