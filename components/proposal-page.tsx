"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  type CSSProperties,
  type ReactNode,
} from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react"
import { Heart, Check, X, Sparkles } from "lucide-react"
import localFont from "next/font/local"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import { ProposalMixedText, proposalMixedTextInter } from "@/lib/proposal-mixed-text"
import { useSiteConfig } from "@/hooks/use-site-config"
import { Hero as InvitationHero } from "@/components/loader/Hero"
import { LoadingScreen } from "@/components/loader/LoadingScreen"
import { InvitePhotoBackdrop, PhotoBackground } from "@/components/loader/invite-photo-backdrop"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { sectionBackground } from "@/lib/section-background"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import type { ProposalRole } from "@/lib/proposal-types"
import { parseInviteeNameFromSearchParams } from "@/lib/proposal-invite-link"
import { TintedDeco } from "@/components/tinted-deco"
import { SectionBackdrop } from "@/components/section-backdrop"
import { HEART_PATH } from "@/components/rising-hearts"

const proposalEntryEase = [0.22, 1, 0.36, 1] as const
const CINEMATIC_ENTRY_MS = 3000

// True once the invitation is on screen, so the header reveal plays when guests can see it
const RevealContext = createContext(true)

const revealEase = [0.22, 1, 0.36, 1] as const

const headerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.3 } },
}

const headerItem: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: revealEase } },
}


const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
})

const inter = proposalMixedTextInter

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

// Every color is a shared invitation role from app/globals.css (--invite-*),
// so the palette there restyles this page, its cards and its dialogs.
const IVORY = "var(--invite-paper)"
const CHAMPAGNE = "var(--invite-accent)"
const INK = "var(--invite-ink)"
const CREAM = "var(--invite-body)"
const LABEL_GOLD = "var(--invite-accent)"
const SCRIPT_GREEN = "var(--invite-script)"
const TITLE = "var(--invite-title)"
const GOLD_BORDER = "var(--invite-line)"
const GOLD_BORDER_SOFT = "var(--invite-line-soft)"
const INNER_SURFACE = "var(--invite-paper-tint)"

// Display lettering is flat, like the loading screen's "Save Date"
const goldGradientText: CSSProperties = { color: TITLE }

const palette = {
  body: CREAM,
  bodySoft: "color-mix(in srgb, var(--invite-body) 80%, transparent)",
  heading: INK,
  label: LABEL_GOLD,
  script: SCRIPT_GREEN,
} as const

const ambientGlowStyle = {
  background: "radial-gradient(ellipse 80% 65% at 50% 50%, var(--invite-glow), transparent 68%)",
} as const

const dividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--invite-line), transparent)",
} as const

// Dusty blue → navy pill with white text (matches the rest of the invitation)
const primaryBtnStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)",
  borderColor: "rgb(255 255 255 / 70%)",
  color: "#FFFFFF",
  boxShadow:
    "0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 22%, transparent), 0 12px 24px -12px var(--invite-shadow)",
}

// White pill with a sky border and navy text
const secondaryBtnStyle: CSSProperties = {
  color: INK,
  backgroundColor: "#FFFFFF",
  borderColor: "color-mix(in srgb, var(--color-motif-medium) 75%, transparent)",
}

const primaryBtnClass =
  `${cinzel.className} touch-manipulation inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border px-5 py-3.5 text-[0.72rem] font-semibold uppercase leading-snug tracking-[0.14em] transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 sm:px-8 sm:text-xs sm:tracking-[0.2em] sm:hover:scale-[1.02]`

const secondaryBtnClass =
  `${cinzel.className} touch-manipulation inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border px-5 py-3 text-[0.66rem] font-semibold uppercase leading-snug tracking-[0.12em] transition-all duration-300 active:scale-[0.98] sm:px-8 sm:text-[0.7rem] sm:tracking-[0.18em] sm:hover:scale-[1.02]`

/* ── Invitation types (wording lives in site.ts → proposal.copy) ──────────── */

type CopyKey = "party" | "sponsor" | "bearer" | "flowerGirl"

const CEREMONY_BEARER_ROLE_IDS = new Set(["ring-bearer", "coin-bearer", "bible-bearer", "herald-bearer", "banner-bearer"])

function copyKeyFor(role: ProposalRole): CopyKey {
  if (role.type === "sponsor-ninong" || role.type === "sponsor-ninang") return "sponsor"
  if (role.id === "flower-girl") return "flowerGirl"
  if (CEREMONY_BEARER_ROLE_IDS.has(role.id)) return "bearer"
  return "party"
}

function isPlayful(key: CopyKey) {
  return key === "bearer" || key === "flowerGirl"
}

/* ── Small pieces ─────────────────────────────────────────────────────────── */

/** Config text with emoji / apostrophes / "&" / "!" in a clean font (display fonts lack them). */
function T({ text, className = "" }: { text: string; className?: string }) {
  return (
    <ProposalMixedText
      text={text}
      className={className}
      specialClassName={`${inter.className} inline-block align-baseline text-[0.95em] leading-none font-normal not-italic tracking-normal`}
    />
  )
}

/** Large corner decorations pinned to the screen corners, behind the card, plus the
 *  invitation's rising pink hearts (section-backdrop.tsx). */
function ProposalPageFrame() {
  const decos = useSiteConfig().proposal.decos
  const corners = [
    { src: decos.topLeft, pos: "tl" },
    { src: decos.topRight, pos: "tr" },
    { src: decos.bottomLeft, pos: "bl" },
    { src: decos.bottomRight, pos: "br" },
  ]
  return (
    <>
      <div className="invite-corners" aria-hidden>
        {corners.map(({ src, pos }) =>
          src ? (
            <div key={pos} className={`invite-corner invite-corner--${pos}`}>
              {/* Corners keep their original artwork colors (no tint) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="invite-corner__img" />
            </div>
          ) : null,
        )}
      </div>
      <SectionBackdrop wash={false} overlay />
    </>
  )
}

function OrnamentalDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`mx-auto flex items-center justify-center gap-2 ${compact ? "max-w-[10rem]" : "max-w-xs sm:max-w-sm"}`}
      aria-hidden
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--invite-line)]" />
      <HeartMark className="h-3 w-3" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--invite-line)]" />
    </div>
  )
}

function DividerLine({ className = "w-16 sm:w-24 md:w-32" }: { className?: string }) {
  return <span className={`block h-px ${className}`} style={dividerLineStyle} aria-hidden />
}

function SmallCaps({
  children,
  className = "",
  color = palette.label,
}: {
  children: ReactNode
  className?: string
  color?: string
}) {
  return (
    <p
      className={`${cinzel.className} text-[0.64rem] font-semibold uppercase leading-relaxed tracking-[0.2em] sm:text-[0.7rem] sm:tracking-[0.24em] ${className}`}
      style={{ color }}
    >
      {children}
    </p>
  )
}

/** "JV & Jemiree" in The Seasons with a script "&". */
function CoupleNamesText({ className = "" }: { className?: string }) {
  const siteConfig = useSiteConfig()
  const groom = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride = siteConfig.couple.brideNickname || siteConfig.couple.bride
  return (
    <p className={`${theSeasons.className} uppercase leading-snug tracking-[0.12em] ${className}`} style={{ color: TITLE }}>
      {groom}
      <span
        className={`${aboveTheBeyond.className} mx-2 inline-block text-[1.25em] normal-case tracking-normal`}
        style={{ color: SCRIPT_GREEN }}
        aria-hidden
      >
        &
      </span>
      <span className="sr-only">and</span>
      {bride}
    </p>
  )
}

function LayeredProposalTitle({ main, script }: { main: string; script: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--welcome-size": welcomeTitleSize.main,
          "--script-size": welcomeTitleSize.script,
          "--script-overlap": welcomeTitleSize.overlap,
        } as CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.92] tracking-[0.05em] min-[400px]:tracking-[0.08em] sm:leading-[0.94] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--welcome-size)", ...goldGradientText }}
      >
        <T text={main} />
      </span>
      {script ? (
        <>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[1]`}
            style={{ marginTop: "var(--script-overlap)", fontSize: "var(--script-size)", color: SCRIPT_GREEN }}
          >
            <T text={script} />
          </span>
          <span className="sr-only">{script}</span>
        </>
      ) : null}
    </h2>
  )
}

const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(5px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: revealEase } },
}

/** Fades and lifts its content in as it scrolls into view (once). Waits until the invitation is open. */
function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: "div" | "p"
}) {
  const revealed = useContext(RevealContext)
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }
  const MotionTag = as === "p" ? motion.p : motion.div
  return (
    <MotionTag
      className={className}
      variants={scrollReveal}
      initial="hidden"
      whileInView={revealed ? "show" : undefined}
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -8% 0px" }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  )
}

function Paragraphs({ lines, className = "" }: { lines: readonly string[]; className?: string }) {
  if (lines.length === 0) return null
  return (
    <div className={`mx-auto max-w-md space-y-3.5 text-pretty sm:space-y-4 ${className}`} style={{ color: palette.body }}>
      {lines.map((line, i) => (
        <Reveal key={i} as="p">
          <T text={line} />
        </Reveal>
      ))}
    </div>
  )
}

/* ── Card shell ───────────────────────────────────────────────────────────── */

/**
 * Arched corner radii that scale with the card: the dome is 30% of the card's width
 * (capped at 15rem), so phones and desktops get the same graceful chapel-window curve.
 * `inset` is how far a frame sits inside the card edge — its radii shrink by the same
 * amount, so every frame traces the outer arch exactly.
 */
function archRadius(inset = "0px"): CSSProperties {
  const dome = `calc(var(--arch-h) - ${inset})`
  const foot = `max(0px, calc(var(--arch-foot) - ${inset}))`
  return {
    borderRadius: `50% 50% ${foot} ${foot} / ${dome} ${dome} ${foot} ${foot}`,
  }
}

function ProposalCard({ children }: { children: ReactNode }) {
  return (
    // Container query: --arch-h follows this card's width (cqi)
    <div
      className="relative mx-auto w-full max-w-2xl [container-type:inline-size] [--arch-foot:1.4rem] [--frame-1:7px] [--frame-2:12px] sm:[--arch-foot:2rem] sm:[--frame-1:16px] sm:[--frame-2:23px]"
      style={{ "--arch-h": "min(30cqi, 15rem)" } as CSSProperties}
    >
      <div
        className="pointer-events-none absolute -inset-2 opacity-70 blur-2xl sm:-inset-4"
        style={{ ...ambientGlowStyle, ...archRadius() }}
        aria-hidden
      />
      <div
        className="relative overflow-hidden border"
        style={{
          ...archRadius(),
          // Slightly see-through paper so the photo strip behind reads softly at the edges
          background: `radial-gradient(90% 30% at 50% 0%, #FFFFFF 0%, transparent 70%), linear-gradient(175deg, rgb(255 255 255 / 96%) 0%, color-mix(in srgb, ${IVORY} 94%, transparent) 55%, color-mix(in srgb, ${INNER_SURFACE} 94%, transparent) 100%)`,
          borderColor: "color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
          boxShadow: "0 30px 70px -36px var(--invite-shadow), inset 0 1px 0 rgb(255 255 255 / 85%)",
        }}
      >
        {/* Double hairline frame following the arch, a heart at the top and bottom */}
        <div
          className="pointer-events-none absolute inset-[var(--frame-1)]"
          style={{ ...archRadius("var(--frame-1)"), border: `1px solid ${GOLD_BORDER_SOFT}` }}
          aria-hidden
        >
          <span className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-0.5">
            <HeartMark className="h-3 w-3" />
          </span>
          <span className="absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 rounded-full bg-white p-0.5">
            <HeartMark className="h-3 w-3" />
          </span>
        </div>
        <div
          className="pointer-events-none absolute inset-[var(--frame-2)]"
          style={{
            ...archRadius("var(--frame-2)"),
            border: "1px solid color-mix(in srgb, var(--color-motif-medium) 40%, transparent)",
          }}
          aria-hidden
        />

        {/* Top padding clears the dome: a little more than a third of its height */}
        <div
          className="relative z-20 px-4 pb-10 text-center min-[400px]:px-5 sm:px-14 sm:pb-16 md:px-16"
          style={{ paddingTop: "max(2.75rem, calc(var(--arch-h) * 0.42))" }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/** Script-free sign-off for the after-answer cards: small caps line + couple names. */
function SignOff({ line }: { line: string }) {
  if (!line) return null
  return (
    <div className="text-center">
      <SmallCaps color={palette.bodySoft}>
        <T text={line} />
      </SmallCaps>
      <CoupleNamesText className="mt-1 text-base" />
    </div>
  )
}

/** Small dusty-rose heart (dividers, card frame). */
function HeartMark({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="var(--color-motif-accent)" aria-hidden>
      <path d={HEART_PATH} />
    </svg>
  )
}

/** Big Seasons capitals under a small-caps eyebrow ("A Personal Invitation" / "From Our Hearts to Yours"). */
function DirectTitle({ eyebrow, title, as = "h2" }: { eyebrow: string; title: string; as?: "h1" | "h2" }) {
  const Tag = as
  return (
    <div>
      {eyebrow ? (
        <SmallCaps className="tracking-[0.32em] sm:tracking-[0.38em]">
          <T text={eyebrow} />
        </SmallCaps>
      ) : null}
      {title ? (
        <Tag
          className={`${theSeasons.className} mt-1.5 text-[clamp(1.3rem,6vw,2.05rem)] uppercase leading-[1.08] tracking-[0.06em] [overflow-wrap:anywhere] sm:tracking-[0.1em]`}
          style={{ color: TITLE }}
        >
          <T text={title} />
        </Tag>
      ) : null}
    </div>
  )
}

/**
 * The invitation, asked directly (no long letter): eyebrow + title → role illustration →
 * "A Special Place / In Our Wedding" → "Dear {name}," → "Will you be our {role}?" →
 * one short note → script sign-off → Yes / No.
 */
function ProposalDirectAsk({
  copyKey,
  role,
  inviteeName,
  submitting,
  onYes,
  onNo,
  fill,
  bodyClass,
}: {
  copyKey: CopyKey
  role: ProposalRole
  inviteeName: string
  submitting?: boolean
  onYes: () => void
  onNo: () => void
  fill: (text: string) => string
  bodyClass: string
}) {
  const siteConfig = useSiteConfig()
  const revealed = useContext(RevealContext)
  const reduceMotion = useReducedMotion()
  const copy = siteConfig.proposal.copy[copyKey]
  const { labels, ornament, coupleImage } = siteConfig.proposal
  const roleMessages: Record<string, string> =
    siteConfig.proposal.roleMessages ?? defaultSiteConfig.proposal.roleMessages ?? {}

  const groom = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const dateStr = siteConfig.ceremony.date ?? siteConfig.wedding.date ?? defaultSiteConfig.ceremony.date
  const venueName = siteConfig.ceremony.location ?? defaultSiteConfig.ceremony.location
  const detailsLine = [dateStr, venueName].filter(Boolean).join(" · ")
  const greetingName = inviteeName.trim() || "Friend"
  // Personal note for this role (site.ts → proposal.roleMessages), else the type's askNote
  const noteSource = roleMessages[role.id] || copy.askNote || ""
  const note = noteSource ? fill(noteSource) : ""

  return (
    <motion.div
      className="mx-auto w-full max-w-lg text-center"
      variants={headerStagger}
      initial={reduceMotion ? false : "hidden"}
      animate={revealed ? "show" : "hidden"}
    >
      {ornament ? (
        <motion.div variants={headerItem}>
          <TintedDeco src={ornament} className="mx-auto mb-3 block h-auto w-20 select-none sm:mb-4 sm:w-28" />
        </motion.div>
      ) : null}

      <motion.div variants={headerItem}>
        <DirectTitle as="h1" eyebrow={labels.headerEyebrow} title={fill(labels.headline ?? "")} />
      </motion.div>

      {/* Wedding party illustration (site.ts → proposal.coupleImage) — shown as is, no frame */}
      {coupleImage ? (
        <motion.div variants={headerItem} className="relative -mx-2 mt-4 sm:mx-0 sm:mt-6">
          <Image
            src={encodeURI(coupleImage)}
            alt="Our wedding party"
            width={1536}
            height={1024}
            sizes="(max-width: 640px) 92vw, 512px"
            className="block h-auto w-full select-none"
            draggable={false}
            priority
          />
        </motion.div>
      ) : null}

      <motion.div variants={headerItem} className="mt-6 sm:mt-7">
        <DirectTitle eyebrow={labels.placeEyebrow ?? ""} title={fill(labels.placeTitle ?? "")} />
        {detailsLine ? (
          <SmallCaps className="mt-2 text-[0.58rem] tracking-[0.22em] sm:text-[0.64rem]" color={palette.bodySoft}>
            <T text={detailsLine} />
          </SmallCaps>
        ) : null}
      </motion.div>

      <motion.div variants={headerItem} className="mt-5 sm:mt-6">
        <OrnamentalDivider compact />
      </motion.div>

      <motion.p
        variants={headerItem}
        className={`${aboveTheBeyond.className} mt-4 text-[clamp(1.6rem,7.4vw,2.35rem)] leading-[1.15] [overflow-wrap:anywhere]`}
        style={{ color: SCRIPT_GREEN }}
      >
        <T text={`${fill(copy.greeting)} ${greetingName},`} />
      </motion.p>

      <motion.h2
        variants={headerItem}
        className={`${theSeasons.className} mx-auto mt-2 max-w-md text-[clamp(1.15rem,5.2vw,1.6rem)] leading-snug tracking-[0.03em] [overflow-wrap:anywhere]`}
        style={{ color: INK }}
      >
        <T text={`${labels.askQuestion} `} />
        <span className="capitalize" style={{ color: "var(--color-welcome-heading)" }}>
          <T text={`${role.title}?`} />
        </span>
      </motion.h2>

      {note ? (
        <motion.p variants={headerItem} className={`mx-auto mt-4 max-w-md text-pretty ${bodyClass}`} style={{ color: palette.body }}>
          <T text={note} />
        </motion.p>
      ) : null}

      {/* Sign-off: the line in Goudy italic, the couple's names kept in script */}
      <motion.div variants={headerItem} className="mt-5 sm:mt-6">
        {copy.signOff ? (
          <p className="font-goudy-italic text-[0.95rem] leading-snug sm:text-[1.05rem]" style={{ color: palette.body }}>
            <T text={fill(copy.signOff)} />
          </p>
        ) : null}
        <p
          className={`${aboveTheBeyond.className} mt-0.5 text-[clamp(1.5rem,6.6vw,2.1rem)] leading-[1.2]`}
          style={{ color: SCRIPT_GREEN }}
        >
          <T text={`${groom} & ${bride}`} />
        </p>
      </motion.div>

      <motion.div variants={headerItem} className="mx-auto mt-7 flex w-full max-w-sm flex-col gap-3 sm:mt-8">
        <button type="button" disabled={submitting} onClick={onYes} className={primaryBtnClass} style={primaryBtnStyle}>
          {submitting ? labels.saving : <T text={fill(copy.yesButton)} />}
        </button>
        <button type="button" disabled={submitting} onClick={onNo} className={secondaryBtnClass} style={secondaryBtnStyle}>
          <T text={fill(copy.noButton)} />
        </button>
      </motion.div>
    </motion.div>
  )
}

/** Header for the after-answer cards (icon + layered title + subheader). */
function FlowHeader({
  icon,
  title,
  script,
  subheader,
  animated = false,
}: {
  icon: ReactNode
  title: string
  script: string
  subheader: string
  animated?: boolean
}) {
  const iconNode = (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full border"
      style={{
        borderColor: GOLD_BORDER,
        background: INNER_SURFACE,
        boxShadow: `0 0 0 5px ${IVORY}, 0 0 0 6px ${GOLD_BORDER_SOFT}, 0 14px 28px -14px var(--invite-shadow)`,
      }}
    >
      {icon}
    </div>
  )
  return (
    <div className="mb-6">
      <div className="mb-6 flex justify-center">
        {animated ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.6 }}>
            {iconNode}
          </motion.div>
        ) : (
          iconNode
        )}
      </div>
      <LayeredProposalTitle main={title} script={script} />
      {subheader ? (
        <SmallCaps className="mx-auto mt-5 max-w-md">
          <T text={subheader} />
        </SmallCaps>
      ) : null}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

type ProposalFlowState = "question" | "yes_details" | "yes_submitted" | "no_clicked" | "no_submitted"

interface ProposalPageProps {
  role: ProposalRole
}

function ProposalPageInner({ role }: ProposalPageProps) {
  const searchParams = useSearchParams()
  const inviteeFromLink = useMemo(() => parseInviteeNameFromSearchParams(searchParams), [searchParams])

  const [flowState, setFlowState] = useState<ProposalFlowState>("question")
  const [preferredName, setPreferredName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [showInvitation, setShowInvitation] = useState(false)
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(true)
  const [heroEnterFromLoading, setHeroEnterFromLoading] = useState(false)
  const [proposalVisible, setProposalVisible] = useState(false)
  const [enteringFromInvite, setEnteringFromInvite] = useState(false)

  const handleLoadingFadeStart = useCallback(() => {
    setShowInvitation(true)
    setHeroEnterFromLoading(true)
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setLoadingOverlayVisible(false)
  }, [])

  const handleTransitionStart = useCallback(() => {
    setEnteringFromInvite(true)
    setProposalVisible(true)
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  const handleOpenInvitation = useCallback(() => {
    setShowInvitation(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
    window.setTimeout(() => setEnteringFromInvite(false), CINEMATIC_ENTRY_MS)
  }, [])

  const pageScrollLocked = loadingOverlayVisible || showInvitation
  const cinematicEntry = enteringFromInvite && proposalVisible

  useEffect(() => {
    if (inviteeFromLink) {
      setPreferredName(inviteeFromLink)
    }
  }, [inviteeFromLink])

  const siteConfig = useSiteConfig()
  const { labels } = siteConfig.proposal
  // Background: the same photo strip as the loader / envelope (shared clock, so it carries on seamlessly)
  const loaderContent = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const bgPhotos = useMemo(() => (loaderContent.backgroundPhotos ?? []).map((src) => encodeURI(src)), [loaderContent.backgroundPhotos])
  const bgPhotosDesktop = useMemo(
    () => (loaderContent.backgroundPhotosDesktop ?? []).map((src) => encodeURI(src)),
    [loaderContent.backgroundPhotosDesktop],
  )
  const copyKey = copyKeyFor(role)
  const copy = siteConfig.proposal.copy[copyKey]
  const confirmedDisplayName = (inviteeFromLink || preferredName).trim()

  const groom = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const fill = (text: string) =>
    text
      .split("{name}").join(confirmedDisplayName || "Friend")
      .split("{role}").join(role.title)
      .split("{groom}").join(groom)
      .split("{bride}").join(bride)

  // Playful roles (bearers, flower girl) read in Playfair; the rest in Goudy italic
  const bodyClass = isPlayful(copyKey)
    ? `${playfair.className} text-[0.95rem] font-medium leading-[1.7] sm:text-base`
    : `font-goudy-italic text-[0.98rem] sm:text-[1.05rem] ${sectionType.textRelaxed}`

  const submitResponse = async (status: "Confirmed" | "Declined", name: string) => {
    const response = await fetch("/api/proposal-responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: role.id,
        name,
        status,
        submittedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to submit response")
    }

    window.dispatchEvent(new Event("entourageUpdated"))
  }

  const handleYesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preferredName.trim()) {
      setValidationError(labels.nameForm.required)
      return
    }
    setValidationError("")
    setSubmitting(true)

    try {
      await submitResponse("Confirmed", preferredName.trim())
      setFlowState("yes_submitted")
    } catch (err) {
      console.error("Failed to submit confirmation:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNoSubmit = async () => {
    setSubmitting(true)
    setValidationError("")
    try {
      const declineLabel = confirmedDisplayName ? `${confirmedDisplayName} (declined)` : "Declined Entourage Offer"
      await submitResponse("Declined", declineLabel)
      setFlowState("no_submitted")
    } catch (err) {
      console.error("Failed to submit decline:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleYesClick = async () => {
    const name = (inviteeFromLink || preferredName).trim()
    if (!name) {
      setFlowState("yes_details")
      return
    }
    setPreferredName(name)
    setValidationError("")
    setSubmitting(true)
    try {
      await submitResponse("Confirmed", name)
      setFlowState("yes_submitted")
    } catch (err) {
      console.error("Failed to submit confirmation:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const goTo = (state: ProposalFlowState) => {
    setValidationError("")
    setFlowState(state)
  }

  const errorLine = validationError ? (
    <p className="mt-4 text-center text-sm font-medium" style={{ color: TITLE }} role="alert">
      <T text={validationError} />
    </p>
  ) : null

  const cardMotion = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  }

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative min-h-[100dvh] select-none px-2.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-16 md:py-20 ${pageScrollLocked ? "overflow-hidden" : "overflow-x-hidden"}`}
      style={{ background: sectionBackground, color: CREAM }}
    >
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <PhotoBackground photos={bgPhotos} desktopPhotos={bgPhotosDesktop} />
      </div>

      {loadingOverlayVisible && (
        <div className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--loading" aria-hidden="true">
          <InvitePhotoBackdrop />
        </div>
      )}

      {loadingOverlayVisible && (
        <LoadingScreen onFadeStart={handleLoadingFadeStart} onComplete={handleLoadingComplete} />
      )}

      {(loadingOverlayVisible || showInvitation) && (
        <InvitationHero
          onOpen={handleOpenInvitation}
          onTransitionStart={handleTransitionStart}
          enterFromLoading={heroEnterFromLoading}
          visible={showInvitation}
        />
      )}

      {cinematicEntry && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[28] bg-[var(--invite-page-bg)]"
          aria-hidden="true"
          initial={{ clipPath: "circle(0% at 50% 46%)", opacity: 0.98 }}
          animate={{ clipPath: "circle(145% at 50% 46%)", opacity: 0 }}
          transition={{ duration: 1.55, delay: 0.12, ease: proposalEntryEase }}
        />
      )}

      {proposalVisible && <ProposalPageFrame />}

      <RevealContext.Provider value={proposalVisible}>
      <motion.div
        initial={false}
        animate={proposalVisible ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 40, filter: "blur(8px)" }}
        transition={cinematicEntry ? { duration: 1.08, ease: proposalEntryEase, delay: 0.86 } : { duration: 0.01 }}
        // Centered on every screen: fills the viewport height (minus the page padding) and
        // centers the card; taller cards simply grow and scroll from the top, never clipped
        className={`relative z-10 mx-auto flex min-h-[calc(100dvh-max(1rem,env(safe-area-inset-top))-max(1.5rem,env(safe-area-inset-bottom)))] w-full max-w-3xl flex-col items-center justify-center py-3 sm:min-h-[calc(100dvh-8rem)] sm:py-0 ${proposalVisible ? "" : "pointer-events-none"}`}
        style={{ color: palette.body }}
      >
        <AnimatePresence mode="wait">
          {flowState === "question" && (
            <motion.div key="question" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <ProposalDirectAsk
                  copyKey={copyKey}
                  role={role}
                  inviteeName={inviteeFromLink || preferredName}
                  submitting={submitting}
                  onYes={() => void handleYesClick()}
                  onNo={() => goTo("no_clicked")}
                  fill={fill}
                  bodyClass={bodyClass}
                />
                {errorLine}
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "yes_details" && (
            <motion.form key="yes-form" onSubmit={handleYesSubmit} className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<Check className="h-6 w-6" style={{ color: INK }} />}
                  title={fill(labels.nameForm.title)}
                  script={fill(labels.nameForm.script)}
                  subheader={fill(labels.nameForm.subheader)}
                />
                <Paragraphs lines={[fill(labels.nameForm.body)]} className={bodyClass} />

                <div className="mx-auto mt-6 max-w-md text-left">
                  <label htmlFor="preferred-name" className="mb-2 block">
                    <SmallCaps>
                      <T text={labels.nameForm.label} /> <span style={{ color: "var(--color-welcome-heading)" }}>*</span>
                    </SmallCaps>
                  </label>
                  <input
                    id="preferred-name"
                    type="text"
                    required
                    placeholder={labels.nameForm.placeholder}
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    // 16px text on phones so iOS doesn't zoom in while typing
                    className="font-goudy-italic w-full select-text rounded-full px-5 py-3 text-base transition-all focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-motif-medium)_45%,transparent)] placeholder:text-[color-mix(in_srgb,var(--color-welcome-text)_55%,white)] focus:border-[var(--color-welcome-heading)]"
                    style={{
                      color: INK,
                      backgroundColor: IVORY,
                      border: `1px solid ${GOLD_BORDER}`,
                      boxShadow: "inset 0 1px 2px color-mix(in srgb, var(--invite-ink) 6%, transparent)",
                    }}
                  />
                </div>
                {errorLine}

                <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={submitting} className={primaryBtnClass} style={primaryBtnStyle}>
                    {submitting ? labels.saving : <T text={labels.nameForm.submit} />}
                  </button>
                  <button type="button" onClick={() => goTo("question")} className={secondaryBtnClass} style={secondaryBtnStyle}>
                    <T text={labels.nameForm.cancel} />
                  </button>
                </div>
              </ProposalCard>
            </motion.form>
          )}

          {flowState === "yes_submitted" && (
            <motion.div key="yes-success" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  animated
                  icon={<Sparkles className="h-7 w-7" style={{ color: CHAMPAGNE }} />}
                  title={fill(copy.yes.title)}
                  script={fill(copy.yes.script)}
                  subheader={fill(copy.yes.subheader)}
                />

                <div
                  className="mx-auto mb-7 max-w-sm rounded-[1.4rem] border px-5 py-4"
                  style={{ borderColor: GOLD_BORDER_SOFT, backgroundColor: INNER_SURFACE }}
                >
                  {confirmedDisplayName && !isPlayful(copyKey) ? (
                    <>
                      <SmallCaps className="text-[0.58rem] sm:text-[0.62rem]">
                        <T text={labels.registeredName} />
                      </SmallCaps>
                      <p className={`${theSeasons.className} mt-1 text-lg tracking-wide [overflow-wrap:anywhere]`} style={{ color: INK }}>
                        <T text={confirmedDisplayName} />
                      </p>
                    </>
                  ) : null}
                  <SmallCaps className="mt-1.5" color={palette.bodySoft}>
                    <T text={fill(copy.yes.roleLine)} />
                  </SmallCaps>
                </div>

                <Paragraphs lines={copy.yes.body.map(fill)} className={bodyClass} />

                <div className="mt-9 space-y-6">
                  <SignOff line={fill(copy.yes.signOff)} />
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <Link href="/" className={`${primaryBtnClass} mx-auto max-w-sm`} style={primaryBtnStyle}>
                    <T text={labels.returnButton} />
                  </Link>
                </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "no_clicked" && (
            <motion.div key="no-confirm" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<X className="h-6 w-6" style={{ color: CHAMPAGNE }} />}
                  title={fill(copy.no.title)}
                  script={fill(copy.no.script)}
                  subheader={fill(copy.no.subheader)}
                />
                <Paragraphs lines={copy.no.body.map(fill)} className={bodyClass} />
                {errorLine}
                <div className="mt-9 space-y-6">
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void handleNoSubmit()}
                      disabled={submitting}
                      className={primaryBtnClass}
                      style={primaryBtnStyle}
                    >
                      {submitting ? labels.sending : <T text={labels.sendButton} />}
                    </button>
                    <button type="button" onClick={() => goTo("question")} className={secondaryBtnClass} style={secondaryBtnStyle}>
                      <T text={labels.goBack} />
                    </button>
                  </div>
                </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "no_submitted" && (
            <motion.div key="no-sent" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<Heart className="h-6 w-6" style={{ color: CHAMPAGNE }} />}
                  title={fill(copy.sent.title)}
                  script={fill(copy.sent.script)}
                  subheader={fill(copy.sent.subheader)}
                />
                <Paragraphs lines={copy.sent.body.map(fill)} className={bodyClass} />
                <div className="mt-9 space-y-6">
                  <SignOff line={fill(copy.sent.signOff)} />
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <Link href="/" className={`${secondaryBtnClass} mx-auto max-w-sm`} style={secondaryBtnStyle}>
                    <T text={labels.returnButton} />
                  </Link>
                </div>
              </ProposalCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </RevealContext.Provider>
    </div>
  )
}

export function ProposalPage(props: ProposalPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-6" style={{ background: sectionBackground, color: CREAM }}>
          <p className={`${cinzel.className} text-sm uppercase tracking-[0.2em]`}>Loading invitation…</p>
        </div>
      }
    >
      <ProposalPageInner {...props} />
    </Suspense>
  )
}
