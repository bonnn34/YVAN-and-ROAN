"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { Button } from "@/components/ui/button"
import { proposalRoleDefinitions } from "@/content/proposal-roles"
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronDown,
  Crown,
  Edit2,
  HeartHandshake,
  Info,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  X,
} from "lucide-react"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] })

interface Entourage {
  Name: string
  RoleCategory: string
  RoleTitle: string
  Email: string
}

interface PrincipalSponsor {
  MalePrincipalSponsor: string
  FemalePrincipalSponsor: string
}

export type SponsorsList = "one" | "two"

interface EntourageSponsorsProps {
  entourage: Entourage[]
  principalSponsors: PrincipalSponsor[]
  /** Which sponsor sheet is being edited (/inviteone or /invitetwo) */
  sponsorsList: SponsorsList
  onSponsorsListChange: (list: SponsorsList) => void
  onRefreshEntourage: () => void
  onRefreshSponsors: () => void
  isLoading: boolean
}

type Tab = "entourage" | "sponsors"
type Confirm = { kind: "entourage"; member: Entourage } | { kind: "sponsor"; sponsor: PrincipalSponsor }
type Done = { title: string; eyebrow: string; name: string; text: string; deleted?: boolean }

const EMPTY_MEMBER = { Name: "", RoleCategory: "", RoleTitle: "", Email: "" }
const EMPTY_SPONSOR = { MalePrincipalSponsor: "", FemalePrincipalSponsor: "" }

// Suggestions for the role field: categories used by the proposal invites + common ones
const DEFAULT_ROLE_CATEGORIES = [
  ...new Set([
    ...proposalRoleDefinitions.map((r) => r.roleCategory).filter((c): c is string => Boolean(c) && c !== "Principal Sponsors"),
    "Maid of Honor",
    "Matron of Honor",
    "Parents of the Groom",
    "Parents of the Bride",
  ]),
]

const FIELD =
  "w-full rounded-xl border border-dash-border bg-dash-bg px-3 py-2.5 outline-none transition-colors focus:border-dash-focus focus:bg-white focus:ring-2 focus:ring-dash-focus/40"

const sponsorLabel = (s: PrincipalSponsor) =>
  [s.MalePrincipalSponsor, s.FemalePrincipalSponsor].filter((n) => n && n.trim()).join(" & ") || "Sponsor pair"

function FieldLabel({ htmlFor, children, required = false }: { htmlFor?: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center justify-between gap-2 text-[13px] font-medium text-dash-ink">
      <span>{children}</span>
      {required ? (
        <span className="rounded-full bg-dash-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dash-primary">Required</span>
      ) : (
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Optional</span>
      )}
    </label>
  )
}

/** Role input with suggestions that filter as you type (works the same on phones). */
function RoleCombobox({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  const q = value.trim().toLowerCase()
  const matches = (q ? options.filter((o) => o.toLowerCase().includes(q)) : options)
    // starts-with matches first, then the rest alphabetically
    .sort((a, b) => Number(!a.toLowerCase().startsWith(q)) - Number(!b.toLowerCase().startsWith(q)) || a.localeCompare(b))
  const exact = options.some((o) => o.toLowerCase() === q)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  const pick = (option: string) => {
    onChange(option)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        id="ent-role"
        required
        role="combobox"
        aria-expanded={open}
        aria-controls="ent-role-list"
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHighlight(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || matches.length === 0) return
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlight((h) => Math.min(matches.length - 1, h + 1))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlight((h) => Math.max(0, h - 1))
          } else if (e.key === "Enter") {
            e.preventDefault()
            pick(matches[highlight])
          } else if (e.key === "Escape") {
            e.stopPropagation()
            setOpen(false)
          }
        }}
        placeholder="Type to search roles…"
        className={`${FIELD} pr-9`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setOpen((o) => !o)}
        aria-label="Show roles"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-dash-primary"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (matches.length > 0 || q) && (
        <ul
          id="ent-role-list"
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border border-dash-border bg-white py-1 shadow-lg"
        >
          {matches.map((option, i) => (
            <li
              key={option}
              role="option"
              aria-selected={i === highlight}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(option)}
              onMouseEnter={() => setHighlight(i)}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                i === highlight ? "bg-dash-tint text-dash-ink" : "text-gray-700"
              }`}
            >
              {option}
              {option.toLowerCase() === q && <Check className="h-3.5 w-3.5 text-dash-primary" />}
            </li>
          ))}
          {q && !exact && (
            <li
              role="option"
              aria-selected={false}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(value.trim())}
              className="cursor-pointer border-t border-dash-tint px-3 py-2 text-xs text-gray-500 hover:bg-dash-surface"
            >
              Use &ldquo;<span className="font-medium text-dash-ink">{value.trim()}</span>&rdquo; as a new role
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

/** Bottom sheet on phones, centred card from sm up. */
function FormSheet({
  eyebrow,
  title,
  subtitle,
  onClose,
  onSubmit,
  busy,
  submitLabel,
  help,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  onClose: () => void
  onSubmit: () => void
  busy: boolean
  submitLabel: string
  /** Bullet points shown when the ⓘ button is tapped */
  help?: { title: ReactNode; points: ReactNode[] }
  children: ReactNode
}) {
  const [showHelp, setShowHelp] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="dash-sheet relative max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="sticky top-0 z-20 border-b border-dash-border bg-dash-bg/95 px-4 pt-3 pb-4 backdrop-blur-sm sm:px-6 sm:py-5">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300/70 sm:hidden" aria-hidden />
          {help ? (
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              aria-label="How this works"
              aria-expanded={showHelp}
              aria-controls="form-sheet-help"
              className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors sm:left-auto sm:right-16 sm:top-5 ${
                showHelp ? "border-dash-accent bg-dash-accent text-white" : "border-dash-border bg-white text-dash-primary hover:bg-dash-tint"
              }`}
            >
              <Info className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-dash-border bg-white text-gray-500 shadow-sm transition-colors hover:text-dash-ink sm:right-5 sm:top-5"
          >
            <X className="h-4 w-4" />
          </button>
          <div className={`px-10 text-center sm:px-0 sm:text-left ${help ? "sm:pr-24" : "sm:pr-12"}`}>
            <p className={`${cinzel.className} text-[10px] font-semibold uppercase tracking-[0.28em] text-dash-accent`}>{eyebrow}</p>
            <h2 className={`${playfair.className} mt-1 text-[1.45rem] font-semibold leading-tight text-dash-ink sm:text-2xl`}>{title}</h2>
            <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-gray-500 sm:mx-0 sm:max-w-none sm:text-xs">{subtitle}</p>
          </div>
        </div>

        <div className="space-y-4 px-4 pt-4 sm:p-6">
          {help && showHelp && (
            <div id="form-sheet-help" className="rounded-xl border border-dash-border bg-dash-surface px-3.5 py-3 text-[12px] leading-relaxed text-dash-text sm:text-[13px]">
              <p className="font-semibold text-dash-ink">{help.title}</p>
              <ul className="mt-1.5 space-y-1">
                {help.points.map((point, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-accent" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {children}

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t border-dash-border bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:flex-row sm:justify-end sm:gap-3 sm:px-0 sm:pt-5 sm:pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={busy}
              className="h-11 w-full rounded-full border-dash-border px-7 text-sm font-medium text-gray-600 hover:bg-dash-surface hover:text-dash-ink sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="h-11 w-full rounded-full bg-dash-primary px-8 text-sm font-semibold tracking-wide text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {submitLabel}
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export function EntourageSponsors({
  entourage,
  principalSponsors,
  sponsorsList,
  onSponsorsListChange,
  onRefreshEntourage,
  onRefreshSponsors,
  isLoading,
}: EntourageSponsorsProps) {
  const [activeSubTab, setActiveSubTab] = useState<Tab>("entourage")
  const sponsorsApi = `/api/principal-sponsor?list=${sponsorsList}`
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Entourage form
  const [showEntourageModal, setShowEntourageModal] = useState(false)
  const [editingEntourage, setEditingEntourage] = useState<Entourage | null>(null)
  const [entourageFormData, setEntourageFormData] = useState(EMPTY_MEMBER)

  // Sponsor form
  const [showSponsorModal, setShowSponsorModal] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<PrincipalSponsor | null>(null)
  const [sponsorFormData, setSponsorFormData] = useState(EMPTY_SPONSOR)

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null) // label of the running action
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [done, setDone] = useState<Done | null>(null)

  const entourageFormOpen = showEntourageModal || Boolean(editingEntourage)
  const sponsorFormOpen = showSponsorModal || Boolean(editingSponsor)

  useBodyScrollLock(entourageFormOpen || sponsorFormOpen || Boolean(confirm || done || busy))

  const closeEntourageForm = () => {
    setShowEntourageModal(false)
    setEditingEntourage(null)
    setEntourageFormData(EMPTY_MEMBER)
  }
  const closeSponsorForm = () => {
    setShowSponsorModal(false)
    setEditingSponsor(null)
    setSponsorFormData(EMPTY_SPONSOR)
  }

  // Escape closes the top-most dialog (not while saving)
  useEffect(() => {
    if (busy) return
    if (!(confirm || done || entourageFormOpen || sponsorFormOpen)) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (confirm) setConfirm(null)
      else if (done) setDone(null)
      else if (entourageFormOpen) closeEntourageForm()
      else closeSponsorForm()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [busy, confirm, done, entourageFormOpen, sponsorFormOpen])

  const showError = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 4000)
  }

  /** Runs a request with the shared "working" overlay; returns whether it succeeded. */
  const run = async (label: string, url: string, method: string, body: unknown) => {
    setBusy(label)
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error(`${method} ${url} failed`)
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      setBusy(null)
    }
  }

  // ── Derived data ───────────────────────────────────────────────────────
  const roleCategories = useMemo(
    () => [...new Set(entourage.map((m) => m.RoleCategory?.trim()).filter(Boolean))].sort(),
    [entourage],
  )
  const roleSuggestions = useMemo(() => [...new Set([...roleCategories, ...DEFAULT_ROLE_CATEGORIES])], [roleCategories])

  useEffect(() => {
    if (roleFilter !== "all" && !roleCategories.includes(roleFilter)) setRoleFilter("all")
  }, [roleCategories, roleFilter])

  const query = searchQuery.trim().toLowerCase()
  const filteredEntourage = entourage.filter((member) => {
    if (roleFilter !== "all" && member.RoleCategory?.trim() !== roleFilter) return false
    if (!query) return true
    return (
      member.Name.toLowerCase().includes(query) ||
      member.RoleTitle?.toLowerCase().includes(query) ||
      member.RoleCategory?.toLowerCase().includes(query) ||
      (member.Email && member.Email.toLowerCase().includes(query))
    )
  })
  const filteredSponsors = principalSponsors.filter((sponsor) => {
    if (!query) return true
    return (
      sponsor.MalePrincipalSponsor?.toLowerCase().includes(query) ||
      sponsor.FemalePrincipalSponsor?.toLowerCase().includes(query)
    )
  })

  const sponsorPeople = principalSponsors.reduce(
    (sum, s) => sum + (s.MalePrincipalSponsor?.trim() ? 1 : 0) + (s.FemalePrincipalSponsor?.trim() ? 1 : 0),
    0,
  )

  // ── Entourage actions ──────────────────────────────────────────────────
  const startEditEntourage = (member: Entourage) => {
    setEditingEntourage(member)
    setEntourageFormData({
      Name: member.Name,
      RoleCategory: member.RoleCategory,
      RoleTitle: member.RoleTitle,
      Email: member.Email && member.Email !== "Pending" ? member.Email : "",
    })
  }

  const saveEntourage = async () => {
    if (!entourageFormData.Name.trim()) {
      showError("Name is required")
      return
    }
    if (!entourageFormData.RoleCategory.trim()) {
      showError("Please choose a role")
      return
    }
    const editing = editingEntourage
    const ok = editing
      ? await run("Saving changes…", "/api/entourage", "PUT", { action: "update", originalName: editing.Name, ...entourageFormData })
      : await run("Adding member…", "/api/entourage", "POST", entourageFormData)
    if (!ok) {
      showError(editing ? "We couldn't update this member. Please try again." : "We couldn't add this member. Please try again.")
      return
    }
    const name = entourageFormData.Name
    const role = entourageFormData.RoleTitle || entourageFormData.RoleCategory
    closeEntourageForm()
    setDone({
      eyebrow: "Entourage updated",
      title: editing ? "Changes Saved" : "Member Added",
      name,
      text: editing ? "is up to date in your entourage." : `is now part of your entourage${role ? ` as ${role}` : ""}.`,
    })
    onRefreshEntourage()
    window.dispatchEvent(new Event("entourageUpdated"))
  }

  // ── Sponsor actions ────────────────────────────────────────────────────
  const startEditSponsor = (sponsor: PrincipalSponsor) => {
    setEditingSponsor(sponsor)
    setSponsorFormData({
      MalePrincipalSponsor: sponsor.MalePrincipalSponsor,
      FemalePrincipalSponsor: sponsor.FemalePrincipalSponsor,
    })
  }

  const saveSponsor = async () => {
    if (!sponsorFormData.MalePrincipalSponsor.trim() && !sponsorFormData.FemalePrincipalSponsor.trim()) {
      showError("Add at least one sponsor name")
      return
    }
    const editing = editingSponsor
    const ok = editing
      ? await run("Saving changes…", sponsorsApi, "PUT", {
          originalMale: editing.MalePrincipalSponsor,
          originalFemale: editing.FemalePrincipalSponsor,
          ...sponsorFormData,
        })
      : await run("Adding sponsors…", sponsorsApi, "POST", sponsorFormData)
    if (!ok) {
      showError(editing ? "We couldn't update these sponsors. Please try again." : "We couldn't add these sponsors. Please try again.")
      return
    }
    const name = sponsorLabel(sponsorFormData)
    closeSponsorForm()
    setDone({
      eyebrow: "Principal sponsors updated",
      title: editing ? "Changes Saved" : "Sponsors Added",
      name,
      text: editing ? "are up to date in your principal sponsors." : "are now listed as your principal sponsors.",
    })
    onRefreshSponsors()
  }

  // ── Delete (after confirmation) ────────────────────────────────────────
  const runDelete = async () => {
    if (!confirm) return
    const target = confirm
    setConfirm(null)

    if (target.kind === "entourage") {
      const ok = await run("Removing member…", "/api/entourage", "DELETE", { Name: target.member.Name })
      if (!ok) return showError("We couldn't remove this member. Please try again.")
      setDone({ eyebrow: "Entourage updated", title: "Member Removed", name: target.member.Name, text: "has been removed from your entourage.", deleted: true })
      onRefreshEntourage()
      window.dispatchEvent(new Event("entourageUpdated"))
    } else {
      const ok = await run("Removing sponsors…", sponsorsApi, "DELETE", {
        MalePrincipalSponsor: target.sponsor.MalePrincipalSponsor,
        FemalePrincipalSponsor: target.sponsor.FemalePrincipalSponsor,
      })
      if (!ok) return showError("We couldn't remove these sponsors. Please try again.")
      setDone({
        eyebrow: "Principal sponsors updated",
        title: "Sponsors Removed",
        name: sponsorLabel(target.sponsor),
        text: "have been removed from your principal sponsors.",
        deleted: true,
      })
      onRefreshSponsors()
    }
  }

  const openAdd = () => {
    if (activeSubTab === "entourage") {
      setEditingEntourage(null)
      setEntourageFormData(roleFilter !== "all" ? { ...EMPTY_MEMBER, RoleCategory: roleFilter } : EMPTY_MEMBER)
      setShowEntourageModal(true)
    } else {
      setEditingSponsor(null)
      setSponsorFormData(EMPTY_SPONSOR)
      setShowSponsorModal(true)
    }
  }

  const mobileActionBtn = "flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors"
  const emptyState = (title: string, text: string, icon: ReactNode) => (
    <div className="rounded-xl border border-dash-border bg-white px-6 py-12 text-center">
      <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-dash-surface text-dash-line">{icon}</span>
      <h3 className={`${playfair.className} text-lg font-semibold text-dash-ink`}>{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{text}</p>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-dash-ink sm:text-2xl">Entourage & Principal Sponsors</h2>
        <button
          type="button"
          onClick={() => (activeSubTab === "entourage" ? onRefreshEntourage() : onRefreshSponsors())}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-full border border-dash-border bg-white px-3 py-1.5 text-xs font-medium text-dash-primary transition-colors hover:bg-dash-surface disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Entourage", value: entourage.length, tone: "border-dash-border bg-white text-dash-primary" },
          { label: "Role groups", value: roleCategories.length, tone: "border-amber-200 bg-amber-50 text-amber-700" },
          { label: "Sponsor pairs", value: principalSponsors.length, tone: "border-purple-200 bg-purple-50 text-purple-700" },
          { label: "Sponsors", value: sponsorPeople, tone: "border-blue-200 bg-blue-50 text-blue-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-lg border p-3 shadow-sm sm:p-4 ${stat.tone}`}>
            <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-600 sm:text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Segmented switch */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-dash-border bg-dash-surface p-1" role="tablist">
        {(
          [
            { id: "entourage", label: "Entourage", short: "Entourage", count: entourage.length, icon: <Crown className="h-4 w-4 shrink-0" /> },
            { id: "sponsors", label: "Principal Sponsors", short: "Sponsors", count: principalSponsors.length, icon: <UserCheck className="h-4 w-4 shrink-0" /> },
          ] as const
        ).map((tab) => {
          const active = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveSubTab(tab.id)
                setSearchQuery("")
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all sm:gap-2 sm:text-sm ${
                active ? "bg-white text-dash-ink shadow-sm ring-1 ring-dash-border" : "text-gray-500 hover:text-dash-ink"
              }`}
            >
              {tab.icon}
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-dash-tint text-dash-primary" : "bg-white/70 text-gray-500"}`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search + add */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === "entourage" ? "Search by name, role or email..." : "Search sponsors..."}
            className="w-full rounded-lg border border-dash-border bg-white py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-dash-focus"
          />
        </div>
        <Button onClick={openAdd} className="h-11 rounded-full bg-dash-primary px-6 text-white hover:brightness-110 sm:h-10">
          <Plus className="mr-1.5 h-4 w-4" />
          {activeSubTab === "entourage" ? "Add Member" : "Add Sponsors"}
        </Button>
      </div>

      {/* Sponsor sheet switch: which invite page's sponsors are being edited */}
      {activeSubTab === "sponsors" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Editing sponsors for</span>
          {(
            [
              { id: "one", label: "Invite One", path: "/inviteone" },
              { id: "two", label: "Invite Two", path: "/invitetwo" },
            ] as const
          ).map((list) => {
            const active = sponsorsList === list.id
            return (
              <button
                key={list.id}
                onClick={() => {
                  onSponsorsListChange(list.id)
                  setSearchQuery("")
                }}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "border-dash-accent bg-dash-accent text-white" : "border-dash-border bg-white text-gray-600 hover:text-dash-ink"
                }`}
              >
                {list.label} <span className={active ? "text-white/80" : "text-gray-400"}>{list.path}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Role filter chips (entourage) */}
      {activeSubTab === "entourage" && roleCategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {["all", ...roleCategories].map((cat) => {
            const active = roleFilter === cat
            const count = cat === "all" ? entourage.length : entourage.filter((m) => m.RoleCategory?.trim() === cat).length
            return (
              <button
                key={cat}
                onClick={() => setRoleFilter(cat)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "border-dash-accent bg-dash-accent text-white" : "border-dash-border bg-white text-gray-600 hover:text-dash-ink"
                }`}
              >
                {cat === "all" ? "All roles" : cat} <span className={active ? "text-white/80" : "text-gray-400"}>{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Entourage list ─────────────────────────────────────────────── */}
      {activeSubTab === "entourage" &&
        (filteredEntourage.length === 0 ? (
          emptyState(
            query || roleFilter !== "all" ? "No matching members" : "No entourage yet",
            isLoading
              ? "Loading entourage..."
              : query || roleFilter !== "all"
                ? "Try a different name or role."
                : "Add your wedding party, or send proposal invites — confirmed roles appear here.",
            <Crown className="h-7 w-7" />,
          )
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filteredEntourage.map((member, index) => (
                <div key={`${member.Name}-${index}`} className="rounded-xl border border-dash-border bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className={`${cinzel.className} flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dash-tint text-xs font-semibold text-dash-primary`}>
                      {member.Name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 [overflow-wrap:anywhere]">{member.Name}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {member.RoleCategory && (
                          <span className="rounded-full bg-dash-bg-deep px-2.5 py-0.5 text-[11px] font-medium text-dash-ink">{member.RoleCategory}</span>
                        )}
                        {member.RoleTitle && member.RoleTitle !== member.RoleCategory && (
                          <span className="rounded-full border border-dash-border px-2.5 py-0.5 text-[11px] text-gray-500">{member.RoleTitle}</span>
                        )}
                      </div>
                      {member.Email && member.Email !== "Pending" && (
                        <p className="mt-1.5 text-xs text-gray-500 [overflow-wrap:anywhere]">{member.Email}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-dash-tint pt-3">
                    <button onClick={() => startEditEntourage(member)} className={`${mobileActionBtn} border-dash-border text-dash-ink active:bg-dash-surface`}>
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => setConfirm({ kind: "entourage", member })} className={`${mobileActionBtn} border-red-100 text-red-600 active:bg-red-50`}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-dash-border bg-white shadow-sm md:block">
              <table className="w-full text-left">
                <thead className="bg-dash-border text-dash-ink">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase lg:px-6">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase lg:px-6">Role</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase lg:px-6">Title</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase lg:px-6">Email</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase lg:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dash-border">
                  {filteredEntourage.map((member, index) => (
                    <tr key={`${member.Name}-${index}`} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-800 lg:px-6">{member.Name}</td>
                      <td className="px-4 py-4 lg:px-6">
                        {member.RoleCategory ? (
                          <span className="rounded-full bg-dash-bg-deep px-2.5 py-1 text-xs font-medium text-dash-ink">{member.RoleCategory}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 lg:px-6">{member.RoleTitle || "—"}</td>
                      <td className="px-4 py-4 text-xs text-gray-500 lg:px-6">
                        {member.Email && member.Email !== "Pending" ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="h-3 w-3" />
                            {member.Email}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-4 lg:px-6">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => startEditEntourage(member)} className="text-blue-500 transition-colors hover:text-blue-700" title="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirm({ kind: "entourage", member })}
                            className="text-red-500 transition-colors hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}

      {/* ── Sponsor list ───────────────────────────────────────────────── */}
      {activeSubTab === "sponsors" &&
        (filteredSponsors.length === 0 ? (
          emptyState(
            query ? "No matching sponsors" : "No principal sponsors yet",
            isLoading ? "Loading principal sponsors..." : query ? "Try a different name." : "Add your Ninong and Ninang pairs here.",
            <HeartHandshake className="h-7 w-7" />,
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSponsors.map((sponsor, index) => (
              <div key={`${sponsorLabel(sponsor)}-${index}`} className="group rounded-2xl border border-dash-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className={`${cinzel.className} text-[10px] font-semibold uppercase tracking-[0.24em] text-dash-accent`}>Pair {index + 1}</p>
                  <HeartHandshake className="h-4 w-4 text-dash-line" aria-hidden />
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="min-w-0 rounded-xl bg-dash-surface px-3 py-2.5 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Ninong</p>
                    <p className={`${playfair.className} mt-0.5 text-sm font-semibold text-dash-ink [overflow-wrap:anywhere]`}>
                      {sponsor.MalePrincipalSponsor || "—"}
                    </p>
                  </div>
                  <span className={`${playfair.className} text-lg italic text-dash-line`} aria-hidden>&amp;</span>
                  <div className="min-w-0 rounded-xl bg-dash-surface px-3 py-2.5 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Ninang</p>
                    <p className={`${playfair.className} mt-0.5 text-sm font-semibold text-dash-ink [overflow-wrap:anywhere]`}>
                      {sponsor.FemalePrincipalSponsor || "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-dash-tint pt-3">
                  <button onClick={() => startEditSponsor(sponsor)} className={`${mobileActionBtn} border-dash-border text-dash-ink hover:bg-dash-surface`}>
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => setConfirm({ kind: "sponsor", sponsor })} className={`${mobileActionBtn} border-red-100 text-red-600 hover:bg-red-50`}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* ── Forms ──────────────────────────────────────────────────────── */}
      {entourageFormOpen && (
        <FormSheet
          eyebrow="Wedding Party"
          title={editingEntourage ? "Edit Member" : "Add Member"}
          subtitle={editingEntourage ? "Update this member's name or role." : "Add someone to your entourage."}
          onClose={closeEntourageForm}
          onSubmit={() => void saveEntourage()}
          busy={Boolean(busy)}
          submitLabel={editingEntourage ? "Save Changes" : "Add Member"}
          help={{
            title: (
              <>
                <span className="text-dash-primary">{entourageFormData.Name.trim() || "This member"}</span> will appear in the Entourage section of
                your invitation.
              </>
            ),
            points: [
              <>
                <span className="font-medium">Role</span> is the group heading they&apos;re listed under (e.g., Bridesmaids).
              </>,
              <>
                <span className="font-medium">Title</span> is their own label within the group (e.g., Maid of Honor).
              </>,
              "Pick a role from the list so they land in the right group; a new role shows as its own group.",
              "People who accept a proposal invite are added here automatically.",
            ],
          }}
        >
          <div className="space-y-1">
            <FieldLabel htmlFor="ent-name" required>Full name</FieldLabel>
            <input
              id="ent-name"
              required
              autoComplete="off"
              value={entourageFormData.Name}
              onChange={(e) => setEntourageFormData({ ...entourageFormData, Name: e.target.value })}
              placeholder="e.g., Maria Santos"
              className={FIELD}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <FieldLabel htmlFor="ent-role" required>Role</FieldLabel>
              <RoleCombobox
                value={entourageFormData.RoleCategory}
                onChange={(v) => setEntourageFormData((f) => ({ ...f, RoleCategory: v }))}
                options={roleSuggestions}
              />
            </div>
            <div className="space-y-1">
              <FieldLabel htmlFor="ent-title">Title</FieldLabel>
              <input
                id="ent-title"
                value={entourageFormData.RoleTitle}
                onChange={(e) => setEntourageFormData({ ...entourageFormData, RoleTitle: e.target.value })}
                placeholder="e.g., Maid of Honor"
                className={FIELD}
              />
            </div>
          </div>
          <div className="space-y-1">
            <FieldLabel htmlFor="ent-email">Email</FieldLabel>
            <input
              id="ent-email"
              type="email"
              value={entourageFormData.Email}
              onChange={(e) => setEntourageFormData({ ...entourageFormData, Email: e.target.value })}
              placeholder="name@example.com"
              className={FIELD}
            />
          </div>
        </FormSheet>
      )}

      {sponsorFormOpen && (
        <FormSheet
          eyebrow="Principal Sponsors"
          title={editingSponsor ? "Edit Sponsors" : "Add Sponsors"}
          subtitle="Add a Ninong and Ninang pair. At least one name is needed."
          onClose={closeSponsorForm}
          onSubmit={() => void saveSponsor()}
          busy={Boolean(busy)}
          submitLabel={editingSponsor ? "Save Changes" : "Add Sponsors"}
          help={{
            title: "Each pair appears together under Principal Sponsors on your invitation.",
            points: [
              "Ninong is listed on the left, Ninang on the right.",
              "Add titles you'd like shown (e.g., Mr., Mrs., Dr.).",
              "If one side is still unknown, leave it blank and fill it in later.",
              "Sponsors who accept a proposal invite are added here automatically.",
            ],
          }}
        >
          <div className="space-y-1">
            <FieldLabel htmlFor="sp-male">Ninong</FieldLabel>
            <input
              id="sp-male"
              autoComplete="off"
              value={sponsorFormData.MalePrincipalSponsor}
              onChange={(e) => setSponsorFormData({ ...sponsorFormData, MalePrincipalSponsor: e.target.value })}
              placeholder="e.g., Mr. Jose Santos"
              className={FIELD}
            />
          </div>
          <div className="space-y-1">
            <FieldLabel htmlFor="sp-female">Ninang</FieldLabel>
            <input
              id="sp-female"
              autoComplete="off"
              value={sponsorFormData.FemalePrincipalSponsor}
              onChange={(e) => setSponsorFormData({ ...sponsorFormData, FemalePrincipalSponsor: e.target.value })}
              placeholder="e.g., Mrs. Ana Santos"
              className={FIELD}
            />
          </div>
        </FormSheet>
      )}

      {/* ── Delete confirmation ────────────────────────────────────────── */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-dash-ink-strong/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="ent-confirm-title"
          onClick={() => setConfirm(null)}
        >
          <div
            className="dash-sheet w-full max-w-sm overflow-hidden rounded-t-3xl border border-dash-danger-border bg-dash-bg shadow-[0_30px_60px_-25px_color-mix(in_srgb,var(--color-dash-ink-strong)_55%,transparent)] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:pt-7 sm:pb-6">
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300/70 sm:hidden" aria-hidden />
              <span className="dash-pop-badge mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dash-danger-soft ring-8 ring-dash-danger-softer">
                <AlertTriangle className="h-6 w-6 text-dash-danger-text" />
              </span>
              <p className={`${cinzel.className} mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-dash-danger-text/80`}>
                {confirm.kind === "entourage" ? "Remove member" : "Remove sponsors"}
              </p>
              <h3 id="ent-confirm-title" className={`${playfair.className} mt-1 text-[1.4rem] font-semibold leading-tight text-dash-ink`}>
                {confirm.kind === "entourage" ? "Remove from entourage?" : "Remove this sponsor pair?"}
              </h3>
              <div className="mx-auto mt-4 max-w-[17rem] rounded-2xl border border-dash-border bg-white px-4 py-3">
                <p className={`${playfair.className} text-base font-semibold text-dash-ink [overflow-wrap:anywhere]`}>
                  {confirm.kind === "entourage" ? confirm.member.Name : sponsorLabel(confirm.sponsor)}
                </p>
                {confirm.kind === "entourage" && (confirm.member.RoleTitle || confirm.member.RoleCategory) && (
                  <p className="mt-0.5 text-xs text-gray-500">{confirm.member.RoleTitle || confirm.member.RoleCategory}</p>
                )}
              </div>
              <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-gray-600">
                {confirm.kind === "entourage"
                  ? "They'll no longer appear in your entourage on the invitation. This can't be undone."
                  : "They'll no longer appear as principal sponsors on the invitation. This can't be undone."}
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  autoFocus
                  onClick={() => setConfirm(null)}
                  className="h-11 w-full rounded-full border-dash-border bg-white text-sm font-medium text-dash-ink hover:bg-dash-surface sm:flex-1"
                >
                  Keep
                </Button>
                <Button
                  type="button"
                  onClick={() => void runDelete()}
                  className="h-11 w-full rounded-full bg-dash-danger text-sm font-semibold text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-danger)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99] sm:flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Working (delete; form saves show inside the button) ───────── */}
      {busy && !entourageFormOpen && !sponsorFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-dash-ink-strong/45 p-4 backdrop-blur-[2px]" role="status" aria-live="polite">
          <div className="dash-pop w-full max-w-xs rounded-3xl border border-dash-border bg-dash-bg p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-dash-border border-t-dash-primary" />
            <h3 className={`${playfair.className} text-lg font-semibold text-dash-ink`}>{busy}</h3>
            <p className="mt-1 text-xs text-gray-500">This only takes a moment.</p>
          </div>
        </div>
      )}

      {/* ── Success ────────────────────────────────────────────────────── */}
      {done && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dash-ink-strong/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ent-done-title"
        >
          <div className="dash-pop relative w-full max-w-sm overflow-hidden rounded-3xl border border-dash-border bg-dash-bg shadow-[0_30px_60px_-25px_color-mix(in_srgb,var(--color-dash-ink-strong)_55%,transparent)]">
            <div className="relative overflow-hidden bg-dash-primary px-6 pt-7 pb-12 text-center">
              <span className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10" aria-hidden />
              <span className="pointer-events-none absolute -right-8 top-6 h-20 w-20 rounded-full bg-white/10" aria-hidden />
              <p className={`${cinzel.className} relative text-[10px] font-semibold uppercase tracking-[0.3em] text-white/75`}>{done.eyebrow}</p>
              <h3 id="ent-done-title" className={`${playfair.className} relative mt-1.5 text-[1.6rem] font-semibold leading-tight text-white`}>
                {done.title}
              </h3>
            </div>
            <div className="relative -mt-9 flex justify-center">
              <span className="dash-pop-badge flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-dash-bg bg-white shadow-lg">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    done.deleted ? "bg-dash-danger-soft text-dash-danger-text" : "bg-dash-tint text-dash-primary"
                  }`}
                >
                  {done.deleted ? <Trash2 className="h-6 w-6" /> : <Check className="h-7 w-7" strokeWidth={2.5} />}
                </span>
              </span>
            </div>
            <div className="px-6 pt-4 pb-6 text-center">
              <p className={`${playfair.className} text-lg font-semibold text-dash-ink [overflow-wrap:anywhere]`}>{done.name}</p>
              <div className="mx-auto mt-2 flex w-24 items-center gap-1.5" aria-hidden>
                <span className="h-px flex-1 bg-dash-line" />
                <span className="h-1 w-1 rotate-45 bg-dash-accent" />
                <span className="h-px flex-1 bg-dash-line" />
              </div>
              <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-gray-600">{done.text}</p>
              <Button
                onClick={() => setDone(null)}
                className="mt-6 h-11 w-full rounded-full bg-dash-primary text-sm font-semibold tracking-wide text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99]"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
