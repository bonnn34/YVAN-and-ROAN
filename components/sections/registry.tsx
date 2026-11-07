"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { Download, Expand, Gift, Heart, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"


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

// Text outside the card sits on the dusty-blue page backdrop: white with a soft navy shadow
const onBg = {
  color: "white",
  textShadow:
    "0 1px 2px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent), 0 2px 14px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent)",
} as const
const onBgScript = { ...onBg, color: "var(--color-motif-silver)" } as const

const onBgLine = "color-mix(in srgb, white 85%, transparent)"

const ct = {
  body: sectionType.text,
  bodyLg: sectionType.textRelaxed,
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const staggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

// Sits outside the card, so drawn in white
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${onBgLine})` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${onBgLine})` }} />
    </div>
  )
}

function RegistryTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as CSSProperties
      }
    >
      <span className="sr-only">
        {title} — {subtitle}
      </span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{ fontSize: "var(--script-size)", ...onBgScript }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

export function Registry() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.registry
  const c = content.colors // siteConfig.registry.colors (content/site.ts)
  const { brideNickname, groomNickname } = siteConfig.couple
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : "hidden"

  const buttonBg = c.button
  const buttonText = "#FFFFFF"
  const cardStyle = {
    background: c.card,
    border: `1px solid ${c.cardEdge}`,
    boxShadow: `0 0 0 6px rgb(255 255 255 / 30%), 0 26px 56px -30px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)`,
  }
  const dividerLineStyle = { background: `linear-gradient(to right, transparent, ${onBgLine}, transparent)` }

  // Enlarged QR (tap the QR to open; Esc / backdrop / X closes)
  const [zoomQr, setZoomQr] = useState<{ src: string; label: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!zoomQr) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomQr(null)
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [zoomQr])
  const qrFileName = (label: string, src: string) =>
    `${label.replace(/[^a-z0-9]+/gi, "-")}-QR${src.slice(src.lastIndexOf(".")) || ".png"}`

  const accounts = content.showAccounts
    ? content.accounts.filter((a) => a.show && (a.accountNumber || a.qr))
    : []
  // Which account the toggle shows
  const [activeTab, setActiveTab] = useState(0)
  const activeIndex = Math.min(activeTab, Math.max(0, accounts.length - 1))
  const active = accounts[activeIndex]

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
    >
      <section
        id="registry"
        className="relative z-10 overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/registry sm:mb-10 sm:px-4 md:mb-12"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={onBg}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <RegistryTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${ct.bodyLg}`}
            style={{ ...onBg, fontWeight: 600 }}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span className="h-px w-16 sm:w-24 md:w-32" style={dividerLineStyle} />
          </div>
        </motion.div>

        <div className="relative z-20 mx-auto max-w-2xl px-4 sm:px-6 md:px-8">
          {/* Letter card */}
          <motion.div
            className="relative mt-8 rounded-[1.75rem] px-7 pb-10 pt-12 text-center sm:mt-10 sm:rounded-[2.25rem] sm:px-12 sm:pb-12 sm:pt-14 md:px-14"
            style={cardStyle}
            variants={staggerVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            {/* Seal sitting on the top edge */}
            <motion.div variants={itemVariants} className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: buttonBg,
                  boxShadow: `0 0 0 5px ${c.card}, 0 0 0 6px ${c.cardEdge}, 0 16px 30px -12px color-mix(in srgb, ${c.title} 55%, transparent)`,
                }}
                aria-hidden
              >
                <Gift className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: buttonText }} />
              </span>
            </motion.div>

            <div className={`font-goudy-italic relative mx-auto max-w-xl space-y-4 ${ct.bodyLg} leading-relaxed`} style={{ color: c.body }}>
              {content.paragraphs.map((text, i) => (
                <motion.p key={i} variants={itemVariants} className={i === 0 ? "text-left sm:text-center" : ""}>
                  {i === 0 && text.length > 1 ? (
                    <>
                      {/* Drop cap on the first paragraph */}
                      <span
                        className={`${theSeasons.className} float-left mr-2 mt-1 text-[2.6rem] leading-[0.8] sm:float-none sm:mr-1 sm:inline sm:text-[2.2rem] sm:leading-none`}
                        style={{ color: c.script }}
                        aria-hidden
                      >
                        {text.charAt(0)}
                      </span>
                      <span className="sr-only">{text.charAt(0)}</span>
                      {text.slice(1)}
                    </>
                  ) : (
                    text
                  )}
                </motion.p>
              ))}
            </div>

            {/* E-gift accounts — toggle between them; tap the QR to enlarge, Save QR to download */}
            {active && (
              <motion.div variants={itemVariants} className="relative mt-8 sm:mt-9">
                <div className="flex items-center justify-center gap-2" aria-hidden>
                  <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to right, transparent, ${c.line})` }} />
                  <span className="h-1 w-1 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
                  <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to left, transparent, ${c.line})` }} />
                </div>
                <p
                  className={`${cinzel.className} mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] sm:text-xs`}
                  style={{ color: c.eyebrow }}
                >
                  {content.accountsTitle}
                </p>
                {content.accountsNote ? (
                  <p className="font-goudy-italic mt-1 text-[0.75rem] sm:text-sm" style={{ color: c.soft }}>
                    {content.accountsNote}
                  </p>
                ) : null}

                {/* Toggle: one equal-width segment per account */}
                {accounts.length > 1 && (
                  <div
                    role="tablist"
                    aria-label={content.accountsTitle}
                    className="mx-auto mt-4 grid w-full max-w-[17rem] gap-1 rounded-full p-1"
                    style={{
                      gridTemplateColumns: `repeat(${accounts.length}, minmax(0, 1fr))`,
                      background: "#FFFFFF",
                      boxShadow: `inset 0 0 0 1px ${c.cardEdge}, 0 6px 16px -10px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent)`,
                    }}
                  >
                    {accounts.map((account, i) => {
                      const selected = i === activeIndex
                      return (
                        <button
                          key={`${account.label}-${i}`}
                          type="button"
                          role="tab"
                          id={`registry-tab-${i}`}
                          aria-selected={selected}
                          aria-controls="registry-tabpanel"
                          onClick={() => setActiveTab(i)}
                          className={`${cinzel.className} relative rounded-full py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:text-[0.74rem]`}
                          style={{ color: selected ? buttonText : c.title }}
                        >
                          {selected && (
                            <motion.span
                              layoutId="registry-tab-pill"
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: buttonBg,
                                boxShadow: "0 6px 14px -8px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
                              }}
                              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                              aria-hidden
                            />
                          )}
                          <span className="relative">{account.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div
                  id="registry-tabpanel"
                  role={accounts.length > 1 ? "tabpanel" : undefined}
                  aria-labelledby={accounts.length > 1 ? `registry-tab-${activeIndex}` : undefined}
                  className="mx-auto mt-4 max-w-[17.5rem]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeIndex}
                      initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.28, ease }}
                      className="relative flex flex-col items-center overflow-hidden rounded-[1.4rem] px-5 pb-5 pt-4"
                      style={{
                        background: c.accountCard,
                        border: `1px solid ${c.cardEdge}`,
                        boxShadow: `0 18px 34px -22px color-mix(in srgb, ${c.title} 45%, transparent)`,
                      }}
                    >
                      {/* Inner sage frame */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-1.5 rounded-[1.1rem] border"
                        style={{ borderColor: `color-mix(in srgb, ${c.line} 45%, transparent)` }}
                      />
                      <p className={`${theSeasons.className} relative mb-3 text-lg uppercase tracking-[0.14em]`} style={{ color: c.title }}>
                        {active.label}
                      </p>
                      {active.qr ? (
                        <button
                          type="button"
                          onClick={() => setZoomQr({ src: active.qr, label: active.label })}
                          className="group relative block w-full max-w-[13rem] rounded-2xl bg-white p-2 transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)]"
                          style={{ boxShadow: `0 0 0 1px ${c.cardEdge}, 0 0 0 6px color-mix(in srgb, var(--color-motif-medium) 14%, transparent), 0 14px 26px -16px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)` }}
                          aria-label={`Enlarge ${active.label} QR code`}
                        >
                          {/* Sized by its own width (square) — a % height inside a <button> can collapse to 0 */}
                          <Image
                            src={encodeURI(active.qr)}
                            alt={`${active.label} QR code`}
                            width={416}
                            height={416}
                            unoptimized
                            className="block aspect-square h-auto w-full object-contain"
                          />
                          <span
                            className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md"
                            style={{ background: buttonBg, boxShadow: "0 0 0 2px #FFFFFF" }}
                            aria-hidden
                          >
                            <Expand className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      ) : (
                        <span
                          className={`${theSeasons.className} flex h-14 w-14 items-center justify-center rounded-full text-xl`}
                          style={{ background: `color-mix(in srgb, ${c.glow} 80%, transparent)`, color: c.title }}
                          aria-hidden
                        >
                          {active.label.charAt(0)}
                        </span>
                      )}
                      {active.accountName ? (
                        <p className="font-goudy-italic relative mt-4 text-sm" style={{ color: c.body }}>
                          {active.accountName}
                        </p>
                      ) : null}
                      {active.accountNumber ? (
                        <p
                          className={`${cinzel.className} relative mt-0.5 text-[0.82rem] font-semibold tabular-nums tracking-[0.14em]`}
                          style={{ color: c.title }}
                        >
                          {active.accountNumber}
                        </p>
                      ) : null}
                      {active.qr ? (
                        <a
                          href={active.qr}
                          download={qrFileName(active.label, active.qr)}
                          className={`${cinzel.className} relative mt-3.5 inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.03] hover:brightness-110`}
                          style={{ background: buttonBg, color: buttonText, borderColor: "rgb(255 255 255 / 70%)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 22%, transparent)" }}
                        >
                          <Download className="h-3 w-3" aria-hidden />
                          {content.saveQrLabel}
                        </a>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            <div className="h-6 sm:h-7" aria-hidden />

            {/* Sign-off */}
            <motion.div variants={itemVariants} className="relative space-y-1.5">
              {content.thankYou ? (
                <p className={`font-goudy-italic ${ct.body}`} style={{ color: c.body }}>
                  {content.thankYou}
                </p>
              ) : null}
              <p className={`font-goudy-italic ${ct.body}`} style={{ color: c.soft }}>
                {content.signOff}
              </p>
              {/* Couple signature: names in script, "&" in an italic serif, sage hairlines either side */}
              {(() => {
                const signature = (content.signature || "{groom} & {bride}")
                  .split("{groom}").join(groomNickname)
                  .split("{bride}").join(brideNickname)
                const [first, ...rest] = signature.split("&")
                const second = rest.join("&")
                return (
                  <div className="flex items-center justify-center gap-2.5 pt-2 sm:gap-3.5">
                    <span className="h-px w-8 shrink-0 sm:w-14" style={{ background: `linear-gradient(to right, transparent, ${c.line})` }} aria-hidden />
                    <p
                      className={`${aboveTheBeyond.className} flex items-baseline gap-2 text-[1.9rem] leading-none sm:text-[2.4rem]`}
                      style={{ color: c.script }}
                      aria-label={signature}
                    >
                      <span aria-hidden>{first.trim()}</span>
                      {second ? (
                        <>
                          <span
                            aria-hidden
                            className="font-goudy-italic text-[0.62em] italic"
                            style={{ color: c.line }}
                          >
                            &amp;
                          </span>
                          <span aria-hidden>{second.trim()}</span>
                        </>
                      ) : null}
                    </p>
                    <span className="h-px w-8 shrink-0 sm:w-14" style={{ background: `linear-gradient(to left, transparent, ${c.line})` }} aria-hidden />
                  </div>
                )
              })()}
              <Heart className="mx-auto mt-3 h-3.5 w-3.5" style={{ color: "var(--color-motif-accent)", fill: "var(--color-motif-accent)" }} aria-hidden />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {mounted && zoomQr && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-5 backdrop-blur-md animate-in fade-in duration-200"
          style={{ background: "color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)" }}
          role="dialog"
          aria-modal="true"
          aria-label={`${zoomQr.label} QR code`}
          onClick={() => setZoomQr(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-[1.75rem] p-5 text-center sm:p-6"
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomQr(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform hover:rotate-90"
              style={{ background: buttonBg }}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <p className={`${theSeasons.className} mb-3 text-lg uppercase tracking-[0.12em]`} style={{ color: c.title }}>
              {zoomQr.label}
            </p>
            <div className="relative mx-auto w-full max-w-[18rem] overflow-hidden rounded-xl bg-white p-2" style={{ boxShadow: `0 0 0 1px ${c.glow}` }}>
              <Image
                src={encodeURI(zoomQr.src)}
                alt={`${zoomQr.label} QR code`}
                width={576}
                height={576}
                unoptimized
                className="block aspect-square h-auto w-full object-contain"
              />
            </div>
            <p className="font-goudy-italic mt-3 text-sm" style={{ color: c.body }}>
              {content.zoomNote}
            </p>
            <a
              href={zoomQr.src}
              download={qrFileName(zoomQr.label, zoomQr.src)}
              className={`${cinzel.className} mt-4 inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.03] hover:brightness-110`}
              style={{ background: buttonBg, color: buttonText, borderColor: "rgb(255 255 255 / 70%)" }}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {content.saveQrLabel}
            </a>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
