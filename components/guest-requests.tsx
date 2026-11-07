"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Edit2,
  HelpCircle,
  Mail,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] })

const MIN_SEATS = 1
const MAX_SEATS = 20

interface GuestRequest {
  Name: string
  Email: string
  Phone: string
  RSVP: string
  Guest: string
  Message: string
}

interface GuestRequestsProps {
  requests: GuestRequest[]
  onRefresh: () => void
  /** Adds the request to the guest list; resolves true when it worked. */
  onApproveRequest: (request: GuestRequest) => Promise<boolean>
  isLoading: boolean
}

type RsvpKey = "Yes" | "No" | "Maybe" | ""

const RSVP_STYLES: Record<RsvpKey, { label: string; badge: string; active: string; icon: ReactNode }> = {
  Yes: {
    label: "Will attend",
    badge: "bg-green-50 text-green-700 border-green-200",
    active: "border-green-300 bg-green-50 text-green-700",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  No: {
    label: "Can't attend",
    badge: "bg-red-50 text-red-700 border-red-200",
    active: "border-red-200 bg-red-50 text-red-700",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  Maybe: {
    label: "Maybe",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    active: "border-amber-300 bg-amber-50 text-amber-700",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
  },
  "": {
    label: "No answer",
    badge: "bg-gray-50 text-gray-600 border-gray-200",
    active: "border-gray-300 bg-gray-50 text-gray-700",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
}

const rsvpKey = (value: string): RsvpKey => (value === "Yes" || value === "No" || value === "Maybe" ? value : "")
const seatsOf = (request: GuestRequest) => Math.max(MIN_SEATS, parseInt(request.Guest) || 1)
const emailOf = (request: GuestRequest) => (request.Email && request.Email !== "Pending" ? request.Email : "")

const FIELD =
  "w-full rounded-xl border border-dash-border bg-dash-bg px-3 py-2.5 outline-none transition-colors focus:border-dash-focus focus:bg-white focus:ring-2 focus:ring-dash-focus/40"

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

function RsvpBadge({ value }: { value: string }) {
  const style = RSVP_STYLES[rsvpKey(value)]
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:text-xs ${style.badge}`}>
      {style.icon}
      {style.label}
    </span>
  )
}

/** Shared shell for the small centred dialogs (confirm / success). */
function DialogShell({
  children,
  onClose,
  labelledBy,
  tone = "sage",
}: {
  children: ReactNode
  onClose?: () => void
  labelledBy: string
  tone?: "sage" | "rose"
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-dash-ink-strong/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={onClose}
    >
      <div
        className={`dash-sheet w-full max-w-sm overflow-hidden rounded-t-3xl border bg-dash-bg shadow-[0_30px_60px_-25px_color-mix(in_srgb,var(--color-dash-ink-strong)_55%,transparent)] sm:rounded-3xl ${
          tone === "rose" ? "border-dash-danger-border" : "border-dash-border"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:pt-7 sm:pb-6">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300/70 sm:hidden" aria-hidden />
          {children}
        </div>
      </div>
    </div>
  )
}

function RequestSummary({ request }: { request: GuestRequest }) {
  const seats = seatsOf(request)
  return (
    <div className="mx-auto mt-4 max-w-[17rem] rounded-2xl border border-dash-border bg-white px-4 py-3">
      <p className={`${playfair.className} text-base font-semibold text-dash-ink [overflow-wrap:anywhere]`}>{request.Name}</p>
      <p className="mt-0.5 text-xs text-gray-500">
        {seats} {seats === 1 ? "seat" : "seats"} · {RSVP_STYLES[rsvpKey(request.RSVP)].label}
      </p>
    </div>
  )
}

type Confirm = { kind: "approve" | "delete"; request: GuestRequest }
type Done = { kind: "approved" | "updated" | "deleted"; name: string }

export function GuestRequests({ requests, onRefresh, onApproveRequest, isLoading }: GuestRequestsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingRequest, setEditingRequest] = useState<GuestRequest | null>(null)
  const [formData, setFormData] = useState({ Name: "", Email: "", Phone: "", RSVP: "", Guest: "1", Message: "" })
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [busy, setBusy] = useState<null | "approve" | "delete" | "update">(null)
  const [done, setDone] = useState<Done | null>(null)

  useBodyScrollLock(Boolean(editingRequest || confirm || done || busy))

  // Escape closes whichever dialog is on top (not while working)
  useEffect(() => {
    if (busy || !(confirm || editingRequest || done)) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (confirm) setConfirm(null)
      else if (done) setDone(null)
      else setEditingRequest(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [busy, confirm, editingRequest, done])

  const showError = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 4000)
  }

  const filteredRequests = requests.filter((request) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      request.Name.toLowerCase().includes(query) ||
      (request.Email && request.Email.toLowerCase().includes(query)) ||
      (request.Phone && request.Phone.toLowerCase().includes(query))
    )
  })

  const stats = {
    total: requests.length,
    attending: requests.filter((r) => r.RSVP === "Yes").length,
    undecided: requests.filter((r) => r.RSVP !== "Yes" && r.RSVP !== "No").length,
    seats: requests.reduce((sum, r) => sum + seatsOf(r), 0),
  }

  const handleEditClick = (request: GuestRequest) => {
    setEditingRequest(request)
    setFormData({
      Name: request.Name,
      Email: emailOf(request),
      Phone: request.Phone || "",
      RSVP: request.RSVP || "",
      Guest: String(seatsOf(request)),
      Message: request.Message || "",
    })
  }

  const closeEdit = () => {
    setEditingRequest(null)
    setFormData({ Name: "", Email: "", Phone: "", RSVP: "", Guest: "1", Message: "" })
  }

  const handleUpdateRequest = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!editingRequest || !formData.Name) {
      showError("Name is required")
      return
    }

    setBusy("update")
    try {
      const response = await fetch("/api/guest-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Failed to update request")

      const name = formData.Name
      closeEdit()
      setDone({ kind: "updated", name })
      onRefresh()
    } catch (err) {
      console.error("Error updating request:", err)
      showError("We couldn't save the changes. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  const runConfirm = async () => {
    if (!confirm) return
    const { kind, request } = confirm
    setConfirm(null)
    setBusy(kind)

    try {
      if (kind === "approve") {
        const ok = await onApproveRequest(request)
        if (!ok) throw new Error("approve failed")
        setDone({ kind: "approved", name: request.Name })
      } else {
        const response = await fetch("/api/guest-requests", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Name: request.Name }),
        })
        if (!response.ok) throw new Error("Failed to delete request")
        setDone({ kind: "deleted", name: request.Name })
        onRefresh()
      }
    } catch (err) {
      console.error(`Error (${kind}) request:`, err)
      showError(kind === "approve" ? "We couldn't approve this request. Please try again." : "We couldn't delete this request. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  const seats = Math.max(MIN_SEATS, parseInt(formData.Guest) || 1)
  const setSeats = (n: number) => setFormData((f) => ({ ...f, Guest: String(Math.min(MAX_SEATS, Math.max(MIN_SEATS, n))) }))

  const actionBtn =
    "flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors"

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-dash-ink sm:text-2xl">Guest Join Requests</h2>
        <button
          type="button"
          onClick={onRefresh}
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
          { label: "Requests", value: stats.total, tone: "border-dash-border bg-white text-dash-primary" },
          { label: "Will attend", value: stats.attending, tone: "border-green-200 bg-green-50 text-green-700" },
          { label: "Maybe / no answer", value: stats.undecided, tone: "border-amber-200 bg-amber-50 text-amber-700" },
          { label: "Seats requested", value: stats.seats, tone: "border-blue-200 bg-blue-50 text-blue-700" },
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
          <UserPlus className="h-4 w-4" />
        </span>
        <p className="text-xs leading-relaxed text-dash-text sm:text-sm">
          People who didn&apos;t find their name and asked to join. <span className="font-semibold text-dash-ink">Approve</span> adds
          them to your guest list so they can RSVP; edit or delete as needed.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full rounded-lg border border-dash-border bg-white py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-dash-focus"
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-xl border border-dash-border bg-white px-6 py-12 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-dash-surface">
            <UserPlus className="h-7 w-7 text-dash-line" />
          </span>
          <h3 className={`${playfair.className} text-lg font-semibold text-dash-ink`}>
            {searchQuery ? "No matching requests" : "No join requests"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isLoading
              ? "Loading requests..."
              : searchQuery
                ? "Try a different name, email or phone."
                : "When someone asks to join from your invitation, they'll appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* Cards (phones) */}
          <div className="space-y-3 md:hidden">
            {filteredRequests.map((request, index) => {
              const email = emailOf(request)
              const count = seatsOf(request)
              return (
                <div key={`${request.Name}-${index}`} className="rounded-xl border border-dash-border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 font-semibold text-gray-900 [overflow-wrap:anywhere]">{request.Name}</p>
                    <RsvpBadge value={request.RSVP} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-dash-surface px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">Seats</p>
                      <p className="mt-0.5 font-semibold text-dash-primary">{count}</p>
                    </div>
                    <div className="min-w-0 rounded-lg bg-dash-surface px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">Phone</p>
                      <p className="mt-0.5 truncate font-semibold text-gray-700">{request.Phone || "—"}</p>
                    </div>
                  </div>

                  {email && <p className="mt-2.5 text-xs text-gray-600 [overflow-wrap:anywhere]">{email}</p>}
                  {request.Message && (
                    <p className="mt-2.5 rounded-lg border border-dash-tint bg-dash-bg px-3 py-2 text-xs italic leading-relaxed text-gray-600 [overflow-wrap:anywhere]">
                      &ldquo;{request.Message}&rdquo;
                    </p>
                  )}

                  <div className="mt-3 flex gap-2 border-t border-dash-tint pt-3">
                    <button
                      onClick={() => setConfirm({ kind: "approve", request })}
                      className={`${actionBtn} border-transparent bg-dash-primary font-semibold text-white active:brightness-110`}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleEditClick(request)}
                      aria-label={`Edit ${request.Name}`}
                      className={`${actionBtn} max-w-[3rem] border-dash-border text-dash-ink active:bg-dash-surface`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirm({ kind: "delete", request })}
                      aria-label={`Delete ${request.Name}`}
                      className={`${actionBtn} max-w-[3rem] border-red-100 text-red-600 active:bg-red-50`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table (tablet & desktop) */}
          <div className="hidden overflow-hidden rounded-xl border border-dash-border bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-dash-border text-dash-ink">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase lg:px-6">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase lg:px-6">Contact</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase lg:px-6">Seats</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase lg:px-6">Message</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase lg:px-6">RSVP</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase lg:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dash-border">
                  {filteredRequests.map((request, index) => {
                    const email = emailOf(request)
                    return (
                      <tr key={`${request.Name}-${index}`} className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-4 lg:px-6">
                          <span className="font-medium text-gray-800">{request.Name}</span>
                        </td>
                        <td className="px-4 py-4 text-xs lg:px-6">
                          {request.Phone && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Phone className="h-3 w-3" />
                              {request.Phone}
                            </div>
                          )}
                          {email && (
                            <div className="mt-0.5 flex items-center gap-1.5 text-gray-500">
                              <Mail className="h-3 w-3" />
                              <span className="max-w-[12rem] truncate">{email}</span>
                            </div>
                          )}
                          {!request.Phone && !email && <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-4 text-center lg:px-6">
                          <span className="text-sm font-semibold text-dash-primary">{seatsOf(request)}</span>
                        </td>
                        <td className="px-4 py-4 lg:px-6">
                          {request.Message ? (
                            <p className="line-clamp-2 max-w-xs text-xs italic text-gray-600" title={request.Message}>
                              &ldquo;{request.Message}&rdquo;
                            </p>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center lg:px-6">
                          <RsvpBadge value={request.RSVP} />
                        </td>
                        <td className="px-4 py-4 lg:px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setConfirm({ kind: "approve", request })}
                              className="inline-flex items-center gap-1.5 rounded-full bg-dash-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleEditClick(request)}
                              className="text-blue-500 transition-colors hover:text-blue-700"
                              title="Edit request"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirm({ kind: "delete", request })}
                              className="text-red-500 transition-colors hover:text-red-700"
                              title="Delete request"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Edit request ─────────────────────────────────────────────────── */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <form
            onSubmit={handleUpdateRequest}
            className="dash-sheet relative max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
          >
            <div className="sticky top-0 z-20 border-b border-dash-border bg-dash-bg/95 px-4 pt-3 pb-4 backdrop-blur-sm sm:px-6 sm:py-5">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300/70 sm:hidden" aria-hidden />
              <button
                type="button"
                onClick={closeEdit}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-dash-border bg-white text-gray-500 shadow-sm transition-colors hover:text-dash-ink sm:right-5 sm:top-5"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="px-10 text-center sm:px-0 sm:pr-12 sm:text-left">
                <p className={`${cinzel.className} text-[10px] font-semibold uppercase tracking-[0.28em] text-dash-accent`}>Join Request</p>
                <h2 className={`${playfair.className} mt-1 text-[1.45rem] font-semibold leading-tight text-dash-ink sm:text-2xl`}>
                  Edit Request
                </h2>
                <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-gray-500 sm:mx-0 sm:max-w-none sm:text-xs">
                  Correct the details before approving this guest.
                </p>
              </div>
            </div>

            <div className="space-y-4 px-4 pt-4 sm:p-6">
              <div className="space-y-1">
                <FieldLabel htmlFor="req-name">Name</FieldLabel>
                <input id="req-name" value={formData.Name} readOnly className={`${FIELD} cursor-not-allowed bg-gray-50 text-gray-600`} />
              </div>

              <div className="space-y-1">
                <FieldLabel>RSVP</FieldLabel>
                <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(["Yes", "Maybe", "No", ""] as RsvpKey[]).map((value) => {
                    const style = RSVP_STYLES[value]
                    const active = rsvpKey(formData.RSVP) === value
                    return (
                      <button
                        key={value || "none"}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setFormData((f) => ({ ...f, RSVP: value }))}
                        className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                          active ? style.active : "border-dash-border bg-white text-gray-500 hover:text-dash-ink"
                        }`}
                      >
                        {style.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <FieldLabel htmlFor="req-seats" required>Seats</FieldLabel>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-dash-border bg-dash-bg focus-within:border-dash-focus focus-within:ring-2 focus-within:ring-dash-focus/40">
                  <button
                    type="button"
                    onClick={() => setSeats(seats - 1)}
                    disabled={seats <= MIN_SEATS}
                    aria-label="Fewer seats"
                    className="flex w-12 shrink-0 items-center justify-center border-r border-dash-border text-dash-primary transition-colors hover:bg-dash-tint disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col items-center justify-center py-1.5">
                    <input
                      id="req-seats"
                      type="number"
                      inputMode="numeric"
                      min={MIN_SEATS}
                      max={MAX_SEATS}
                      value={seats}
                      onChange={(e) => setSeats(parseInt(e.target.value) || MIN_SEATS)}
                      className="dash-stepper-input w-16 bg-transparent text-center text-xl font-bold leading-none text-dash-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      {seats === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSeats(seats + 1)}
                    disabled={seats >= MAX_SEATS}
                    aria-label="More seats"
                    className="flex w-12 shrink-0 items-center justify-center border-l border-dash-border text-dash-primary transition-colors hover:bg-dash-tint disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <FieldLabel htmlFor="req-phone">Phone</FieldLabel>
                  <input
                    id="req-phone"
                    type="tel"
                    value={formData.Phone}
                    onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                    placeholder="09XX XXX XXXX"
                    className={FIELD}
                  />
                </div>
                <div className="space-y-1">
                  <FieldLabel htmlFor="req-email">Email</FieldLabel>
                  <input
                    id="req-email"
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                    placeholder="name@example.com"
                    className={FIELD}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FieldLabel htmlFor="req-message">Message</FieldLabel>
                <textarea
                  id="req-message"
                  rows={3}
                  value={formData.Message}
                  onChange={(e) => setFormData({ ...formData, Message: e.target.value })}
                  placeholder="No message"
                  className={`${FIELD} resize-none`}
                />
              </div>

              <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t border-dash-border bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:flex-row sm:justify-end sm:gap-3 sm:px-0 sm:pt-5 sm:pb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEdit}
                  disabled={busy === "update"}
                  className="h-11 w-full rounded-full border-dash-border px-7 text-sm font-medium text-gray-600 hover:bg-dash-surface hover:text-dash-ink sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={busy === "update"}
                  className="h-11 w-full rounded-full bg-dash-primary px-8 text-sm font-semibold tracking-wide text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
                >
                  {busy === "update" ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Approve / delete confirmation ───────────────────────────────── */}
      {confirm && (
        <DialogShell labelledBy="req-confirm-title" onClose={() => setConfirm(null)} tone={confirm.kind === "delete" ? "rose" : "sage"}>
          {confirm.kind === "approve" ? (
            <>
              <span className="dash-pop-badge mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dash-tint ring-8 ring-dash-surface">
                <UserPlus className="h-6 w-6 text-dash-primary" />
              </span>
              <p className={`${cinzel.className} mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-dash-accent`}>Approve request</p>
              <h3 id="req-confirm-title" className={`${playfair.className} mt-1 text-[1.4rem] font-semibold leading-tight text-dash-ink`}>
                Add to your guest list?
              </h3>
              <RequestSummary request={confirm.request} />
              <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-gray-600">
                They&apos;ll be able to find their name on your invitation and RSVP. The request will be cleared from this list.
              </p>
            </>
          ) : (
            <>
              <span className="dash-pop-badge mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dash-danger-soft ring-8 ring-dash-danger-softer">
                <AlertTriangle className="h-6 w-6 text-dash-danger-text" />
              </span>
              <p className={`${cinzel.className} mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-dash-danger-text/80`}>Delete request</p>
              <h3 id="req-confirm-title" className={`${playfair.className} mt-1 text-[1.4rem] font-semibold leading-tight text-dash-ink`}>
                Delete this request?
              </h3>
              <RequestSummary request={confirm.request} />
              <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-gray-600">
                The request will be removed and they won&apos;t be added to your guest list. This can&apos;t be undone.
              </p>
            </>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              autoFocus
              onClick={() => setConfirm(null)}
              className="h-11 w-full rounded-full border-dash-border bg-white text-sm font-medium text-dash-ink hover:bg-dash-surface sm:flex-1"
            >
              {confirm.kind === "approve" ? "Not Yet" : "Keep Request"}
            </Button>
            <Button
              type="button"
              onClick={() => void runConfirm()}
              className={`h-11 w-full rounded-full text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99] sm:flex-1 ${
                confirm.kind === "approve"
                  ? "bg-dash-primary shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)]"
                  : "bg-dash-danger shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-danger)_70%,transparent)]"
              }`}
            >
              {confirm.kind === "approve" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Yes, Approve
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Delete
                </>
              )}
            </Button>
          </div>
        </DialogShell>
      )}

      {/* ── Working ─────────────────────────────────────────────────────── */}
      {(busy === "approve" || busy === "delete") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dash-ink-strong/45 p-4 backdrop-blur-[2px]" role="status" aria-live="polite">
          <div className="dash-pop w-full max-w-xs rounded-3xl border border-dash-border bg-dash-bg p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-dash-border border-t-dash-primary" />
            <h3 className={`${playfair.className} text-lg font-semibold text-dash-ink`}>
              {busy === "approve" ? "Adding to guest list…" : "Deleting request…"}
            </h3>
            <p className="mt-1 text-xs text-gray-500">This only takes a moment.</p>
          </div>
        </div>
      )}

      {/* ── Success ─────────────────────────────────────────────────────── */}
      {done && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dash-ink-strong/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="req-done-title"
        >
          <div className="dash-pop relative w-full max-w-sm overflow-hidden rounded-3xl border border-dash-border bg-dash-bg shadow-[0_30px_60px_-25px_color-mix(in_srgb,var(--color-dash-ink-strong)_55%,transparent)]">
            <div className="relative overflow-hidden bg-dash-primary px-6 pt-7 pb-12 text-center">
              <span className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10" aria-hidden />
              <span className="pointer-events-none absolute -right-8 top-6 h-20 w-20 rounded-full bg-white/10" aria-hidden />
              <p className={`${cinzel.className} relative text-[10px] font-semibold uppercase tracking-[0.3em] text-white/75`}>
                {done.kind === "approved" ? "Guest list updated" : done.kind === "updated" ? "Request updated" : "Requests updated"}
              </p>
              <h3 id="req-done-title" className={`${playfair.className} relative mt-1.5 text-[1.6rem] font-semibold leading-tight text-white`}>
                {done.kind === "approved" ? "Request Approved" : done.kind === "updated" ? "Changes Saved" : "Request Deleted"}
              </h3>
            </div>
            <div className="relative -mt-9 flex justify-center">
              <span className="dash-pop-badge flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-dash-bg bg-white shadow-lg">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    done.kind === "deleted" ? "bg-dash-danger-soft text-dash-danger-text" : "bg-dash-tint text-dash-primary"
                  }`}
                >
                  {done.kind === "deleted" ? (
                    <Trash2 className="h-6 w-6" />
                  ) : done.kind === "approved" ? (
                    <Users className="h-6 w-6" />
                  ) : (
                    <Check className="h-7 w-7" strokeWidth={2.5} />
                  )}
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
              <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-gray-600">
                {done.kind === "approved"
                  ? "is now on your guest list and can find their name on your invitation to RSVP."
                  : done.kind === "updated"
                    ? "has been updated. You can approve the request when you're ready."
                    : "has been removed from your join requests."}
              </p>
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
