"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { Download, ExternalLink } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { useQrColors } from "@/hooks/use-css-color"
import { getTableFinderUrl, TABLE_FINDER_PATH } from "@/lib/table-finder"


const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
})

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
})

const aboveTheBeyond = localFont({
  src: "../Font/above-the-beyond-script.otf",
  display: "swap",
})

const IVORY = "var(--color-motif-soft)"
const GOLD = "var(--color-welcome-gold)"
const NAVY = "var(--color-welcome-navy)"
const SCRIPT = "var(--color-welcome-green)"
const BODY = "var(--color-welcome-text)"
const SOFT = "var(--color-welcome-text-soft)"
const BUTTON = "var(--color-dash-primary)"
const GOLD_BORDER = "color-mix(in srgb, var(--color-welcome-gold) 38%, transparent)"
const GOLD_BORDER_SOFT = "color-mix(in srgb, var(--color-welcome-gold) 22%, transparent)"
const HAIRLINE = "color-mix(in srgb, var(--color-welcome-gold) 65%, transparent)"

const PRINT_QR_ID = "table-finder-qr-print"
const DISPLAY_QR_ID = "table-finder-qr"

// Display fonts (The Seasons, script) have no clean glyphs for symbols / digits —
// render only those characters (e.g. "&", "'", "-", numbers) in another font.
function SpecialCharFont({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${className} tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-2 sm:justify-start" aria-hidden>
      <span className="h-px w-10 sm:w-14" style={{ background: HAIRLINE }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: GOLD }} />
      <span className="h-px w-10 sm:w-14" style={{ background: HAIRLINE }} />
    </div>
  )
}

function CornerTicks() {
  const tick = "absolute h-3.5 w-3.5"
  return (
    <>
      <span className={`${tick} left-2.5 top-2.5 border-l-2 border-t-2`} style={{ borderColor: GOLD }} aria-hidden />
      <span className={`${tick} right-2.5 top-2.5 border-r-2 border-t-2`} style={{ borderColor: GOLD }} aria-hidden />
      <span className={`${tick} bottom-2.5 left-2.5 border-b-2 border-l-2`} style={{ borderColor: GOLD }} aria-hidden />
      <span className={`${tick} bottom-2.5 right-2.5 border-b-2 border-r-2`} style={{ borderColor: GOLD }} aria-hidden />
    </>
  )
}

export function TableFinderQrCard() {
  const siteConfig = useSiteConfig()
  const card = siteConfig.tableFinder.qrCard
  const [tableUrl, setTableUrl] = useState("")
  // QR colors come from --color-qr-fg / --color-qr-bg in globals.css
  const { fg: qrFg, bg: qrBg } = useQrColors()

  const groomName = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const brideName = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const coupleLine = `${groomName} & ${brideName}`
  const fill = (text: string) => text.split("{couple}").join(coupleLine)
  const fileSlug = `${groomName}-${brideName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  useEffect(() => {
    setTableUrl(getTableFinderUrl())
  }, [])

  const downloadQr = () => {
    const canvas =
      (document.getElementById(PRINT_QR_ID) as HTMLCanvasElement | null) ??
      (document.getElementById(DISPLAY_QR_ID) as HTMLCanvasElement | null)
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${fileSlug || "wedding"}-find-your-table-qr.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  // Couple names set in type, matching the loading screen: nickname · "and" · nickname
  const coupleNames: ReactNode = (
    <h2
      className="invite-names sm:items-start sm:text-left"
      aria-label={coupleLine}
    >
      <span
        className={`${theSeasons.className} invite-names__nick text-[2.1rem] sm:text-[2.4rem]`}
        aria-hidden
      >
        {groomName}
      </span>
      <span
        className={`${aboveTheBeyond.className} invite-names__and text-[1.3rem] sm:pl-[1.4em] sm:text-[1.45rem]`}
        aria-hidden
      >
        and
      </span>
      <span
        className={`${theSeasons.className} invite-names__nick text-[2.1rem] sm:text-[2.4rem]`}
        aria-hidden
      >
        {brideName}
      </span>
    </h2>
  )

  return (
    <div className="relative">
      {/* Soft glow behind the card */}
      <div
        className="pointer-events-none absolute -inset-2 rounded-[2rem] opacity-60 blur-2xl"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--color-welcome-gold) 16%, transparent), transparent 70%)" }}
        aria-hidden
      />

      <div
        className="relative overflow-hidden rounded-[1.5rem] border sm:rounded-[1.75rem]"
        style={{
          background: `linear-gradient(160deg, ${IVORY} 0%, var(--color-welcome-bg-soft) 55%, var(--color-motif-cream) 100%)`,
          borderColor: GOLD_BORDER,
          boxShadow:
            "0 18px 44px -24px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent), inset 0 1px 0 rgb(255 255 255 / 85%)",
        }}
      >
        {/* Double frame */}
        <div
          className="pointer-events-none absolute inset-2.5 rounded-[1.15rem] sm:inset-3.5 sm:rounded-[1.35rem]"
          style={{ border: `1px solid ${GOLD_BORDER_SOFT}` }}
          aria-hidden
        />

        <div className="relative grid gap-7 px-6 py-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10 sm:px-10 sm:py-10 lg:grid-cols-[auto_1fr_auto] lg:gap-12">
          {/* QR */}
          <div className="mx-auto flex flex-col items-center">
            <div
              className="relative rounded-2xl border p-6"
              style={{
                backgroundColor: qrBg,
                borderColor: GOLD_BORDER,
                boxShadow: "0 12px 28px -14px color-mix(in srgb, var(--color-welcome-navy) 35%, transparent)",
              }}
            >
              <CornerTicks />
              {tableUrl ? (
                <QRCodeCanvas
                  id={DISPLAY_QR_ID}
                  value={tableUrl}
                  size={188}
                  level="H"
                  includeMargin={false}
                  fgColor={qrFg}
                  bgColor={qrBg}
                  className="h-auto w-full max-w-[188px]"
                />
              ) : (
                <div className="h-[188px] w-[188px] animate-pulse rounded-md" style={{ backgroundColor: "color-mix(in srgb, var(--color-motif-silver) 28%, white)" }} />
              )}
            </div>
            {card.scanLabel ? (
              <p
                className={`${cinzel.className} mt-3.5 text-center text-[0.625rem] font-semibold uppercase tracking-[0.22em]`}
                style={{ color: SOFT }}
              >
                <SpecialCharFont text={card.scanLabel} className="font-sans" />
              </p>
            ) : null}
          </div>

          {/* Text */}
          <div className="text-center sm:text-left">
            {card.eyebrow ? (
              <p
                className={`${cinzel.className} mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em]`}
                style={{ color: GOLD }}
              >
                <SpecialCharFont text={fill(card.eyebrow)} className="font-sans" />
              </p>
            ) : null}

            {coupleNames}

            <div className="mt-4">
              <Ornament />
            </div>

            {card.title ? (
              <h2
                className={`${theSeasons.className} mt-4 text-[1.9rem] uppercase leading-none tracking-[0.08em] sm:text-[2.2rem]`}
                style={{ color: NAVY }}
              >
                <SpecialCharFont text={fill(card.title)} className={cinzel.className} />
              </h2>
            ) : null}
            {card.script ? (
              <p
                className={`${aboveTheBeyond.className} mt-1.5 leading-none`}
                style={{ color: SCRIPT, fontSize: "clamp(1.25rem, 2.6vw, 1.75rem)" }}
              >
                <SpecialCharFont text={fill(card.script)} className={`${playfair.className} italic`} />
              </p>
            ) : null}
            {card.description ? (
              <p
                className="font-goudy-italic mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed sm:mx-0"
                style={{ color: BODY }}
              >
                {fill(card.description)}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={downloadQr}
                disabled={!tableUrl}
                className={`${cinzel.className} inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-7 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50`}
                style={{
                  background: BUTTON,
                  borderColor: GOLD_BORDER,
                  color: IVORY,
                  boxShadow: "0 10px 22px -10px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
                }}
              >
                <Download className="h-3.5 w-3.5" />
                {card.buttonText}
              </button>
              {card.previewText ? (
                <Link
                  href={TABLE_FINDER_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cinzel.className} inline-flex min-h-11 items-center gap-1.5 rounded-full border px-5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 hover:bg-white/60`}
                  style={{ color: NAVY, borderColor: GOLD_BORDER_SOFT }}
                >
                  {card.previewText}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </Link>
              ) : null}
            </div>
            {card.downloadNote ? (
              <p className={`${playfair.className} mt-3 text-[0.78rem] italic`} style={{ color: SOFT }}>
                {card.downloadNote}
              </p>
            ) : null}
          </div>

          {/* Couple illustration (large screens) */}
          {card.coupleImage ? (
            <div className="hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.coupleImage}
                alt=""
                aria-hidden
                className="h-auto w-[9.5rem] select-none drop-shadow-[0_14px_28px_color-mix(in_srgb,var(--color-dash-ink)_18%,transparent)] xl:w-[11rem]"
              />
            </div>
          ) : null}
        </div>
      </div>

      {tableUrl ? (
        <div className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0" aria-hidden>
          <QRCodeCanvas
            id={PRINT_QR_ID}
            value={tableUrl}
            size={1024}
            level="H"
            includeMargin
            fgColor={qrFg}
            bgColor={qrBg}
          />
        </div>
      ) : null}
    </div>
  )
}
