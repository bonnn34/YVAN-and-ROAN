"use client"

import { Section } from "@/components/section"
import { useState, type ReactNode } from "react"
import { useQrColors } from "@/hooks/use-css-color"
import { QRCodeSVG } from "qrcode.react"
import Image from "next/image"
import localFont from "next/font/local"
import { Cinzel } from "next/font/google"
import { Hotel, Copy, Check, Navigation, MapPin } from "lucide-react"
import { layeredSectionTitleSize } from "@/lib/section-typography"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

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

const C = {
  forest: "#002059",
  sage: "#1A3A6E",
  mustard: "#F28F75",
  butter: "#F7B7A3",
  cream: "#FFFAF7",
} as const

const sectionBackground = `
  radial-gradient(920px 520px at 50% 8%, color-mix(in srgb, ${C.butter} 35%, transparent) 0%, transparent 55%),
  radial-gradient(640px 420px at 12% 88%, color-mix(in srgb, ${C.sage} 16%, transparent) 0%, transparent 58%),
  radial-gradient(560px 380px at 92% 78%, color-mix(in srgb, ${C.mustard} 14%, transparent) 0%, transparent 55%),
  linear-gradient(180deg, ${C.cream} 0%, #FFFFFF 48%, ${C.cream} 100%)
`

const detailText = {
  body: "var(--color-welcome-text)",
  heading: "var(--color-welcome-navy)",
  label: "var(--color-welcome-heading)",
  accent: "var(--color-welcome-green)",
} as const

const cardStyle = {
  background: "var(--color-welcome-bg)",
  borderColor: "color-mix(in srgb, var(--color-motif-deep) 14%, transparent)",
  borderWidth: "1px",
  borderStyle: "solid",
  boxShadow:
    "0 8px 28px color-mix(in srgb, var(--color-motif-deep) 7%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)",
} as const

const softPanelStyle = {
  borderColor: "color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
  backgroundColor: "var(--color-welcome-bg-soft)",
} as const


const HOTEL = {
  name: "Microtel by Wyndham South Forbes near Nuvali",
  address: "South Forbes Golf City, Brgy. Inchican, Silang, Cavite, Philippines",
  mapsLink: "https://maps.app.goo.gl/qPai4AGyx3uyMBXX6?g_st=ifm",
  image: "/Details/recommendedhotel.png",
} as const

const ct = {
  label: "text-[11px] sm:text-xs md:text-sm",
  body: "text-xs sm:text-sm md:text-base",
  btn: "text-xs sm:text-sm md:text-base",
} as const

function SectionIconDivider({ icon }: { icon: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-1 sm:pt-2">
      <span
        className="h-px w-8 sm:w-12 md:w-16"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
        }}
      />
      {icon}
      <span
        className="h-px w-8 sm:w-12 md:w-16"
        style={{
          background:
            "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
        }}
      />
    </div>
  )
}

function HotelTitle() {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.15em] md:tracking-[0.18em] pb-1 sm:pb-1.5`}
        style={{
          fontSize: "var(--title-size)",
          color: "var(--color-welcome-navy)",
        }}
      >
        Recommended Hotel
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: "var(--color-motif-accent)",
        }}
      >
        a place to stay
      </span>
      <span className="sr-only">a place to stay</span>
    </h2>
  )
}

export function RecommendedHotel() {
  const { fg: qrFg, bg: qrBg } = useQrColors() // --color-qr-fg / --color-qr-bg in globals.css
  const [copied, setCopied] = useState(false)
  const fullVenue = `${HOTEL.name}, ${HOTEL.address}`

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullVenue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const openInMaps = () => {
    window.open(HOTEL.mapsLink, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}
      style={{ background: sectionBackground }}
    >
      <Section
        id="hotel"
        className="relative z-10 pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 lg:pt-14 lg:pb-14 overflow-hidden"
      >
        <div className="relative z-20 mb-6 px-6 text-center sm:mb-8 sm:px-10 md:mb-10 md:px-12">
          <div className="my-4 sm:my-5 md:my-6">
            <HotelTitle />
          </div>
          <p
            className="font-goudy-italic mx-auto max-w-2xl px-2 text-[0.75rem] leading-[1.62] sm:text-[0.8125rem] sm:leading-[1.65] md:text-[0.84375rem]"
            style={{ color: "var(--color-welcome-text)" }}
          >
            For guests traveling in, we recommend staying at Microtel by Wyndham South Forbes
            near Nuvali — a short drive from both the ceremony and reception.
          </p>

          <SectionIconDivider
            icon={
              <Hotel
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                style={{ color: "var(--color-welcome-green)" }}
                aria-hidden
              />
            }
          />
        </div>

        <div className="relative z-20 mx-auto mb-2 max-w-5xl px-4 sm:px-6 md:px-8">
          <div
            className="relative overflow-hidden rounded-xl border transition-all duration-300 sm:rounded-2xl"
            style={cardStyle}
          >
            <div className="relative h-64 w-full overflow-hidden sm:h-72 md:h-80 lg:h-96 xl:h-[30rem]">
              <Image
                src={HOTEL.image}
                alt={HOTEL.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
              />
            </div>

            <div className="p-3 sm:p-5 md:p-7 lg:p-9">
              <div className="mb-4 rounded-xl border p-3 sm:mb-6 sm:p-4 md:p-5" style={softPanelStyle}>
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  <MapPin
                    className="mt-0.5 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-6 md:w-6"
                    style={{ color: detailText.accent }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`${cinzel.className} ${ct.label} mb-1.5 font-semibold uppercase tracking-wide sm:mb-2`}
                      style={{ color: detailText.label }}
                    >
                      Recommended Stay
                    </p>
                    <p
                      className={`${theSeasons.className} text-sm font-semibold uppercase leading-snug tracking-[0.06em] sm:text-base md:text-lg lg:text-xl`}
                      style={{ color: detailText.heading }}
                    >
                      {HOTEL.name}
                    </p>
                    <p
                      className={`${theSeasons.className} ${ct.body} mt-1 leading-relaxed tracking-[0.04em]`}
                      style={{ color: detailText.body }}
                    >
                      {HOTEL.address}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-center gap-1.5 sm:gap-2">
                    <div
                      className="rounded-lg border p-1.5 shadow-sm sm:p-2 md:p-2.5"
                      style={{
                        backgroundColor: "var(--color-welcome-bg)",
                        borderColor: "color-mix(in srgb, var(--color-motif-deep) 14%, transparent)",
                      }}
                    >
                      <QRCodeSVG
                        value={HOTEL.mapsLink}
                        size={80}
                        level="M"
                        includeMargin={false}
                        fgColor={qrFg}
                        bgColor={qrBg}
                      />
                    </div>
                    <p
                      className={`font-goudy-italic ${ct.label} max-w-[90px] text-center`}
                      style={{ color: detailText.label }}
                    >
                      Scan for directions
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={openInMaps}
                  className={`${cinzel.className} ${ct.btn} flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:gap-2 sm:px-5 sm:py-3 md:py-3.5`}
                  style={{
                    backgroundColor: "var(--color-welcome-green)",
                    borderColor: "color-mix(in srgb, var(--color-welcome-navy) 35%, transparent)",
                    color: "var(--color-welcome-bg)",
                    boxShadow:
                      "0 6px 20px color-mix(in srgb, var(--color-welcome-green) 35%, transparent)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-welcome-navy)"
                    e.currentTarget.style.borderColor = "var(--color-welcome-green)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-welcome-green)"
                    e.currentTarget.style.borderColor =
                      "color-mix(in srgb, var(--color-welcome-navy) 35%, transparent)"
                  }}
                  aria-label="Get directions to recommended hotel"
                >
                  <Navigation className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Get Directions</span>
                </button>
                <button
                  type="button"
                  onClick={copyAddress}
                  className={`${cinzel.className} ${ct.btn} flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 px-4 py-2.5 font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:gap-2 sm:px-5 sm:py-3 md:py-3.5`}
                  style={{
                    color: detailText.heading,
                    backgroundColor: "var(--color-welcome-bg-soft)",
                    borderColor: "color-mix(in srgb, var(--color-motif-deep) 20%, transparent)",
                  }}
                  aria-label="Copy hotel address"
                >
                  {copied ? (
                    <Check
                      className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4 md:h-5 md:w-5"
                      style={{ color: "var(--color-welcome-green)" }}
                    />
                  ) : (
                    <Copy className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  )}
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
