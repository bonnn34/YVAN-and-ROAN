"use client"

import Link from "next/link"
import { useEffect } from "react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { ChevronLeft } from "lucide-react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { HEART_PATH } from "@/components/rising-hearts"


const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
})

// Top bar: white → blush pink, charcoal lettering, warm-gray / blush hairline
const BAR_BG =
  "linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, color-mix(in srgb, var(--color-motif-blush) 55%, white) 100%)"

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const { couple, gallery } = useSiteConfig()
  const page = gallery.page

  useEffect(() => {
    const navbar = document.querySelector("nav") as HTMLElement | null
    if (navbar) navbar.style.display = "none"
    return () => {
      if (navbar) navbar.style.display = ""
    }
  }, [])

  return (
    <div style={{ background: "var(--color-bg-pattern-base)" }}>
      <div
        className="sticky top-0 z-50"
        style={{
          background: BAR_BG,
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 24px color-mix(in srgb, var(--color-motif-blush) 45%, transparent)",
        }}
      >
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-3 sm:h-14 sm:px-6 lg:px-8">
          <Link
            href="/#gallery"
            onClick={() => sessionStorage.setItem("returnFromGallery", "true")}
            className={`${cinzel.className} inline-flex items-center gap-1 rounded-full py-1.5 pl-2 pr-3.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:py-2 sm:pr-4 sm:text-[0.6875rem] sm:tracking-[0.2em]`}
            style={{
              background: "var(--color-motif-deep)",
              color: "var(--color-motif-soft)",
              boxShadow: "0 6px 14px -8px color-mix(in srgb, var(--color-motif-deep) 60%, transparent)",
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden min-[400px]:inline">{page.backText}</span>
            <span className="min-[400px]:hidden">{page.backTextShort}</span>
          </Link>

          <div className="flex min-w-0 items-baseline gap-2" style={{ color: "var(--color-motif-deep)" }}>
            <span
              className={`${aboveTheBeyond.className} hidden truncate text-lg leading-none sm:inline sm:text-xl`}
              style={{ color: "var(--color-motif-accent)" }}
            >
              {couple.groomNickname} &amp; {couple.brideNickname}
            </span>
            <svg viewBox="0 0 24 24" className="hidden h-2.5 w-2.5 self-center sm:inline-block" fill="var(--color-motif-accent)" aria-hidden>
              <path d={HEART_PATH} />
            </svg>
            <span
              className={`${cinzel.className} text-[0.625rem] font-semibold uppercase tracking-[0.24em] sm:text-[0.6875rem] sm:tracking-[0.28em]`}
            >
              {page.label}
            </span>
          </div>
        </div>
        {/* Hairline along the bottom edge: warm gray → blush → warm gray */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-motif-medium) 20%, var(--color-motif-blush) 50%, var(--color-motif-medium) 80%, transparent)",
          }}
          aria-hidden
        />
      </div>
      {children}
    </div>
  )
}
