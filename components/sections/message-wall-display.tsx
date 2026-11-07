"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { cinzel } from "@/lib/fonts"
import { ArrowRight, BookOpen, X } from "lucide-react"
import { sectionType } from "@/lib/section-typography"
import { useSiteConfig } from "@/hooks/use-site-config"


// Palette lives in globals.css → motif / welcome tokens.
// Cards are white paper with navy text; buttons are dusty blue with white text.
const TEAL = "var(--color-welcome-navy)"
const BLUE = "var(--color-welcome-heading)"
const BUTTON = "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"
const BUTTON_EDGE = "rgb(255 255 255 / 70%)"
const SUN = "var(--color-motif-accent)"
const PAPER = "#FFFFFF"
const IVORY = "#FFFFFF"
const NAVY = TEAL
const BODY = "var(--color-welcome-text)"
const ACCENT = BLUE

const palette = {
  body: BODY,
  heading: NAVY,
  label: ACCENT,
  accent: ACCENT,
} as const

const messageCardStyle = {
  background: PAPER,
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
  boxShadow: "0 16px 34px -22px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

const HAIRLINE = "color-mix(in srgb, var(--color-motif-yellow) 40%, transparent)"

const freshShadow =
  "0 18px 36px -18px color-mix(in srgb, var(--color-welcome-navy) 80%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)"

const skeletonBg = "color-mix(in srgb, var(--color-welcome-navy) 12%, transparent)"

interface Message {
  timestamp: string
  name: string
  message: string
}

interface MessageWallDisplayProps {
  messages: Message[]
  loading: boolean
  freshKey?: string | null
}

function messageKey(msg: Message) {
  return `${msg.name.trim().toLowerCase()}|${msg.message.trim().toLowerCase()}`
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Messages shown at once; more than this rotates like the Book of Guests
const MESSAGES_PER_VIEW = 5
// Time each page of 5 stays on screen before the next page starts fading in
const ROTATE_MS = 7000

// Every card is the same height: one-line name/date, exactly MESSAGE_LINES lines of
// message (longer ones are cut off with "Read more"), and a reserved button row.
// So the wall keeps one height while pages rotate.
const MESSAGE_LINES = 3
const GAP = "gap-2.5 sm:gap-3 md:gap-3.5"

// Smooth, unhurried easing (soft start, long gentle settle)
const ease = [0.25, 0.1, 0.25, 1] as const
const settle = [0.16, 1, 0.3, 1] as const

// Page swap: the old page fades out as one piece while the new cards drift in one by one.
// Opacity + transform only (no blur) so it stays smooth on phones.
const listVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.55 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.9, ease },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: settle } },
  exit: {},
}

// full = the same card shown in the popup: whole message, no "Read more", room for the X
function MessageCard({
  msg,
  isNew = false,
  onOpen,
  full = false,
}: {
  msg: Message
  isNew?: boolean
  onOpen?: (msg: Message) => void
  full?: boolean
}) {
  const { topRight, bottomLeft } = useSiteConfig().messageWall.cardDecos
  const textRef = useRef<HTMLParagraphElement>(null)
  const [clamped, setClamped] = useState(false)

  // Show "Read more" only when the message is actually cut off
  useLayoutEffect(() => {
    const el = textRef.current
    if (!el || full) return
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [msg.message, full])

  return (
    <Card
      className="group relative overflow-hidden rounded-[1.35rem] border sm:rounded-[1.5rem]"
      style={{
        ...messageCardStyle,
        borderColor: isNew ? SUN : messageCardStyle.borderColor,
        boxShadow: isNew ? freshShadow : messageCardStyle.boxShadow,
      }}
    >
      {/* Hairline inner frame (turns teal on hover) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-1.5 rounded-[1.05rem] border transition-colors duration-300 group-hover:border-[color-mix(in_srgb,var(--color-welcome-heading)_45%,transparent)] sm:rounded-[1.15rem]"
        style={{ borderColor: HAIRLINE }}
      />

      {/* Decorations (siteConfig.messageWall.cardDecos) */}
      {topRight && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={topRight}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute -right-1 -top-1 w-20 select-none opacity-70 transition-transform duration-700 group-hover:rotate-[4deg] group-hover:scale-105 sm:w-24 md:w-28"
          style={{ transformOrigin: "top right" }}
        />
      )}
      {bottomLeft && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bottomLeft}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute -bottom-1 -left-1 w-16 select-none opacity-25 sm:w-20"
        />
      )}

      {/* Watermark quote mark */}
      <span
        aria-hidden
        className="font-goudy-italic pointer-events-none absolute bottom-[-0.35em] right-3 select-none text-[5.5rem] leading-none sm:text-[6.5rem]"
        style={{ color: "color-mix(in srgb, var(--color-motif-medium) 30%, transparent)" }}
      >
        &rdquo;
      </span>

      <CardContent className="relative p-3 sm:p-4 md:p-5">
        <div
          className={`relative z-10 mb-1.5 flex shrink-0 items-center gap-2 sm:mb-2 sm:gap-3 ${
            full ? "pr-12 sm:pr-14" : "pr-14 sm:pr-16 md:pr-20"
          }`}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 md:h-10 md:w-10"
            style={{
              background: BUTTON,
              boxShadow: `0 0 0 2px ${IVORY}, 0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 70%, transparent), 0 6px 14px -6px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)`,
            }}
          >
            <span className={`${cinzel.className} ${sectionType.label} font-semibold`} style={{ color: IVORY }}>
              {initials(msg.name)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className={`${cinzel.className} ${sectionType.text} truncate font-semibold tracking-[0.04em]`}
              style={{ color: palette.heading }}
              title={msg.name}
            >
              {msg.name}
            </h4>
            <span
              className={`${cinzel.className} ${sectionType.label} block truncate uppercase tracking-[0.12em]`}
              style={{ color: palette.label }}
            >
              {formatTimestamp(msg.timestamp)}
            </span>
          </div>
        </div>

        <div className="relative z-10 pl-5 pr-1 sm:pl-6 sm:pr-3">
          <span
            className="font-goudy-italic absolute left-0 top-0 select-none text-2xl leading-none sm:text-3xl"
            style={{ color: BLUE, opacity: 0.7 }}
            aria-hidden
          >
            &ldquo;
          </span>
          <p
            ref={textRef}
            className={`font-goudy-italic relative z-10 overflow-hidden break-words italic ${sectionType.textRelaxed}`}
            style={
              full
                ? { color: palette.body, whiteSpace: "pre-line" }
                : {
                    color: palette.body,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: MESSAGE_LINES,
                    // Always reserve exactly MESSAGE_LINES lines, even for short messages
                    height: `calc(${MESSAGE_LINES} * 1lh)`,
                  }
            }
          >
            {msg.message}
          </p>
          {/* Reserved row so every card has the same height (popup: just breathing room) */}
          <div className={full ? "h-4 sm:h-5" : "mt-1.5 flex h-7 items-center justify-end sm:h-8"}>
            {!full && clamped && onOpen && (
              <button
                type="button"
                onClick={() => onOpen(msg)}
                aria-label={`Read the full message from ${msg.name}`}
                className={`${cinzel.className} group/read relative inline-flex h-full items-center gap-1.5 overflow-hidden rounded-full border pl-1 pr-3 text-[0.58rem] font-semibold uppercase leading-none tracking-[0.14em] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--color-welcome-navy)_55%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-motif-accent)_45%,transparent)] active:translate-y-0 sm:pr-3.5 sm:text-[0.62rem]`}
                style={{ color: IVORY, background: BUTTON, borderColor: BUTTON_EDGE }}
              >
                {/* Fill sweeps in on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 origin-left scale-x-0 rounded-full transition-transform duration-500 ease-out group-hover/read:scale-x-100"
                  style={{ background: "var(--color-welcome-navy)" }}
                />
                <span
                  aria-hidden
                  className="relative flex h-5 w-5 items-center justify-center rounded-full sm:h-6 sm:w-6"
                  style={{ background: "rgb(255 255 255 / 22%)" }}
                >
                  <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: IVORY }} />
                </span>
                <span className="relative">Read full message</span>
                <ArrowRight
                  aria-hidden
                  className="relative h-3 w-3 transition-transform duration-300 group-hover/read:translate-x-0.5"
                  style={{ color: IVORY }}
                />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MessageWallDisplay({ messages, loading, freshKey = null }: MessageWallDisplayProps) {
  const reduceMotion = useReducedMotion()
  const seenKeys = useRef(new Set<string>())
  const initialized = useRef(false)
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [openMessage, setOpenMessage] = useState<Message | null>(null)

  const rotates = messages.length > MESSAGES_PER_VIEW
  const pageCount = Math.ceil(messages.length / MESSAGES_PER_VIEW)

  useEffect(() => {
    const keys = messages.map((msg) => messageKey(msg))

    if (!initialized.current) {
      keys.forEach((key) => seenKeys.current.add(key))
      initialized.current = messages.length > 0 || !loading
      return
    }

    const incoming = keys.filter((key) => !seenKeys.current.has(key))
    if (incoming.length === 0) return

    incoming.forEach((key) => seenKeys.current.add(key))
    setNewKeys(new Set(incoming))
    const timer = window.setTimeout(() => setNewKeys(new Set()), 900)
    return () => window.clearTimeout(timer)
  }, [messages, loading])

  // A just-sent message goes to the top — jump to the first page so the sender sees it
  useEffect(() => {
    if (freshKey) setCurrentIndex(0)
  }, [freshKey])

  useEffect(() => {
    if (currentIndex >= messages.length) setCurrentIndex(0)
  }, [messages.length, currentIndex])

  // Auto-rotate pages; pauses while hovered/focused or while a message is open
  useEffect(() => {
    // Keeps rotating behind the open message; hover / keyboard focus on the wall pauses it
    if (!rotates || (paused && !openMessage)) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + MESSAGES_PER_VIEW
        return next >= messages.length ? 0 : next
      })
    }, ROTATE_MS)
    return () => clearInterval(interval)
  }, [rotates, paused, openMessage, messages.length])

  const openFull = (msg: Message) => {
    setPaused(false)
    setOpenMessage(msg)
  }

  if (loading) {
    return (
      <div className={`flex flex-col ${GAP}`}>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="rounded-[1.35rem] border sm:rounded-[1.5rem]"
            style={messageCardStyle}
          >
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="mb-3 flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full sm:h-9 sm:w-9" style={{ backgroundColor: skeletonBg }} />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 sm:w-32" style={{ backgroundColor: skeletonBg }} />
                  <Skeleton className="h-2.5 w-20" style={{ backgroundColor: skeletonBg }} />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-lg sm:h-20" style={{ backgroundColor: skeletonBg }} />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div
        className="rounded-[1.85rem] border px-4 py-8 text-center sm:py-12 md:py-16"
        style={messageCardStyle}
      >
        <h3
          className={`${cinzel.className} mb-2 font-semibold uppercase tracking-[0.16em] sm:mb-3 ${sectionType.subheader}`}
          style={{ color: NAVY }}
        >
          No messages yet
        </h3>
        <p
          className={`font-goudy-italic mx-auto mb-5 max-w-md sm:mb-6 ${sectionType.textRelaxed}`}
          style={{ color: BODY }}
        >
          Be the first to leave a note for the happy couple.
        </p>
        <div className="flex justify-center">
          <span
            className={`${cinzel.className} ${sectionType.label} rounded-full border px-4 py-2 font-semibold uppercase tracking-[0.16em]`}
            style={{
              color: IVORY,
              background: BUTTON,
              borderColor: BUTTON_EDGE,
            }}
          >
            Your message will appear here
          </span>
        </div>
      </div>
    )
  }

  // Always a full page when rotating — wraps around to the first messages
  const visibleMessages = rotates
    ? Array.from({ length: MESSAGES_PER_VIEW }, (_, i) => messages[(currentIndex + i) % messages.length])
    : messages
  const activePage = Math.floor(currentIndex / MESSAGES_PER_VIEW)

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={(e) => {
        // Keyboard focus only — a tap/click shouldn't freeze the wall
        if ((e.target as HTMLElement).matches?.(":focus-visible")) setPaused(true)
      }}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Old and new pages share one grid cell, so the height never collapses mid-swap */}
      <div className="grid">
        <AnimatePresence initial={false}>
          <motion.div
            key={rotates ? currentIndex : "all"}
            className={`flex flex-col ${GAP} [grid-area:1/1] will-change-[opacity,transform]`}
            variants={listVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            exit="exit"
          >
            {visibleMessages.map((msg, index) => {
              const isNew = Boolean(freshKey && messageKey(msg) === freshKey) || newKeys.has(messageKey(msg))
              return (
                <motion.div
                  key={`${messageKey(msg)}-${index}`}
                  variants={cardVariants}
                  className="will-change-[opacity,transform]"
                >
                  <MessageCard msg={msg} isNew={isNew} onOpen={openFull} />
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {rotates && (
        <div className="mt-5 flex items-center justify-center gap-2 sm:mt-6">
          {Array.from({ length: pageCount }).map((_, idx) => {
            const isActive = activePage === idx
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx * MESSAGES_PER_VIEW)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: isActive ? "1.5rem" : "0.375rem",
                  background: isActive ? "var(--color-motif-silver)" : "rgb(255 255 255 / 50%)",
                }}
                aria-label={`Show messages page ${idx + 1} of ${pageCount}`}
                aria-current={isActive ? "true" : undefined}
              />
            )
          })}
        </div>
      )}

      {/* Full message: the same card, centered over a blurred page */}
      <Dialog open={openMessage !== null} onOpenChange={(open) => !open && setOpenMessage(null)}>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          // "!" = override the dialog's default box styles (cn() doesn't merge classes);
          // z-[9999]+ so it sits above the navbar / menu like the site's other popups
          overlayClassName="z-[9999]! bg-[color-mix(in_srgb,var(--color-welcome-navy)_32%,transparent)]! backdrop-blur-md data-[state=open]:duration-500 data-[state=closed]:duration-300"
          className="z-[10000]! block! max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)]! max-w-xl! overflow-y-auto rounded-[1.5rem]! border-0! bg-transparent! p-0! shadow-[0_40px_90px_-30px_color-mix(in_srgb,var(--color-welcome-navy)_75%,transparent)]! data-[state=open]:duration-500"
        >
          {openMessage && (
            <div className="relative">
              <DialogTitle className="sr-only">Message from {openMessage.name}</DialogTitle>
              <MessageCard msg={openMessage} full />
              <DialogClose
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 hover:rotate-90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-motif-accent)_45%,transparent)] sm:right-4 sm:top-4 sm:h-9 sm:w-9"
                style={{
                  background: BUTTON,
                  borderColor: BUTTON_EDGE,
                  color: IVORY,
                  boxShadow: "0 6px 14px -6px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent)",
                }}
              >
                <X className="h-4 w-4" aria-hidden />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
