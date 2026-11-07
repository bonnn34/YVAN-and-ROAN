"use client"

import { useMemo, useState } from "react"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import { ArrowDownUp, Check, Clock, Copy, Heart, MessageSquare, Quote, RefreshCw, Search } from "lucide-react"
import { type Message } from "@/app/api/messages/route"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"] })

/** Messages longer than this are clamped with a "Read more" toggle. */
const LONG_MESSAGE = 220
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

interface GuestMessagesProps {
  messages: Message[]
  onRefresh: () => Promise<void>
  isLoading?: boolean
}

function toTime(timestamp: string) {
  const t = new Date(timestamp).getTime()
  return Number.isNaN(t) ? 0 : t
}

function formatFullDate(timestamp: string) {
  const t = toTime(timestamp)
  if (!t) return ""
  return new Date(t).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatRelative(timestamp: string) {
  const t = toTime(timestamp)
  if (!t) return "Recently"
  const diff = Date.now() - t
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

function MessageCard({ msg }: { msg: Message }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const isLong = msg.message.length > LONG_MESSAGE
  const name = msg.name?.trim() || "Anonymous"

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`"${msg.message}" — ${name}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <article className="group relative flex flex-col rounded-2xl border border-dash-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <header className="flex items-start gap-3">
        <span
          className={`${cinzel.className} flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dash-primary text-sm font-semibold text-white shadow-sm`}
          aria-hidden
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`${playfair.className} truncate text-base font-semibold text-dash-ink sm:text-lg`}>{name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500 sm:text-xs" title={formatFullDate(msg.timestamp)}>
            <Clock className="h-3 w-3 shrink-0" />
            {formatRelative(msg.timestamp)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          aria-label={copied ? "Copied" : `Copy message from ${name}`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
            copied
              ? "border-dash-accent bg-dash-accent text-white"
              : "border-dash-border bg-white text-gray-400 hover:text-dash-primary sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </header>

      <div className="relative mt-3 flex-1 rounded-xl border border-dash-tint bg-dash-surface px-4 pt-4 pb-3">
        <Quote className="absolute left-3 top-3 h-5 w-5 rotate-180 text-dash-line" aria-hidden />
        <p
          className={`${playfair.className} whitespace-pre-wrap pl-6 text-[0.95rem] italic leading-relaxed text-dash-ink [overflow-wrap:anywhere] sm:text-base ${
            isLong && !expanded ? "line-clamp-5" : ""
          }`}
        >
          {msg.message}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-2 pl-6 text-xs font-semibold text-dash-primary underline-offset-4 hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </article>
  )
}

export function GuestMessages({ messages, onRefresh, isLoading = false }: GuestMessagesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [newestFirst, setNewestFirst] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      await onRefresh()
    } catch {
      setError("We couldn't load messages. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const stats = useMemo(() => {
    const now = Date.now()
    return {
      total: messages.length,
      guests: new Set(messages.map((m) => m.name?.trim().toLowerCase()).filter(Boolean)).size,
      thisWeek: messages.filter((m) => {
        const t = toTime(m.timestamp)
        return t > 0 && now - t <= WEEK_MS
      }).length,
      long: messages.filter((m) => m.message && m.message.length > 100).length,
    }
  }, [messages])

  const visibleMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = query
      ? messages.filter((m) => m.name?.toLowerCase().includes(query) || m.message?.toLowerCase().includes(query))
      : messages
    return [...filtered].sort((a, b) => (newestFirst ? toTime(b.timestamp) - toTime(a.timestamp) : toTime(a.timestamp) - toTime(b.timestamp)))
  }, [messages, searchQuery, newestFirst])

  const busy = isLoading || isRefreshing

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-dash-ink sm:text-2xl">Guest Messages</h2>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-dash-border bg-white px-3 py-1.5 text-xs font-medium text-dash-primary transition-colors hover:bg-dash-surface disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Messages", value: stats.total, tone: "border-dash-border bg-white text-dash-primary" },
          { label: "From guests", value: stats.guests, tone: "border-green-200 bg-green-50 text-green-700" },
          { label: "This week", value: stats.thisWeek, tone: "border-amber-200 bg-amber-50 text-amber-700" },
          { label: "Heartfelt (100+ chars)", value: stats.long, tone: "border-purple-200 bg-purple-50 text-purple-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-lg border p-3 shadow-sm sm:p-4 ${stat.tone}`}>
            <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-600 sm:text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Explainer */}
      <div className="flex gap-3 rounded-xl border border-dash-border bg-dash-surface p-3 sm:p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-dash-primary shadow-sm ring-1 ring-dash-border">
          <Heart className="h-4 w-4" />
        </span>
        <p className="text-xs leading-relaxed text-dash-text sm:text-sm">
          Well wishes your guests left on your invitation. Tap the copy icon to save a favourite for your keepsake book.
        </p>
      </div>

      {/* Search + sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest or words..."
            className="w-full rounded-lg border border-dash-border bg-white py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-dash-focus"
          />
        </div>
        <button
          type="button"
          onClick={() => setNewestFirst((v) => !v)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-dash-border bg-white px-3 text-xs font-medium text-dash-ink transition-colors hover:bg-dash-surface sm:text-sm"
          aria-label={`Sort: ${newestFirst ? "newest first" : "oldest first"}`}
        >
          <ArrowDownUp className="h-4 w-4 text-dash-accent" />
          {newestFirst ? "Newest" : "Oldest"}
        </button>
      </div>

      {searchQuery.trim() && visibleMessages.length > 0 && (
        <p className="text-xs text-gray-500">
          {visibleMessages.length} of {messages.length} messages
        </p>
      )}

      {/* List */}
      {busy && messages.length === 0 ? (
        <div className="rounded-xl border border-dash-border bg-white px-6 py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-dash-border border-t-dash-primary" />
          <h3 className={`${playfair.className} text-lg font-semibold text-dash-ink`}>Loading messages…</h3>
          <p className="mt-1 text-sm text-gray-500">Gathering your guests&apos; well wishes.</p>
        </div>
      ) : visibleMessages.length === 0 ? (
        <div className="rounded-xl border border-dash-border bg-white px-6 py-12 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-dash-surface">
            <MessageSquare className="h-7 w-7 text-dash-line" />
          </span>
          <h3 className={`${playfair.className} text-lg font-semibold text-dash-ink`}>
            {searchQuery ? "No matching messages" : "No messages yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try a different name or word."
              : "When guests leave a message on your invitation, it will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {visibleMessages.map((msg, index) => (
            <MessageCard key={`${msg.timestamp}-${msg.name}-${index}`} msg={msg} />
          ))}
        </div>
      )}
    </div>
  )
}
