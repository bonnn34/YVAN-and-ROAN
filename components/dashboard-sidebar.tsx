"use client"

import { useEffect, useState } from "react"
import {
  Users,
  MessageSquare,
  Crown,
  LayoutDashboard,
  ExternalLink,
  UserPlus,
  Heart,
  Sheet,
  Globe,
  X,
} from "lucide-react"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { useSiteConfig } from "@/hooks/use-site-config"
import { normalizeWeddingDateString } from "@/lib/wedding-date"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"] })

const DAY_MS = 24 * 60 * 60 * 1000

/** Whole calendar days from today (local) to the wedding day. Negative once it has passed. */
function daysUntil(dateStr: string, now: Date): number | null {
  const wedding = new Date(normalizeWeddingDateString(dateStr))
  if (Number.isNaN(wedding.getTime())) return null
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = new Date(wedding.getFullYear(), wedding.getMonth(), wedding.getDate()).getTime()
  return Math.round((end - start) / DAY_MS)
}

interface DashboardSidebarProps {
  activeTab: "dashboard" | "guests" | "requests" | "messages" | "entourage" | "proposals"
  onTabChange: (tab: "dashboard" | "guests" | "requests" | "messages" | "entourage" | "proposals") => void
  guestRequestCount: number
  messageCount: number
  /** Phones / tablets: drawer state (desktop always shows the sidebar) */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  guestRequestCount,
  messageCount,
  mobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const siteConfig = useSiteConfig()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  // While the phone drawer is open: lock page scroll and let Escape close it
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose?.()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [mobileOpen, onMobileClose])

  const navItems = [
    {
      id: "dashboard" as const,
      group: "Overview",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "guests" as const,
      group: "Guests",
      label: "Guest List",
      icon: Users,
      badge: null,
    },
    {
      id: "requests" as const,
      group: "Guests",
      label: "Join Requests",
      icon: UserPlus,
      badge: guestRequestCount,
    },
    {
      id: "messages" as const,
      group: "Guests",
      label: "Guest Messages",
      icon: MessageSquare,
      badge: messageCount,
    },
    {
      id: "entourage" as const,
      group: "Wedding Party",
      label: "Entourage & Sponsors",
      icon: Crown,
      badge: null,
    },
    {
      id: "proposals" as const,
      group: "Wedding Party",
      label: "Proposal Invites",
      icon: Heart,
      badge: null,
    },
  ]

  const groom = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const weddingDate = normalizeWeddingDateString(siteConfig.wedding.date || siteConfig.ceremony?.date)
  const weddingDay = siteConfig.ceremony?.day || ""
  const weddingTime = siteConfig.ceremony?.time || siteConfig.wedding.time || ""
  const daysLeft = now && weddingDate ? daysUntil(weddingDate, now) : null
  const groups = ["Overview", "Guests", "Wedding Party"] as const

  const panel = (
    <>
      {/* Brand: couple, date and countdown */}
      <div className="relative overflow-hidden border-b border-dash-border bg-dash-surface px-5 pt-5 pb-4 text-center">
        <span className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-dash-border/40" aria-hidden />
        <span className="pointer-events-none absolute -right-10 top-10 h-20 w-20 rounded-full bg-dash-border/30" aria-hidden />
        {onMobileClose ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-dash-border bg-white text-gray-500 shadow-sm transition-colors hover:text-dash-ink lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        <p className={`${cinzel.className} relative text-[9.5px] font-semibold uppercase tracking-[0.3em] text-dash-faint`}>
          Wedding Dashboard
        </p>

        {/* Names */}
        <h2 className={`${playfair.className} relative mt-1.5 truncate px-6 text-[1.3rem] font-semibold leading-tight text-dash-ink lg:px-0`}>
          {groom} <span className="font-medium italic text-dash-accent">&amp;</span> {bride}
        </h2>

        {/* Divider */}
        <div className="relative mx-auto mt-2 flex w-24 items-center gap-1.5" aria-hidden>
          <span className="h-px flex-1 bg-dash-line" />
          <span className="h-1 w-1 rotate-45 bg-dash-accent" />
          <span className="h-px flex-1 bg-dash-line" />
        </div>

        {/* Date */}
        {weddingDate ? (
          <p className={`${cinzel.className} relative mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-dash-primary`}>
            {weddingDay ? `${weddingDay.slice(0, 3)} · ` : ""}
            {weddingDate}
            {weddingTime ? ` · ${weddingTime}` : ""}
          </p>
        ) : null}

        {/* Countdown (compact) */}
        {daysLeft !== null ? (
          <div className="relative mt-3 inline-flex items-center gap-2 rounded-full bg-dash-primary py-1.5 pl-1.5 pr-3.5 text-white shadow-[0_8px_18px_-12px_color-mix(in_srgb,var(--color-dash-ink)_80%,transparent)]">
            {daysLeft > 0 ? (
              <>
                <span className={`${playfair.className} flex h-7 min-w-7 items-center justify-center rounded-full bg-white/15 px-1.5 text-sm font-semibold tabular-nums`}>
                  {daysLeft}
                </span>
                <span className="text-xs font-medium">
                  {daysLeft === 1 ? "day to go" : "days to go"}
                  {daysLeft >= 14 ? <span className="text-white/70"> · {Math.round(daysLeft / 7)} wks</span> : null}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 py-0.5 pl-2 text-xs font-semibold">
                <Heart className="h-3.5 w-3.5 fill-white" />
                {daysLeft === 0 ? "Today's the day!" : `Married ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "day" : "days"} ago`}
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
        {groups.map((group) => (
          <div key={group} className="mb-4 last:mb-0">
            <p className={`${cinzel.className} mb-1.5 px-3 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-dash-faint`}>{group}</p>
            <div className="space-y-0.5">
              {navItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id)
                        onMobileClose?.()
                      }}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                        isActive ? "bg-dash-tint text-dash-ink" : "text-dash-muted hover:bg-dash-surface hover:text-dash-ink"
                      )}
                    >
                      {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-dash-primary" aria-hidden />}
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? "bg-white text-dash-primary shadow-sm ring-1 ring-dash-border"
                            : "bg-dash-surface text-dash-faint group-hover:bg-white group-hover:text-dash-accent"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={cn("flex-1 text-left", isActive && "font-semibold")}>{item.label}</span>
                      {item.badge !== null && item.badge > 0 && (
                        <span
                          className={cn(
                            "min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold",
                            item.id === "requests" ? "bg-dash-accent text-white" : "bg-dash-badge-bg text-dash-badge-text"
                          )}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer links */}
      <div className="space-y-2 border-t border-dash-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-dash-muted transition-colors hover:bg-dash-surface hover:text-dash-ink"
        >
          <Globe className="h-4 w-4 text-dash-faint" />
          <span>View Invitation</span>
          <ExternalLink className="ml-auto h-3 w-3 text-gray-400" />
        </a>
        <a
          href={siteConfig.googleAPI.googleShare}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-2.5 rounded-xl border border-dash-border bg-dash-surface px-3 py-2.5 text-[13px] font-semibold text-dash-ink transition-colors hover:bg-dash-tint"
        >
          <Sheet className="h-4 w-4 text-dash-primary" />
          <span>Open Spreadsheet</span>
          <ExternalLink className="ml-auto h-3 w-3 text-dash-accent" />
        </a>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden w-64 shrink-0 bg-white border-r border-dash-border h-screen sticky top-0 flex-col lg:flex">
        {panel}
      </div>

      {/* Phones / tablets: slide-in drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onMobileClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard menu"
        aria-hidden={!mobileOpen}
      >
        {panel}
      </div>
    </>
  )
}
