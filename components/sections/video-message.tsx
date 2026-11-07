"use client"

import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import {
  sectionBackground,
  sectionDividerLineStyle,
  sectionDividerLineStyleLeft,
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

const palette = {
  body: "var(--color-welcome-text)",
  heading: "var(--color-welcome-navy)",
  accent: "var(--color-welcome-green)",
} as const

const outsideDividerLineStyle = sectionDividerLineStyle

const insideDividerLineStyle = {
  background:
    "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent), transparent)",
} as const

const cardStyle = {
  background: "var(--color-welcome-bg)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "color-mix(in srgb, var(--color-motif-deep) 14%, transparent)",
  boxShadow:
    "0 8px 28px color-mix(in srgb, var(--color-motif-deep) 7%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)",
} as const

function OutsideDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-px w-6 sm:w-10" style={outsideDividerLineStyle} />
      <span className="h-0.5 w-0.5 rounded-full bg-motif-deep/45 sm:h-1 sm:w-1" aria-hidden />
      <span className="h-px w-6 sm:w-10" style={sectionDividerLineStyleLeft} />
    </div>
  )
}

function InsideDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-px w-6 sm:w-10" style={insideDividerLineStyle} />
      <span className="h-0.5 w-0.5 rounded-full bg-motif-deep/45 sm:h-1 sm:w-1" aria-hidden />
      <span
        className="h-px w-6 sm:w-10"
        style={{
          background:
            "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
        }}
      />
    </div>
  )
}

function VideoMessageTitle() {
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
        Send Us a Video Message
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: sectionText.script,
        }}
      >
        A message we will treasure
      </span>
      <span className="sr-only">A message we will treasure</span>
    </h2>
  )
}

export function VideoMessage() {
  const siteConfig = useSiteConfig()
  const uploadUrl = siteConfig.snapShare?.googleDriveLink ?? ""

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}
      style={{ background: sectionBackground }}
    >
    <section
      id="video-message"
      className="relative z-10 pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 lg:pt-14 lg:pb-14"
    >
      <div className="relative z-20 mx-auto max-w-4xl px-4 @container/video-message sm:px-6 md:px-8">
        <div className="relative z-20 px-6 text-center sm:px-10 md:px-12">
          <div className="mx-auto mb-5 sm:mb-6 md:mb-7">
            <OutsideDivider />
          </div>
          <div className="mx-auto mt-2 sm:mt-3 md:mt-4">
            <VideoMessageTitle />
          </div>
          <div className="flex items-center justify-center pt-3 sm:pt-4">
            <span className="h-px w-16 sm:w-24 md:w-32 bg-motif-deep/35" />
          </div>
        </div>

        <div
          className="relative mt-6 overflow-hidden rounded-xl border backdrop-blur-xl sm:mt-8 sm:rounded-2xl sm:backdrop-blur-2xl md:mt-10"
          style={cardStyle}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/35 via-white/8 to-transparent"
            aria-hidden
          />

          <div className="relative z-20 space-y-4 px-4 py-6 text-center sm:space-y-5 sm:px-6 sm:py-8 md:space-y-6 md:px-8 md:py-10">
            <div
              className={`font-goudy-italic space-y-2.5 sm:space-y-3 ${sectionType.textRelaxed}`}
              style={{ color: palette.body }}
            >
              <p>
                As we begin this new chapter under the Lord&apos;s guidance, we are deeply grateful
                for everyone He has placed in our lives.
              </p>
              <p style={{ color: palette.accent }}>
                You are a blessing we hold close to our hearts.
              </p>
              <p>
                We would love to receive a short video message from you—something we can keep and
                look back on through the years ahead.
              </p>
              <p>
                Your words will make our wedding day, and our life together, even more meaningful.
                Thank you for your love and support.
              </p>
            </div>

            <div className="mx-auto flex items-center justify-center pt-1 sm:pt-2">
              <InsideDivider />
            </div>

            <div className="space-y-3 pt-2 sm:space-y-4 sm:pt-3">
              <p
                className={`font-goudy-italic ${sectionType.text}`}
                style={{ color: palette.heading }}
              >
                Upload your video message here:
              </p>

              {uploadUrl ? (
                <a
                  href={uploadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cinzel.className} group relative inline-flex items-center justify-center rounded-sm border px-6 py-2.5 ${sectionType.label} font-semibold uppercase tracking-[0.2em] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-8 sm:py-3 sm:tracking-[0.24em] md:px-10 md:py-3.5 md:tracking-[0.28em]`}
                  style={{
                    backgroundColor: "var(--color-welcome-green)",
                    borderColor: "color-mix(in srgb, var(--color-welcome-navy) 35%, transparent)",
                    color: "var(--color-welcome-bg)",
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
                  <span className="relative z-10">Upload Video Message</span>
                  <div
                    className="absolute inset-0 -z-0 rounded-sm opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-25"
                    style={{ backgroundColor: "var(--color-motif-deep)" }}
                  />
                </a>
              ) : (
                <p className={`font-goudy-italic ${sectionType.text}`} style={{ color: palette.body }}>
                  Upload link coming soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}