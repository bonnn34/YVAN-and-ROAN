"use client"

import { useQrColors } from "@/hooks/use-css-color"
import { QRCodeSVG } from "qrcode.react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { Video } from "lucide-react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import {
  sectionBackground,
  sectionDividerLineStyle,
  sectionDividerLineStyleLeft,
  sectionPalette,
  sectionText,
} from "@/lib/section-background"


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

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfeGlEl4CMXWefdvCw6AOPHFS1ROku_rs-Gbofa2LkVJ0sLGQ/viewform"


const cardStyle = {
  background: "var(--color-welcome-bg)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "color-mix(in srgb, var(--color-motif-deep) 14%, transparent)",
  boxShadow:
    "0 8px 28px color-mix(in srgb, var(--color-motif-deep) 7%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)",
} as const

const softPanelStyle = {
  borderColor: "color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
  backgroundColor: "var(--color-welcome-bg-soft)",
} as const

function OutsideDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-px w-6 sm:w-10" style={sectionDividerLineStyle} />
      <span className="h-0.5 w-0.5 rounded-full bg-motif-deep/45 sm:h-1 sm:w-1" aria-hidden />
      <span className="h-px w-6 sm:w-10" style={sectionDividerLineStyleLeft} />
    </div>
  )
}

function MessageVideoTitle() {
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
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em] pb-1 sm:pb-1.5`}
        style={{
          fontSize: "var(--title-size)",
          color: sectionText.title,
        }}
      >
        Video Message
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2.5 sm:leading-[0.9] md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: sectionText.script,
        }}
      >
        a message we will treasure
      </span>
      <span className="sr-only">a message we will treasure</span>
    </h2>
  )
}

export function MessageVideo() {
  const { fg: qrFg, bg: qrBg } = useQrColors() // --color-qr-fg / --color-qr-bg in globals.css
  const siteConfig = useSiteConfig()
  const coupleName = `${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname}`

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}
      style={{ background: sectionBackground }}
    >
      <section
        id="video-message"
        className="relative z-10 overflow-hidden pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 lg:pt-14 lg:pb-14"
      >
        <div className="relative z-20 mx-auto max-w-xl px-3 @container/message-video sm:max-w-2xl sm:px-5 md:px-6">
          <div className="mb-5 px-2 text-center sm:mb-6 md:mb-7">
            <OutsideDivider />
            <div className="mt-4 sm:mt-5 md:mt-6">
              <MessageVideoTitle />
            </div>
            <p
              className={`font-goudy-italic mx-auto mt-4 max-w-lg px-2 sm:mt-5 ${sectionType.textRelaxed}`}
              style={{ color: sectionText.body }}
            >
              A short video from you would mean the world to {coupleName}.
            </p>
            <div className="mt-4 flex items-center justify-center sm:mt-5">
              <span className="h-px w-16 sm:w-24 md:w-32 bg-motif-deep/35" />
            </div>
          </div>

          <article
            className="relative min-w-0 overflow-visible rounded-lg border px-4 pt-6 pb-8 sm:rounded-xl sm:px-7 sm:pt-7 sm:pb-10 md:rounded-2xl md:px-8 md:pt-8 md:pb-12"
            style={cardStyle}
          >
            <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-5 top-0 h-px sm:inset-x-8"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
              }}
            />

            <div className="relative z-10 space-y-5 px-1 text-center sm:space-y-6 sm:px-2">
              <div className="flex items-center justify-center gap-2 pt-2 sm:pt-3">
                <span
                  className="h-px w-8 sm:w-12"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
                  }}
                />
                <Video
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  style={{ color: sectionPalette.forest }}
                  aria-hidden
                />
                <span
                  className="h-px w-8 sm:w-12"
                  style={{
                    background:
                      "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
                  }}
                />
              </div>

              <div
                className={`font-goudy-italic space-y-3 ${sectionType.textRelaxed}`}
                style={{ color: sectionText.body }}
              >
                <p>
                  Thank you for taking the time to record a video message. Kindly upload your
                  video here — something we can keep and look back on through the years ahead.
                </p>
              </div>

              <div
                className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border px-4 py-5 sm:gap-4 sm:px-5 sm:py-6"
                style={softPanelStyle}
              >
                <div
                  className="rounded-xl border bg-white p-2.5 shadow-sm sm:p-3"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-motif-deep) 14%, transparent)",
                  }}
                >
                  <QRCodeSVG
                    value={FORM_URL}
                    size={148}
                    level="M"
                    includeMargin={false}
                    fgColor={qrFg}
                    bgColor={qrBg}
                  />
                </div>
                <p
                  className={`font-goudy-italic max-w-[12rem] ${sectionType.text}`}
                  style={{ color: sectionText.label }}
                >
                  Scan to upload from your phone
                </p>
              </div>

              <a
                href={FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cinzel.className} ${sectionType.label} inline-flex items-center justify-center rounded-full border px-8 py-3 font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:px-10 sm:py-3.5 sm:tracking-[0.22em]`}
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
              >
                Open upload form
              </a>

              <p
                className={`font-goudy-italic ${sectionType.label}`}
                style={{ color: sectionText.label }}
              >
                One video, up to 10 MB. A Google account is needed to upload.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
