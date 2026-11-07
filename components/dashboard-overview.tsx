"use client"

import { type ReactNode } from "react"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle,
  Clock,
  Crown,
  Heart,
  MessageSquare,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react"
import { TableFinderQrCard } from "@/components/table-finder-qr-card"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] })

export type DashboardTab = "dashboard" | "guests" | "requests" | "messages" | "entourage" | "proposals"

interface DashboardOverviewProps {
  stats: {
    guestGroups: number
    confirmedPax: number
    pendingRSVP: number
    joinRequests: number
    attending?: number
    notAttending?: number
    entourage?: number
    principalSponsors?: number
    messages?: number
  }
  /** Jump to another tab from the guide cards */
  onNavigate?: (tab: DashboardTab) => void
}

/** Plain-language guide for each tab: what it's for and what you can do there. */
const GUIDE: {
  tab: DashboardTab
  title: string
  icon: ReactNode
  about: string
  highlights: string[]
}[] = [
  {
    tab: "guests",
    title: "Guest List",
    icon: <Users className="h-5 w-5" />,
    about: "Everyone you invite. Only names on this list can find themselves and RSVP on your invitation.",
    highlights: [
      "Add a guest with name, allowed seats, table and VIP tag",
      "Edit RSVP details when a guest asks you to correct them",
      "Search, filter by status or VIP, and export to CSV",
    ],
  },
  {
    tab: "requests",
    title: "Join Requests",
    icon: <UserPlus className="h-5 w-5" />,
    about: "People who couldn't find their name and asked to join from the invitation.",
    highlights: [
      "Approve to move them onto your guest list",
      "Edit seats, RSVP or contact details before approving",
      "Delete requests you won't be accepting",
    ],
  },
  {
    tab: "messages",
    title: "Guest Messages",
    icon: <MessageSquare className="h-5 w-5" />,
    about: "Well wishes guests leave on your invitation — a keepsake of your day.",
    highlights: [
      "Read every message as it arrives",
      "Search by name or words, sort newest or oldest",
      "Copy favourites for your keepsake book",
    ],
  },
  {
    tab: "entourage",
    title: "Entourage & Sponsors",
    icon: <Crown className="h-5 w-5" />,
    about: "Your wedding party and principal sponsors, exactly as shown on the invitation.",
    highlights: [
      "Add members by role (e.g., Bridesmaids) and title",
      "Add Ninong & Ninang pairs",
      "Filter by role; updates show on the invitation",
    ],
  },
  {
    tab: "proposals",
    title: "Proposal Invites",
    icon: <Heart className="h-5 w-5" />,
    about: "Personal “Will you be my…?” links for your entourage and sponsors.",
    highlights: [
      "Personalize a link with the person's name",
      "Share by Messenger, Viber or text in one tap",
      "A yes adds them to your entourage automatically",
    ],
  },
]

function StatTile({ label, value, tone, icon }: { label: string; value: number | string; tone: string; icon: ReactNode }) {
  return (
    <div className={`rounded-xl border p-3 shadow-sm sm:p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xl font-bold leading-none sm:text-2xl">{value}</div>
        <span className="opacity-70">{icon}</span>
      </div>
      <div className="mt-1.5 text-[10px] uppercase leading-snug tracking-wide text-gray-600 sm:text-xs">{label}</div>
    </div>
  )
}

export function DashboardOverview({ stats, onNavigate }: DashboardOverviewProps) {
  const attending = stats.attending ?? 0
  const declined = stats.notAttending ?? 0
  const pending = stats.pendingRSVP
  const responded = attending + declined
  const total = stats.guestGroups
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0)

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Heading */}
      <div>
        <p className={`${cinzel.className} text-[10px] font-semibold uppercase tracking-[0.24em] text-dash-faint`}>At a glance</p>
        <h1 className="mt-0.5 text-2xl font-bold text-dash-ink sm:text-3xl">Wedding Overview</h1>
      </div>

      {/* RSVP progress */}
      <div className="rounded-2xl border border-dash-border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[13px] font-medium text-dash-ink">RSVP progress</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {total === 0
                ? "Add guests to start tracking responses."
                : `${responded} of ${total} invitations answered`}
            </p>
          </div>
          <p className={`${playfair.className} text-2xl font-semibold leading-none text-dash-ink`}>
            {total > 0 ? Math.round(pct(responded)) : 0}
            <span className="text-base text-dash-accent">%</span>
          </p>
        </div>
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-dash-tint" role="img" aria-label={`${attending} attending, ${declined} declined, ${pending} pending`}>
          <span className="h-full bg-green-500 transition-all" style={{ width: `${pct(attending)}%` }} />
          <span className="h-full bg-red-400 transition-all" style={{ width: `${pct(declined)}%` }} />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" />Attending {attending}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Declined {declined}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-dash-border" />Pending {pending}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Invitations" value={stats.guestGroups} tone="border-dash-border bg-white text-dash-primary" icon={<Users className="h-4 w-4" />} />
        <StatTile label="Seats (pax)" value={stats.confirmedPax} tone="border-blue-200 bg-blue-50 text-blue-700" icon={<UserCheck className="h-4 w-4" />} />
        <StatTile label="Attending" value={attending} tone="border-green-200 bg-green-50 text-green-700" icon={<CheckCircle className="h-4 w-4" />} />
        <StatTile label="Not attending" value={declined} tone="border-red-200 bg-red-50 text-red-700" icon={<XCircle className="h-4 w-4" />} />
        <StatTile label="Pending RSVP" value={pending} tone="border-amber-200 bg-amber-50 text-amber-700" icon={<Clock className="h-4 w-4" />} />
        <StatTile label="Join requests" value={stats.joinRequests} tone="border-purple-200 bg-purple-50 text-purple-700" icon={<UserPlus className="h-4 w-4" />} />
        <StatTile label="Entourage" value={stats.entourage ?? 0} tone="border-dash-border bg-dash-surface text-dash-primary" icon={<Crown className="h-4 w-4" />} />
        <StatTile label="Principal sponsors" value={stats.principalSponsors ?? 0} tone="border-dash-border bg-dash-surface text-dash-primary" icon={<Heart className="h-4 w-4" />} />
      </div>

      <TableFinderQrCard />

      {/* Guide */}
      <section aria-labelledby="dashboard-guide-title" className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-tint text-dash-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <h2 id="dashboard-guide-title" className="text-lg font-bold text-dash-ink sm:text-xl">
              Your Dashboard Guide
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">What each tab is for and what you can do there.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {GUIDE.map((item) => (
            <article key={item.tab} className="flex flex-col rounded-2xl border border-dash-border bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-tint text-dash-primary">{item.icon}</span>
                <h3 className={`${playfair.className} min-w-0 flex-1 self-center text-lg font-semibold leading-tight text-dash-ink`}>{item.title}</h3>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-gray-600">{item.about}</p>
              <ul className="mt-3 flex-1 space-y-1.5">
                {item.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-[13px] leading-snug text-dash-text">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-accent" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate(item.tab)}
                  className="mt-4 inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-full border border-dash-border bg-dash-surface px-4 text-sm font-semibold text-dash-ink transition-colors hover:bg-dash-tint"
                >
                  Open {item.title}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
