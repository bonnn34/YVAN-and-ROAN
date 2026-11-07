"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Lock,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  LogOut,
  X, Menu } from "lucide-react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ImprovedGuestList, Guest } from "@/components/improved-guest-list"
import { GuestRequests } from "@/components/guest-requests"
import { GuestMessages } from "@/components/guest-messages"
import { type Message } from "@/app/api/messages/route"
import { EntourageSponsors, type SponsorsList } from "@/components/entourage-sponsors"
import { ProposalDashboard } from "@/components/proposal-dashboard"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"] })

interface GuestRequest {
  Name: string
  Email: string
  Phone: string
  RSVP: string
  Guest: string
  Message: string
}

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

export default function DashboardPage() {
  const siteConfig = useSiteConfig()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"dashboard" | "guests" | "requests" | "messages" | "entourage" | "proposals">("dashboard")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  
  // Guest Request state
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<GuestRequest[]>([])

  // Entourage state
  const [entourage, setEntourage] = useState<Entourage[]>([])
  const [filteredEntourage, setFilteredEntourage] = useState<Entourage[]>([])

  // PrincipalSponsor state
  const [principalSponsors, setPrincipalSponsors] = useState<PrincipalSponsor[]>([])
  const [filteredPrincipalSponsors, setFilteredPrincipalSponsors] = useState<PrincipalSponsor[]>([])
  const [sponsorsList, setSponsorsList] = useState<SponsorsList>("one")
  const sponsorsListRef = useRef<SponsorsList>("one")

  // Guest messages state (from Messages Google Sheet via /api/messages)
  const [messages, setMessages] = useState<Message[]>([])
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)

  // Password - you can change this!
  const DASHBOARD_PASSWORD = "2026" // Change this to your preferred password

  // Check if already authenticated
  useEffect(() => {
    const authStatus = sessionStorage.getItem("dashboardAuth")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      fetchGuests()
      fetchGuestRequests()
      fetchEntourage()
      fetchPrincipalSponsors()
      fetchMessages()
    }
  }, [])

  const fetchGuests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/guests")
      if (!response.ok) {
        throw new Error("Failed to fetch guests")
      }
      const data = await response.json()
      
      // Handle error response
      if (data.error) {
        throw new Error(data.error)
      }
      
      setGuests(Array.isArray(data) ? data : [])
      setFilteredGuests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching guests:", error)
      setError("Failed to load guest list")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    setIsMessagesLoading(true)
    try {
      const response = await fetch("/api/messages", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        console.warn("Unexpected messages response; expected an array", data)
        setMessages([])
        return
      }

      const parsed = data
        .filter((m: Message) => m.name || m.message || m.timestamp)
        .reverse()

      setMessages(parsed)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsMessagesLoading(false)
    }
  }

  const fetchGuestRequests = async () => {
    setIsLoading(true)
    try {
      // Fetch from guest-requests API with cache busting
      const response = await fetch("/api/guest-requests", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to fetch guest requests:", errorText)
        throw new Error("Failed to fetch guest requests")
      }
      
      const data = await response.json()
      console.log("Guest requests fetched:", data)
      
      setGuestRequests(Array.isArray(data) ? data : [])
      setFilteredRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching guest requests:", error)
      setError("Failed to load guest requests. Please check your connection.")
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEntourage = async () => {
    try {
      const response = await fetch("/api/entourage", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch entourage")
      }
      const data = await response.json()
      setEntourage(data)
      setFilteredEntourage(data)
    } catch (error) {
      console.error("Error fetching entourage:", error)
    }
  }

  const fetchPrincipalSponsors = async (list: SponsorsList = sponsorsListRef.current) => {
    try {
      const response = await fetch(`/api/principal-sponsor?list=${list}`, { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch principal sponsors")
      }
      const data = await response.json()
      if (list !== sponsorsListRef.current) return // switched sheets while loading
      setPrincipalSponsors(data)
      setFilteredPrincipalSponsors(data)
    } catch (error) {
      console.error("Error fetching principal sponsors:", error)
    }
  }

  const handleSponsorsListChange = (list: SponsorsList) => {
    if (list === sponsorsListRef.current) return
    sponsorsListRef.current = list
    setSponsorsList(list)
    setPrincipalSponsors([])
    setFilteredPrincipalSponsors([])
    void fetchPrincipalSponsors(list)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === DASHBOARD_PASSWORD) {
      setIsAuthenticated(true)
      setError(null)
      sessionStorage.setItem("dashboardAuth", "true")
      fetchGuests()
      fetchGuestRequests()
      fetchEntourage()
      fetchPrincipalSponsors()
      fetchMessages()
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("dashboardAuth")
    setPassword("")
    setGuests([])
    setFilteredGuests([])
    setMessages([])
  }

  const handleSyncSpreadsheet = () => {
    fetchGuests()
    fetchGuestRequests()
    fetchEntourage()
    fetchPrincipalSponsors()
    fetchMessages()
  }

  // Confirmation + success dialogs live in the Join Requests module; this returns whether it worked
  const handleApproveRequest = async (request: GuestRequest): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Add to main guest list
      const addResponse = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: request.Name,
          role: "Guest",
          email: request.Email || "",
          contact: request.Phone || "",
          message: request.Message || "",
          allowedGuests: parseInt(request.Guest) || 1,
          companions: [],
          tableNumber: "",
          isVip: false,
          status: request.RSVP === "Yes" ? "confirmed" : "pending",
          addedBy: "Request Approved",
        }),
      })

      if (!addResponse.ok) {
        throw new Error("Failed to add to guest list")
      }

      // Delete from guest requests
      const deleteResponse = await fetch("/api/guest-requests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Name: request.Name }),
      })

      if (!deleteResponse.ok) {
        throw new Error("Failed to remove from requests")
      }

      await fetchGuests()
      await fetchGuestRequests()
      return true
    } catch (error) {
      console.error("Error approving request:", error)
      setError("Failed to approve request")
      setTimeout(() => setError(null), 3000)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // New handlers for the improved guest list
  const handleAddGuest = async (guestData: Omit<Guest, 'id'>) => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guestData),
      })

      if (!response.ok) {
        throw new Error("Failed to add guest")
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setSuccessMessage(`✓ ${guestData.name} added successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      await fetchGuests()
    } catch (error: any) {
      console.error("Error adding guest:", error)
      setError(`Failed to add guest: ${error.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateGuest = async (guest: Guest) => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/guests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guest),
      })

      if (!response.ok) {
        throw new Error("Failed to update guest")
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setSuccessMessage(`✓ ${guest.name} updated successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      await fetchGuests()
    } catch (error: any) {
      console.error("Error updating guest:", error)
      setError(`Failed to update guest: ${error.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmation happens in the guest list's delete dialog
  const handleDeleteGuest = async (id: string) => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/guests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete guest")
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setSuccessMessage(`✓ Guest deleted successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      await fetchGuests()
    } catch (error: any) {
      console.error("Error deleting guest:", error)
      setError(`Failed to delete guest: ${error.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const getRSVPStats = () => {
    const attending = guests.filter((g) => g.status === "confirmed").length
    const notAttending = guests.filter((g) => g.status === "declined").length
    const pending = guests.filter((g) => g.status === "pending" || !g.status).length
    // Calculate total guests by summing allowedGuests
    const totalGuests = guests.reduce((sum, guest) => {
      return sum + (guest.allowedGuests || 1)
    }, 0)
    return { attending, notAttending, pending, total: guests.length, totalGuests }
  }

  const stats = getRSVPStats()

  const messageCount = messages.length

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="dashboard-root min-h-screen bg-gradient-to-br from-dash-bg to-dash-bg-deep flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-dash-border">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-dash-primary rounded-2xl mb-4 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <div className="mb-2">
                <span className="font-serif text-sm text-dash-accent">♥</span>
                <span className="font-serif text-2xl font-bold text-dash-ink mx-2">Wedding Invitation</span>
                <span className="font-serif text-sm text-dash-accent">♥</span>
              </div>
              <h1 className="text-2xl font-bold text-dash-ink mb-2">
                Admin Dashboard
              </h1>
              <p className="text-dash-muted text-sm">
                Enter password to access the wedding management panel
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dash-text mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-dash-border rounded-lg focus:ring-2 focus:ring-dash-accent focus:border-transparent outline-none transition-all"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-dash-primary hover:bg-dash-primary-hover text-white py-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                Access Dashboard
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Main Dashboard Layout
  return (
    <div className="dashboard-root flex min-h-screen bg-dash-bg">
      {/* Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        guestRequestCount={guestRequests.length}
        messageCount={messageCount}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content */}
      <div className="min-w-0 flex-1 overflow-x-clip lg:overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 border-b border-dash-border bg-white/90 pt-[env(safe-area-inset-top)] shadow-[0_1px_8px_color-mix(in_srgb,var(--color-dash-ink)_4%,transparent)] backdrop-blur-md supports-[backdrop-filter]:bg-white/80 lg:z-10 lg:bg-white lg:pt-0 lg:shadow-none lg:backdrop-blur-none">
          <div className="px-4 py-3 sm:px-6 lg:px-8 lg:py-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="-ml-1.5 rounded-lg p-2 text-dash-ink hover:bg-dash-bg lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className={`${cinzel.className} text-[9.5px] font-semibold uppercase tracking-[0.24em] text-dash-faint sm:text-[10.5px]`}>
                Welcome back
              </p>
              <h1 className={`${playfair.className} truncate text-[1.05rem] font-semibold leading-tight text-dash-ink sm:text-xl`}>
                {siteConfig.couple.groomNickname} <span className="italic text-dash-accent">&amp;</span> {siteConfig.couple.brideNickname}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Button
                onClick={handleSyncSpreadsheet}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="border-dash-border text-dash-muted hover:text-dash-ink hover:border-dash-accent"
              >
                <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </Button>
              <Button
                onClick={handleLogout}
                size="sm"
                variant="outline"
                className="border-dash-border text-dash-muted hover:text-red-600 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="ml-auto">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <DashboardOverview
              stats={{
                guestGroups: stats.total,
                confirmedPax: stats.totalGuests,
                pendingRSVP: stats.pending,
                joinRequests: guestRequests.length,
                attending: stats.attending,
                notAttending: stats.notAttending,
                entourage: entourage.length,
                principalSponsors: principalSponsors.length,
                messages: messageCount,
              }}
              onNavigate={(tab) => {
                setActiveTab(tab)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            />
          )}

          {activeTab === "guests" && (
            <div>
              <h2 className="text-xl font-bold text-dash-ink mb-4 sm:text-2xl sm:mb-6">Guest Management</h2>
              <div className="sm:bg-white sm:rounded-xl sm:shadow-sm sm:border sm:border-dash-border sm:p-6">
                <ImprovedGuestList
                  guests={filteredGuests}
                  onAddGuest={handleAddGuest}
                  onUpdateGuest={handleUpdateGuest}
                  onDeleteGuest={handleDeleteGuest}
                />
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <GuestRequests
              requests={filteredRequests}
              onRefresh={fetchGuestRequests}
              onApproveRequest={handleApproveRequest}
              isLoading={isLoading}
            />
          )}

          {activeTab === "messages" && (
            <GuestMessages messages={messages} onRefresh={fetchMessages} isLoading={isMessagesLoading} />
          )}

          {activeTab === "entourage" && (
            <EntourageSponsors
              entourage={filteredEntourage}
              principalSponsors={filteredPrincipalSponsors}
              sponsorsList={sponsorsList}
              onSponsorsListChange={handleSponsorsListChange}
              onRefreshEntourage={fetchEntourage}
              onRefreshSponsors={() => fetchPrincipalSponsors()}
              isLoading={isLoading}
            />
          )}

          {activeTab === "proposals" && <ProposalDashboard />}
        </div>
      </div>
    </div>
  )
}

