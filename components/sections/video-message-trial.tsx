"use client"

import { useQrColors } from "@/hooks/use-css-color"
import { QRCodeSVG } from "qrcode.react"
import localFont from "next/font/local"
import { Cinzel } from "next/font/google"
import { Video } from "lucide-react"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { sectionBackground, sectionText } from "@/lib/section-background"

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

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfeGlEl4CMXWefdvCw6AOPHFS1ROku_rs-Gbofa2LkVJ0sLGQ/viewform"

const forest = "#002059"
const heading = "#FFFFFF"
const body = "#FFFAF7"

function TrialTitle() {
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
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em] pb-1 sm:pb-1.5`}
        style={{
          fontSize: "var(--title-size)",
          color: sectionText.title,
        }}
      >
        A Video for Us
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2.5 sm:leading-[0.9] md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: sectionText.script,
        }}
      >
        from your phone to our hearts
      </span>
      <span className="sr-only">from your phone to our hearts</span>
    </h2>
  )
}

export function VideoMessageTrial() {
  const { fg: qrFg, bg: qrBg } = useQrColors() // --color-qr-fg / --color-qr-bg in globals.css
  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}
      style={{ background: sectionBackground }}
    >
      <section
        id="video-message-trial"
        className="relative z-10 overflow-hidden pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 lg:pt-14 lg:pb-14"
      >
        <div className="relative z-20 mx-auto mb-6 max-w-3xl px-6 text-center sm:mb-8 sm:px-10 md:mb-10 md:px-12">
          <p
            className={`${cinzel.className} ${sectionType.label} mb-3 font-semibold uppercase tracking-[0.22em] sm:mb-4`}
            style={{ color: sectionText.label }}
          >
            Trial layout
          </p>
          <TrialTitle />
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 ${sectionType.textRelaxed}`}
            style={{ color: sectionText.body }}
          >
            Thank you for taking the time to record a video message. Scan the code or open the form
            to upload it for Paul &amp; Ana.
          </p>
        </div>

        <div className="relative z-20 mx-auto max-w-xl px-4 sm:max-w-2xl sm:px-6 md:px-8">
          <div
            className="relative overflow-hidden rounded-t-full"
            style={{
              backgroundColor: forest,
              boxShadow: `0 18px 48px color-mix(in srgb, ${forest} 28%, transparent)`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-3 z-30 rounded-t-full border border-white sm:inset-4 md:inset-5"
              aria-hidden
            />

            <div className="relative z-20 flex flex-col items-center px-6 pb-10 pt-[22%] text-center sm:px-10 sm:pb-12 md:px-14 md:pb-14">
              <div
                className="mb-5 rounded-2xl border bg-white p-3 shadow-sm sm:mb-6 sm:p-4"
                style={{ borderColor: "rgba(255, 255, 255, 0.45)" }}
              >
                <QRCodeSVG
                  value={FORM_URL}
                  size={168}
                  level="M"
                  includeMargin={false}
                  fgColor={qrFg}
                  bgColor={qrBg}
                />
              </div>
              <p
                className={`font-goudy-italic mb-5 max-w-[14rem] sm:mb-6 ${sectionType.text}`}
                style={{ color: body }}
              >
                Scan to upload from your phone
              </p>

              <Video
                className="mb-3 h-5 w-5 sm:h-6 sm:w-6"
                style={{ color: "#F7B7A3" }}
                aria-hidden
              />
              <h3
                className={`${cinzel.className} ${sectionType.subheader} font-semibold uppercase tracking-[0.14em]`}
                style={{ color: heading }}
              >
                Upload your message
              </h3>
              <p
                className={`font-goudy-italic mx-auto mt-3 max-w-md leading-relaxed ${sectionType.textRelaxed}`}
                style={{ color: body }}
              >
                One video, up to 10 MB. A Google account is needed to upload.
              </p>

              <a
                href={FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cinzel.className} mt-6 inline-flex items-center justify-center rounded-full border px-7 py-3 ${sectionType.label} font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:mt-7 sm:px-9 sm:py-3.5 sm:tracking-[0.22em]`}
                style={{
                  backgroundColor: "#F7B7A3",
                  borderColor: "rgba(255, 255, 255, 0.35)",
                  color: forest,
                  boxShadow: "0 8px 22px color-mix(in srgb, #F7B7A3 35%, transparent)",
                }}
              >
                Open upload form
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
