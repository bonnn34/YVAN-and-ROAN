"use client"

import React, { useMemo } from "react"
import localFont from "next/font/local"
import { motion, useReducedMotion } from "motion/react"
import { StorySection } from "@/components/StorySection"
import { layeredSectionTitleSize } from "@/lib/section-typography"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { SkyBackdrop } from "@/components/sky-backdrop"
import "@/components/loader/loading-screen.css"
import { TintedDeco } from "@/components/tinted-deco"
import { StoryGlyphText } from "@/lib/story-glyph-text"
import { PuhonText } from "@/components/puhon-closing"

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

const revealEase = [0.22, 1, 0.36, 1] as const


// Soft white edge so text stays crisp over the sky backdrop
const onBgGlow = "0 1px 0 rgb(255 255 255 / 85%), 0 0 12px rgb(255 255 255 / 70%)"

function formatStoryParagraph(
  paragraph: string,
  groom: string,
  bride: string,
): string {
  return paragraph
    .replace(/\{groom\}/g, groom)
    .replace(/\{bride\}/g, bride)
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className="h-px w-10 sm:w-16"
        style={{ background: "linear-gradient(to right, transparent, var(--color-motif-yellow))" }}
      />
      <span className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" style={{ background: "var(--color-motif-accent)" }} aria-hidden />
      <span
        className="h-px w-10 sm:w-16"
        style={{ background: "linear-gradient(to left, transparent, var(--color-motif-yellow))" }}
      />
    </div>
  )
}

function LoveStoryTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <h1
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block pb-1 uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: "var(--color-welcome-navy)",
          textShadow: onBgGlow,
        }}
      >
        <StoryGlyphText text={title} />
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2.5 sm:leading-[0.9] md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: "var(--color-welcome-heading)",
          textShadow: onBgGlow,
        }}
      >
        <StoryGlyphText text={subtitle} />
      </span>
      <span className="sr-only">{subtitle}</span>
    </h1>
  )
}

function chapterTextFromParagraphs(
  paragraphs: readonly string[],
  groom: string,
  bride: string,
) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className={
            paragraphs.length > 1 && index < paragraphs.length - 1 ? "mb-4" : undefined
          }
        >
          <StoryGlyphText text={formatStoryParagraph(paragraph, groom, bride)} />
        </p>
      ))}
    </>
  )
}

// skyBackdrop: false when a parent already paints one sky behind this and the previous section
export function LoveStory({ skyBackdrop = true }: { skyBackdrop?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const loveStory = siteConfig.loveStory ?? defaultSiteConfig.loveStory
  // Corner florals + border live in content/site.ts → loveStory.decos / showFrame
  const corners = loveStory.decos ?? defaultSiteConfig.loveStory.decos
  const showFrame = loveStory.showFrame ?? defaultSiteConfig.loveStory.showFrame
  const intro = loveStory.intro ?? defaultSiteConfig.loveStory.intro
  const headerOrnament = loveStory.headerOrnament ?? defaultSiteConfig.loveStory.headerOrnament
  const photoAlt = loveStory.photoAlt ?? defaultSiteConfig.loveStory.photoAlt
  const showChapterNumbers = loveStory.showChapterNumbers ?? defaultSiteConfig.loveStory.showChapterNumbers
  const showChapterDividers = loveStory.showChapterDividers ?? defaultSiteConfig.loveStory.showChapterDividers
  const isPlain = loading.display === "plain"
  const reduceMotion = useReducedMotion()

  const groom =
    siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride =
    siteConfig.couple.brideNickname || siteConfig.couple.bride

  const chapters = useMemo(
    () => loveStory.chapters ?? defaultSiteConfig.loveStory.chapters,
    [loveStory.chapters],
  )
  const eucalyptusDecos =
    loveStory.eucalyptusDecos ?? defaultSiteConfig.loveStory.eucalyptusDecos

  return (
    <div
      id="love-story"
      // z-[2]: the whole section is one layer ABOVE the circle pattern (PlainBubbles, z-index 1,
      // painted by the parent wrapper) — its translucent wash then softens the circles behind it.
      // (A bare `isolate` would put the section at z-index auto, under the circles' opaque base.)
      className={`love-story-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative z-[2] min-h-screen w-full overflow-x-hidden`}
    >
      {skyBackdrop && <SkyBackdrop haze />}
      {/* Paper backdrop in the loading screen's colors (loading-screen.css → .love-story-bg) */}
      {isPlain && (
        <div className="love-story-bg" aria-hidden="true">
          <span className="love-story-bg__grain" />
        </div>
      )}

      {/* Corner florals at the section's four corners, sized per corner like the loader
          (original artwork colors), over a thin double border */}
      {isPlain && showFrame && <div className="love-story-frame" aria-hidden="true" />}
      {(
        [
          { src: corners.topLeft, pos: "tl", className: "left-0 top-0" },
          { src: corners.topRight, pos: "tr", className: "right-0 top-0" },
          { src: corners.bottomLeft, pos: "bl", className: "left-0 bottom-0" },
          { src: corners.bottomRight, pos: "br", className: "right-0 bottom-0" },
        ] as const
      )
        .filter(({ src }) => src)
        .map(({ src, pos, className }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={pos}
            src={src}
            alt=""
            aria-hidden="true"
            className={`love-story-corner love-story-corner--${pos} pointer-events-none absolute z-[1] select-none ${className}`}
          />
        ))}

      <header
        className="love-story-header relative z-20 pb-6 pt-24 text-center sm:pb-12 sm:pt-36 md:pb-14 md:pt-44"
      >
        <motion.div
          className="relative mx-auto max-w-3xl @container/love-story"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: revealEase }}
        >
          {headerOrnament ? (
            <TintedDeco src={headerOrnament} className="love-story-ornament mx-auto mb-3 sm:mb-4" />
          ) : null}
          <LoveStoryTitle title={loveStory.title} subtitle={loveStory.subtitle} />
          <div className="mt-4 sm:mt-5">
            <OrnamentalDivider />
          </div>
          {intro ? (
            <p className="love-story-intro mx-auto mt-5 max-w-xl sm:mt-6">
              <StoryGlyphText text={intro} />
            </p>
          ) : null}
        </motion.div>
      </header>

      {chapters.map((chapter, index) => (
        <StorySection
          key={`${chapter.image}-${index}`}
          title={chapter.title}
          // Sides (and light/dark cards) alternate automatically; a chapter's layout overrides it
          theme={index % 2 ? "dark" : "light"}
          layout={chapter.layout ?? (index % 2 ? "image-right" : "image-left")}
          imageSrc={chapter.image}
          videoSrc={chapter.video}
          imageAlt={formatStoryParagraph(chapter.imageAlt || photoAlt, groom, bride)}
          imagePosition={chapter.imagePosition}
          showNumber={showChapterNumbers}
          showDivider={showChapterDividers}
          date={chapter.date}
          text={chapterTextFromParagraphs(chapter.paragraphs, groom, bride)}
          plain={isPlain}
          chapterIndex={index}
          isFirst={index === 0}
          isLast={index === chapters.length - 1}
          eucalyptusDecos={isPlain ? eucalyptusDecos : undefined}
          chapterLabelText={loveStory.chapterLabel}
        />
      ))}

      <footer
        className="relative z-20 px-4 pb-16 pt-8 text-center sm:px-6 sm:pb-20 sm:pt-10 md:pb-24 md:px-8 md:pt-12"
      >
        <motion.div
          className="relative mx-auto max-w-xl px-2"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, delay: 0.08, ease: revealEase }}
        >
          <OrnamentalDivider />
          <PuhonText className="mt-6 sm:mt-8" />
          {isPlain && eucalyptusDecos.sectionBottom ? (
            <TintedDeco src={eucalyptusDecos.sectionBottom} className="love-story-footer-euc mx-auto mt-8 sm:mt-10" />
          ) : null}
        </motion.div>
      </footer>
    </div>
  )
}
