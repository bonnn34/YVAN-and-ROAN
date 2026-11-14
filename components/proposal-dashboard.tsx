"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import {
  Copy,
  ExternalLink,
  Send,
  Check,
  Search,
  Link2,
  Crown,
  Users,
  Info,
  X,
  RefreshCw,
  Share2,
  ChevronDown,
} from "lucide-react"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { useSiteConfig } from "@/hooks/use-site-config"
import {
  PROPOSAL_ROLES,
  PROPOSAL_ENTOURAGE_ROLE_SLOTS,
  PROPOSAL_SPONSOR_ROLE_SLOTS,
  countFilledNamesByProposalRoles,
  getRoleSingular,
} from "@/lib/proposal-roles"
import { buildProposalInviteUrl } from "@/lib/proposal-invite-link"
import {
  ProposalMixedText,
  ProposalMixedTextBlock,
  proposalMixedTextInter,
} from "@/lib/proposal-mixed-text"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] })

const PLAYFUL_ROLE_IDS = new Set(["flower-girl", "ring-bearer", "coin-bearer", "bible-bearer", "herald-bearer", "banner-bearer"])

const CATEGORY_TABS = ["all", "Entourage", "Principal Sponsor"] as const

interface EntourageRow {
  Name?: string
  RoleCategory?: string
  RoleTitle?: string
  Email?: string
}

interface PrincipalSponsorRow {
  MalePrincipalSponsor?: string
  FemalePrincipalSponsor?: string
}

export function ProposalDashboard() {
  const siteConfig = useSiteConfig()
  const [entourageRows, setEntourageRows] = useState<EntourageRow[]>([])
  const [sponsorRows, setSponsorRows] = useState<PrincipalSponsorRow[]>([])
  const [isCountsLoading, setIsCountsLoading] = useState(true)
  const [copiedRoleId, setCopiedRoleId] = useState<string | null>(null)
  const [categoryTab, setCategoryTab] = useState<(typeof CATEGORY_TABS)[number]>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInviteRole, setSelectedInviteRole] = useState<
    (typeof PROPOSAL_ROLES)[number] | null
  >(null)
  const [inviteeName, setInviteeName] = useState("")
  const [copiedInviteText, setCopiedInviteText] = useState(false)
  const [copiedPersonalLink, setCopiedPersonalLink] = useState(false)
  const [inviteNameError, setInviteNameError] = useState("")
  const [showInviteHelp, setShowInviteHelp] = useState(false)
  const [showSetupNote, setShowSetupNote] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function")
  }, [])

  useBodyScrollLock(Boolean(selectedInviteRole))

  // Escape closes the invite sheet
  useEffect(() => {
    if (!selectedInviteRole) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInviteModal()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInviteRole])

  const getOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : ""

  const getProposalLink = (roleId: string, invitee?: string) => {
    const origin = getOrigin()
    if (origin) {
      return buildProposalInviteUrl(origin, roleId, invitee)
    }
    return `/will-you-be-proposal/${encodeURIComponent(roleId)}`
  }

  const handleCopyLink = (roleId: string) => {
    const link = getProposalLink(roleId)
    navigator.clipboard.writeText(link).then(() => {
      setCopiedRoleId(roleId)
      setTimeout(() => setCopiedRoleId(null), 2500)
    })
  }

  const openInviteModal = (role: (typeof PROPOSAL_ROLES)[number]) => {
    setSelectedInviteRole(role)
    setInviteeName("")
    setCopiedInviteText(false)
    setShowInviteHelp(false)
  }

  const closeInviteModal = () => {
    setSelectedInviteRole(null)
    setInviteeName("")
    setCopiedInviteText(false)
    setCopiedPersonalLink(false)
    setInviteNameError("")
  }

  const getInviteMessage = () => {
    if (!selectedInviteRole) return ""
    const name = inviteeName.trim()
    const roleSingular = getRoleSingular(selectedInviteRole.title)
    const url = getProposalLink(selectedInviteRole.id, name)
    const groom = siteConfig.couple.groomNickname
    const bride = siteConfig.couple.brideNickname
    const date = siteConfig.wedding.date
    const day = siteConfig.ceremony.day ?? "Saturday"
    const time = siteConfig.ceremony.time ?? siteConfig.wedding.time
    const venue = siteConfig.ceremony.location

    const greeting = name ? `Dear ${name},` : "Hello,"

    return `${greeting}

${groom} & ${bride} have a personal wedding invitation for you.

They would love for you to open your special link, read their message, and confirm whether you can stand with them as their ${roleSingular}.

${date} | ${day} | ${time}
${venue}

Open your invitation:
${url}

With love,
${groom} & ${bride}`
  }

  const handleCopyInviteText = () => {
    if (!inviteeName.trim()) {
      setInviteNameError("Enter the guest's name so the link opens with “Dear (Name)” on the proposal page.")
      return
    }
    setInviteNameError("")
    navigator.clipboard.writeText(getInviteMessage()).then(() => {
      setCopiedInviteText(true)
      setTimeout(() => setCopiedInviteText(false), 2500)
    })
  }

  const handleCopyPersonalLink = () => {
    if (!selectedInviteRole) return
    if (!inviteeName.trim()) {
      setInviteNameError("Enter the guest's name to generate a personalized link.")
      return
    }
    setInviteNameError("")
    const link = getProposalLink(selectedInviteRole.id, inviteeName.trim())
    navigator.clipboard.writeText(link).then(() => {
      setCopiedPersonalLink(true)
      setTimeout(() => setCopiedPersonalLink(false), 2500)
    })
  }

  /** Phones: open the system share sheet (Messenger, Viber, SMS…) with the full message. */
  const handleShareInvite = async () => {
    if (!selectedInviteRole) return
    if (!inviteeName.trim()) {
      setInviteNameError("Enter the guest's name first so the message greets them by name.")
      return
    }
    setInviteNameError("")
    try {
      await navigator.share({ text: getInviteMessage() })
    } catch {
      /* share cancelled — nothing to do */
    }
  }

  const fetchSheetCounts = async () => {
    setIsCountsLoading(true)
    try {
      const [entourageRes, sponsorsRes] = await Promise.all([
        fetch("/api/entourage", { cache: "no-store" }),
        fetch("/api/principal-sponsor", { cache: "no-store" }),
      ])

      if (entourageRes.ok) {
        const data = await entourageRes.json()
        setEntourageRows(Array.isArray(data) ? data : [])
      }

      if (sponsorsRes.ok) {
        const data = await sponsorsRes.json()
        setSponsorRows(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching entourage/sponsor counts:", error)
    } finally {
      setIsCountsLoading(false)
    }
  }

  useEffect(() => {
    fetchSheetCounts()

    const handleEntourageUpdate = () => {
      setTimeout(fetchSheetCounts, 1000)
    }

    window.addEventListener("entourageUpdated", handleEntourageUpdate)
    return () => window.removeEventListener("entourageUpdated", handleEntourageUpdate)
  }, [])

  const filteredRoles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return PROPOSAL_ROLES.filter((role) => {
      const matchesCategory = categoryTab === "all" || role.category === categoryTab
      const matchesSearch =
        !query ||
        role.title.toLowerCase().includes(query) ||
        role.category.toLowerCase().includes(query) ||
        role.roleCategory.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [categoryTab, searchQuery])

  const { filledEntourage: filledEntourageCount, filledSponsors: filledSponsorCount } =
    countFilledNamesByProposalRoles(entourageRows, sponsorRows)

  const categoryCounts = {
    all: PROPOSAL_ROLES.length,
    Entourage: PROPOSAL_ROLES.filter((r) => r.category === "Entourage").length,
    "Principal Sponsor": PROPOSAL_ROLES.filter((r) => r.category === "Principal Sponsor").length,
  } as const

  const greetingWord = selectedInviteRole && PLAYFUL_ROLE_IDS.has(selectedInviteRole.id) ? "Hi" : "Dear"
  const FIELD =
    "w-full rounded-xl border border-dash-border bg-dash-bg px-3 py-2.5 outline-none transition-colors focus:border-dash-focus focus:bg-white focus:ring-2 focus:ring-dash-focus/40"

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-dash-ink sm:text-2xl">Proposal Invites</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchSheetCounts()}
            disabled={isCountsLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-dash-border bg-white px-3 py-1.5 text-xs font-medium text-dash-primary transition-colors hover:bg-dash-surface disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCountsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-dash-border bg-white px-3 py-1.5 text-xs font-medium text-dash-primary transition-colors hover:bg-dash-surface"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview Site
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Entourage roles", value: PROPOSAL_ENTOURAGE_ROLE_SLOTS, tone: "border-dash-border bg-white text-dash-primary" },
          { label: "Sponsor roles", value: PROPOSAL_SPONSOR_ROLE_SLOTS, tone: "border-amber-200 bg-amber-50 text-amber-700" },
          {
            label: "Entourage names",
            value: isCountsLoading ? "…" : filledEntourageCount,
            tone: "border-green-200 bg-green-50 text-green-700",
          },
          {
            label: "Sponsor names",
            value: isCountsLoading ? "…" : filledSponsorCount,
            tone: "border-purple-200 bg-purple-50 text-purple-700",
          },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-lg border p-3 shadow-sm sm:p-4 ${stat.tone}`}>
            <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-600 sm:text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* How it works — collapsed by default so the role cards stay in focus */}
      <div className="rounded-xl border border-dash-border bg-dash-surface">
        <button
          type="button"
          onClick={() => setShowHowItWorks((v) => !v)}
          aria-expanded={showHowItWorks}
          aria-controls="proposal-how-it-works"
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left sm:px-4"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-dash-primary shadow-sm ring-1 ring-dash-border">
            <Info className="h-3.5 w-3.5" />
          </span>
          <span className={`${cinzel.className} flex-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-dash-primary`}>How it works</span>
          <span className="text-[11px] font-medium text-gray-500">{showHowItWorks ? "Hide" : "Show"}</span>
          <ChevronDown className={`h-4 w-4 text-dash-accent transition-transform ${showHowItWorks ? "rotate-180" : ""}`} />
        </button>
        {showHowItWorks && (
          <div id="proposal-how-it-works" className="px-3 pb-3 sm:px-4 sm:pb-4">
            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              {[
                { n: 1, title: "Personalize", text: "Pick a role and type the person's name." },
                { n: 2, title: "Send", text: "Copy or share the message by Messenger, Viber or text." },
                { n: 3, title: "They say yes", text: "Their name fills the next open slot for that role." },
              ].map((step) => (
                <li key={step.n} className="flex gap-2.5 rounded-lg bg-white/70 px-3 py-2.5 ring-1 ring-dash-border">
                  <span className={`${cinzel.className} flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dash-accent text-[11px] font-semibold text-white`}>
                    {step.n}
                  </span>
                  <span className="text-xs leading-relaxed text-dash-text sm:text-[13px]">
                    <span className="font-semibold text-dash-ink">{step.title}.</span> {step.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => {
            const active = categoryTab === tab
            return (
              <button
                key={tab}
                onClick={() => setCategoryTab(tab)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "border-dash-accent bg-dash-accent text-white" : "border-dash-border bg-white text-gray-600 hover:text-dash-ink"
                }`}
              >
                {tab === "all" ? "All roles" : tab}{" "}
                <span className={active ? "text-white/80" : "text-gray-400"}>{categoryCounts[tab]}</span>
              </button>
            )
          })}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-dash-border bg-white py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-dash-focus"
          />
        </div>
      </div>

      {/* Role cards */}
      {filteredRoles.length === 0 ? (
        <div className="rounded-xl border border-dash-border bg-white px-6 py-12 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-dash-surface">
            <Search className="h-7 w-7 text-dash-line" />
          </span>
          <h3 className={`${playfair.className} text-lg font-semibold text-dash-ink`}>No matching roles</h3>
          <p className="mt-1 text-sm text-gray-500">Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRoles.map((role) => {
            const isCopied = copiedRoleId === role.id
            const isSponsor = role.category === "Principal Sponsor"
            return (
              <div
                key={role.id}
                className="group flex flex-col rounded-2xl border border-dash-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isSponsor ? "bg-purple-50 text-purple-600" : "bg-dash-tint text-dash-primary"
                    }`}
                  >
                    {isSponsor ? <Crown className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className={`${playfair.className} text-lg font-semibold leading-tight text-dash-ink`}>{role.title}</h4>
                    <p className="mt-0.5 text-xs text-gray-500">{role.roleCategory}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      isSponsor ? "bg-purple-50 text-purple-700" : "bg-dash-bg-deep text-dash-primary"
                    }`}
                  >
                    {isSponsor ? "Sponsor" : "Entourage"}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-600 sm:text-[13px]">{role.description}</p>

                <div className="mt-4 flex items-center gap-2 border-t border-dash-tint pt-3">
                  <button
                    onClick={() => openInviteModal(role)}
                    className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-dash-primary px-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
                  >
                    <Send className="h-4 w-4" />
                    Personalize & Send
                  </button>
                  <button
                    onClick={() => handleCopyLink(role.id)}
                    aria-label={isCopied ? "Link copied" : `Copy ${role.title} link`}
                    title="Copy general link"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isCopied ? "border-dash-accent bg-dash-accent text-white" : "border-dash-border bg-white text-dash-primary hover:bg-dash-surface"
                    }`}
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  </button>
                  <Link
                    href={`/will-you-be-proposal/${role.id}`}
                    target="_blank"
                    aria-label={`Preview ${role.title} proposal page`}
                    title="Preview proposal page"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dash-border bg-white text-dash-primary transition-colors hover:bg-dash-surface"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Setup note (for whoever maintains the Google Sheets) */}
      <div className="rounded-xl border border-dash-border bg-dash-bg">
        <button
          type="button"
          onClick={() => setShowSetupNote((v) => !v)}
          aria-expanded={showSetupNote}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-xs font-medium text-gray-500"
        >
          <span className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Google Sheets setup note
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showSetupNote ? "rotate-180" : ""}`} />
        </button>
        {showSetupNote && (
          <p className="border-t border-dash-border px-4 py-3 text-xs leading-relaxed text-gray-500">
            Confirmed responses fill the bottom-most empty row in{" "}
            <span className="font-mono text-gray-600">googleAPI.entourage</span> or{" "}
            <span className="font-mono text-gray-600">googleAPI.sponsors</span> for the matching role (Name + RoleCategory).
            Redeploy the Apps Script after updating <span className="font-mono text-gray-600">entourage-management.js</span> and{" "}
            <span className="font-mono text-gray-600">principal-sponsor-management.js</span>.
          </p>
        )}
      </div>

      {/* ── Personalize & send sheet ──────────────────────────────────── */}
      {selectedInviteRole && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={closeInviteModal}>
          <div
            className="dash-sheet relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative shrink-0 border-b border-dash-border bg-dash-bg px-4 pt-3 pb-4 sm:px-6 sm:py-5">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300/70 sm:hidden" aria-hidden />
              <button
                type="button"
                onClick={() => setShowInviteHelp((v) => !v)}
                aria-label="How this works"
                aria-expanded={showInviteHelp}
                className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors sm:left-auto sm:right-16 sm:top-5 ${
                  showInviteHelp ? "border-dash-accent bg-dash-accent text-white" : "border-dash-border bg-white text-dash-primary hover:bg-dash-tint"
                }`}
              >
                <Info className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeInviteModal}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-dash-border bg-white text-gray-500 shadow-sm transition-colors hover:text-dash-ink sm:right-5 sm:top-5"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="px-10 text-center sm:px-0 sm:pr-24 sm:text-left">
                <p className={`${cinzel.className} text-[10px] font-semibold uppercase tracking-[0.28em] text-dash-accent`}>Proposal Invite</p>
                <h2 id="invite-title" className={`${playfair.className} mt-1 text-[1.45rem] font-semibold leading-tight text-dash-ink sm:text-2xl`}>
                  <ProposalMixedText text={selectedInviteRole.title} />
                </h2>
                <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-gray-500 sm:mx-0 sm:max-w-none sm:text-xs">
                  Send a personal link — they&apos;ll only need to answer yes or no.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
              {showInviteHelp && (
                <div className="rounded-xl border border-dash-border bg-dash-surface px-3.5 py-3 text-[12px] leading-relaxed text-dash-text sm:text-[13px]">
                  <p className="font-semibold text-dash-ink">Their link opens a page made just for them.</p>
                  <ul className="mt-1.5 space-y-1">
                    {[
                      `It greets them as "${greetingWord} ${inviteeName.trim() || "Name"}" and asks them to be your ${selectedInviteRole.title}.`,
                      "They tap yes or no — no forms to fill in.",
                      "A yes adds their name to the next open slot for this role in your entourage list.",
                      "Each person needs their own link — create one per guest.",
                    ].map((point) => (
                      <li key={point} className="flex gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-accent" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="invitee-name" className="flex items-center justify-between gap-2 text-[13px] font-medium text-dash-ink">
                  <span>Guest name</span>
                  <span className="rounded-full bg-dash-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dash-primary">Required</span>
                </label>
                <input
                  id="invitee-name"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g., Maria Clara Santos"
                  value={inviteeName}
                  onChange={(e) => {
                    setInviteeName(e.target.value)
                    if (e.target.value.trim()) setInviteNameError("")
                  }}
                  className={`${FIELD} ${proposalMixedTextInter.className}`}
                />
                <p className="text-[11px] text-gray-500">
                  Their page will greet them as{" "}
                  <span className="font-semibold text-dash-primary">
                    &ldquo;{greetingWord} <ProposalMixedText text={inviteeName.trim() || "Name"} />&rdquo;
                  </span>
                </p>
                {inviteNameError && (
                  <p className="text-xs font-medium text-rose-600" role="alert">
                    {inviteNameError}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[13px] font-medium text-dash-ink">Message preview</p>
                <div className="rounded-2xl rounded-tl-md border border-dash-border bg-dash-surface p-3.5">
                  <ProposalMixedTextBlock
                    text={getInviteMessage()}
                    className={`${proposalMixedTextInter.className} max-h-56 overflow-y-auto text-[13px] leading-relaxed text-dash-ink [overflow-wrap:anywhere]`}
                    lineClassName="min-h-[1.35em]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-dash-border bg-dash-bg py-1.5 pl-3 pr-1.5">
                <Link2 className="h-4 w-4 shrink-0 text-dash-accent" />
                <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-gray-500">
                  {getProposalLink(selectedInviteRole.id, inviteeName.trim() || undefined)}
                </p>
                <button
                  type="button"
                  onClick={handleCopyPersonalLink}
                  className={`flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                    copiedPersonalLink ? "bg-dash-accent text-white" : "bg-white text-dash-primary ring-1 ring-dash-border hover:bg-dash-surface"
                  }`}
                >
                  {copiedPersonalLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedPersonalLink ? "Copied" : "Link"}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 flex-col gap-2 border-t border-dash-border bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:py-4">
              {canShare && (
                <button
                  type="button"
                  onClick={() => void handleShareInvite()}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-dash-primary px-6 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99] sm:order-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Invite
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyInviteText}
                className={`flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all active:scale-[0.99] sm:order-1 ${
                  canShare
                    ? copiedInviteText
                      ? "border border-dash-accent bg-dash-accent text-white"
                      : "border border-dash-border bg-white text-dash-ink hover:bg-dash-surface"
                    : copiedInviteText
                      ? "bg-dash-accent text-white"
                      : "bg-dash-primary text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)] hover:brightness-110"
                }`}
              >
                {copiedInviteText ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedInviteText ? "Message copied!" : "Copy Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
