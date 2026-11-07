"use client"

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import MessageWallDisplay from "./message-wall-display"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { HEART_PATH } from "@/components/rising-hearts"


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

// Palette lives in globals.css → motif / welcome tokens.
// Form card: white paper with navy text; dusty-blue labels and button.
const PAPER = "#FFFFFF"
const IVORY = "#FFFFFF"
const NAVY = "var(--color-welcome-navy)"
const BODY = "var(--color-welcome-text)"
const ACCENT = "var(--color-welcome-heading)"

const palette = {
  body: BODY,
  heading: NAVY,
  label: ACCENT,
  accent: ACCENT,
} as const

const lightLineStyle = {
  background: "linear-gradient(to right, transparent, rgb(255 255 255 / 75%), transparent)",
} as const

// Header sits on the dusty-blue Silk backdrop — white text with a navy halo.
// Stronger navy halo now that the silk is bright peach, so the white text stays readable
const silkTitleShadow =
  "0 1px 1px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent), 0 2px 10px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent), 0 8px 28px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent)"
const silkScriptShadow =
  "0 1px 1px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent), 0 2px 12px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent)"
const silkBodyShadow =
  "0 1px 2px color-mix(in srgb, var(--color-welcome-navy) 70%, transparent), 0 2px 12px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent)"

const silkGlowStyle = {
  background:
    "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-welcome-navy) 34%, transparent) 0%, color-mix(in srgb, var(--color-welcome-navy) 14%, transparent) 46%, transparent 72%)",
} as const

// Primary button: deep navy with a soft peach ring
const buttonStyle = {
  background: "linear-gradient(180deg, var(--color-welcome-heading) 0%, var(--color-welcome-navy) 100%)",
  borderColor: "rgb(255 255 255 / 70%)",
  color: "#FFFFFF",
  boxShadow:
    "0 0 0 4px color-mix(in srgb, var(--color-motif-blush) 55%, transparent), 0 12px 24px -10px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
} as const

function SilkTextGlow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 blur-2xl"
        style={silkGlowStyle}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

const cardStyle = {
  background:
    "radial-gradient(90% 40% at 50% 0%, rgb(255 255 255 / 95%) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 14%, white) 100%)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
  boxShadow:
    "0 22px 48px -24px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)",
} as const

interface Message {
  timestamp: string
  name: string
  message: string
}

interface MessageFormProps {
  onSuccess?: () => void
  onMessageSent?: (message: Message) => void
}

/** White hairlines with a small white heart and two dots — reads on the peach silk */
function OutsideDivider() {
  return (
    <div
      className="flex items-center justify-center gap-2"
      style={{ filter: "drop-shadow(0 1px 3px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent))" }}
      aria-hidden
    >
      <span className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(to right, transparent, rgb(255 255 255 / 90%))" }} />
      <span className="h-1 w-1 rounded-full bg-white" />
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#FFFFFF">
        <path d={HEART_PATH} />
      </svg>
      <span className="h-1 w-1 rounded-full bg-white" />
      <span className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(to left, transparent, rgb(255 255 255 / 90%))" }} />
    </div>
  )
}

function CardOrnament() {
  return (
    <div className="mx-auto mb-3 flex items-center justify-center gap-1.5 sm:mb-4" aria-hidden>
      <span className="h-px w-10 sm:w-14" style={{ background: "linear-gradient(to right, transparent, var(--color-motif-yellow))" }} />
      <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="var(--color-motif-medium)">
        <path d={HEART_PATH} />
      </svg>
      <span className="h-px w-10 sm:w-14" style={{ background: "linear-gradient(to left, transparent, var(--color-motif-yellow))" }} />
    </div>
  )
}

function MessagesTitle() {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span className="sr-only">Love Notes and Prayers — Share your love with us</span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: IVORY,
          textShadow: silkTitleShadow,
        }}
      >
        Love Notes
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{
          fontSize: "var(--script-size)",
          color: IVORY,
          textShadow: silkScriptShadow,
        }}
      >
        and prayers
      </span>
    </h2>
  )
}

function MessageForm({ onSuccess, onMessageSent }: MessageFormProps) {
  const siteConfig = useSiteConfig()
  const { brideNickname, groomNickname } = siteConfig.couple
  const coupleDisplayName = `${groomNickname} & ${brideNickname}`

  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [nameValue, setNameValue] = useState("")
  const [messageValue, setMessageValue] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = nameValue.trim()
    const message = messageValue.trim()
    if (!name || !message) return

    setIsSubmitting(true)

    const sentMessage: Message = {
      timestamp: new Date().toISOString(),
      name,
      message,
    }

    onMessageSent?.(sentMessage)
    setIsSubmitted(true)
    setNameValue("")
    setMessageValue("")
    formRef.current?.reset()
    window.setTimeout(() => setIsSubmitted(false), 900)

    const googleFormData = new FormData()
    googleFormData.append("entry.1798554185", name)
    googleFormData.append("entry.1750194818", message)

    try {
      await fetch(siteConfig.googleAPI.messageForm, {
        method: "POST",
        mode: "no-cors",
        body: googleFormData,
      })

      toast({
        title: "Message sent",
        description: "Thank you for your kind words.",
        duration: 3000,
      })

      onSuccess?.()
    } catch {
      toast({
        title: "Unable to send message",
        description: "Please try again in a moment.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputBorder = (field: string) =>
    focusedField === field
      ? palette.accent
      : "color-mix(in srgb, var(--color-motif-medium) 75%, transparent)"

  const inputClass = (field: string) =>
    `message-form-input w-full rounded-lg border px-3 py-2 font-goudy-italic ${sectionType.text} transition-all duration-300 focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-welcome-heading)_22%,transparent)] sm:px-4 sm:py-2.5 md:py-3 ${
      focusedField === field ? "shadow-md" : ""
    }`

  return (
    <div className="relative mx-auto w-full max-w-md px-3 sm:px-0">
      <style>{`
        .message-form-input::placeholder,
        .message-form-textarea::placeholder {
          color: color-mix(in srgb, var(--color-welcome-text) 55%, white) !important;
          opacity: 1 !important;
          font-size: 0.86em;
          letter-spacing: 0.01em;
        }
      `}</style>

      <Card
        className={`relative w-full overflow-hidden rounded-[1.85rem] border transition-all duration-500 ${
          isFocused ? "scale-[1.01]" : ""
        } ${isSubmitted ? "animate-bounce" : ""}`}
        style={cardStyle}
      >
        <div
          className="pointer-events-none absolute inset-2 rounded-[1.5rem] border sm:inset-2.5"
          style={{ borderColor: "color-mix(in srgb, var(--color-motif-yellow) 45%, transparent)" }}
          aria-hidden
        />

        {isSubmitted && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            style={{ backgroundColor: PAPER }}
          >
            <p
              className={`${cinzel.className} font-semibold ${sectionType.subheader}`}
              style={{ color: palette.heading }}
            >
              Sent!
            </p>
          </div>
        )}

        <CardContent className="relative p-5 sm:p-6 md:p-8 lg:p-9">
          <div className="mb-4 text-center sm:mb-5 md:mb-6">
            <CardOrnament />
            <h3
              className={`${theSeasons.className} ${sectionType.subheader} mb-1.5 font-semibold tracking-[0.08em] uppercase`}
              style={{ color: NAVY }}
            >
              Share Your Love
            </h3>
            <p className={`font-goudy-italic ${sectionType.text}`} style={{ color: BODY }}>
              Leave a note for {coupleDisplayName} to read and keep.
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4 md:space-y-5"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <div className="space-y-1.5 sm:space-y-2">
              <label
                className={`${cinzel.className} ${sectionType.label} font-semibold uppercase tracking-[0.16em]`}
                style={{ color: ACCENT }}
              >
                Your Name
              </label>
              <Input
                name="name"
                required
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                placeholder="Full name"
                className={inputClass("name")}
                style={{
                  color: NAVY,
                  backgroundColor: IVORY,
                  borderColor: inputBorder("name"),
                }}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  className={`${cinzel.className} ${sectionType.label} font-semibold uppercase tracking-[0.16em]`}
                  style={{ color: ACCENT }}
                >
                  Your Message
                </label>
                {messageValue && (
                  <span
                    className={`${sectionType.label} ${messageValue.length > 500 ? "text-red-500" : ""}`}
                    style={messageValue.length <= 500 ? { color: palette.accent } : undefined}
                  >
                    {messageValue.length}/500
                  </span>
                )}
              </div>
              <Textarea
                name="message"
                required
                value={messageValue}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setMessageValue(e.target.value)
                  }
                }}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                placeholder={`Write your wishes, prayer, or kind words for ${coupleDisplayName}...`}
                className={`message-form-textarea ${inputClass("message")} min-h-[90px] resize-none placeholder:leading-relaxed sm:min-h-[110px] md:min-h-[130px]`}
                style={{
                  color: NAVY,
                  backgroundColor: IVORY,
                  borderColor: inputBorder("message"),
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !nameValue.trim() || !messageValue.trim()}
              className={`${cinzel.className} group relative w-full rounded-full border px-5 py-2.5 ${sectionType.label} font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] focus-visible:ring-offset-2 active:scale-[0.98] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none sm:py-3 sm:tracking-[0.18em]`}
              style={buttonStyle}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function Messages() {
  const siteConfig = useSiteConfig()
  const { brideNickname, groomNickname } = siteConfig.couple
  const coupleDisplayName = `${groomNickname} & ${brideNickname}`

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [freshKey, setFreshKey] = useState<string | null>(null)

  const messageKey = (m: Message) =>
    `${m.name.trim().toLowerCase()}|${m.message.trim().toLowerCase()}`

  const fetchMessages = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    fetch("/api/messages", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          if (!silent) setMessages([])
          setLoading(false)
          return
        }
        const parsed = data.filter((m: Message) => m.name || m.message || m.timestamp).reverse()
        setMessages((prev) => {
          const serverKeys = new Set(parsed.map(messageKey))
          const pending = prev.filter((local) => !serverKeys.has(messageKey(local)))
          return [...pending, ...parsed]
        })
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch messages:", error)
        setLoading(false)
      })
  }, [])

  const handleMessageSent = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((item) => messageKey(item) === messageKey(message))) return prev
      return [message, ...prev]
    })
    setFreshKey(messageKey(message))
    window.setTimeout(() => setFreshKey(null), 1200)
    window.setTimeout(() => fetchMessages(true), 2200)
  }, [fetchMessages])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}
    >
    <section
      id="messages"
      className="relative z-10 pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 lg:pt-14 lg:pb-14"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-3 @container/messages sm:px-4 md:px-6 lg:px-8">
        {/* Header — outside container */}
        <SilkTextGlow className="mb-6 text-center sm:mb-8 md:mb-10">
          <div className="mx-auto mb-5 sm:mb-6 md:mb-7">
            <OutsideDivider />
          </div>
          <div className="mx-auto mt-2 sm:mt-3 md:mt-4">
            <MessagesTitle />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-2xl px-2 sm:mt-5 md:mt-6 ${sectionType.textRelaxed}`}
            style={{ color: IVORY, textShadow: silkBodyShadow }}
          >
            Share a short note, wish, or prayer for {coupleDisplayName}. Every message becomes part of our story.
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span className="h-px w-16 sm:w-24 md:w-32" style={lightLineStyle} />
          </div>
        </SilkTextGlow>

        {/* Form container */}
        <div className="mb-6 flex justify-center sm:mb-8 md:mb-10">
          <div className="relative w-full max-w-xl">
            <MessageForm onMessageSent={handleMessageSent} />
          </div>
        </div>

     
         <div className="relative mx-auto max-w-4xl pb-2 sm:pb-3">
          <SilkTextGlow className="mb-4 text-center sm:mb-6 md:mb-8">
            <h3
              className={`${theSeasons.className} mb-1.5 font-semibold tracking-[0.08em] uppercase sm:mb-2 ${sectionType.subheader}`}
              style={{ color: IVORY, textShadow: silkTitleShadow }}
            >
              Messages from Loved Ones
            </h3>
            <p
              className={`font-goudy-italic ${sectionType.text}`}
              style={{ color: IVORY, textShadow: silkBodyShadow }}
            >
              Warm words from family and friends
            </p>
            <div className="mt-4 sm:mt-5">
              <OutsideDivider />
            </div>
          </SilkTextGlow>

          <MessageWallDisplay
            messages={messages}
            loading={loading && messages.length === 0}
            freshKey={freshKey}
          />
        </div>  
      </div>
    </section>
    </div>
  )
}
