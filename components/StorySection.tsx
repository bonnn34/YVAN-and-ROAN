"use client"

import React from "react"
import localFont from "next/font/local"
import { motion, useReducedMotion } from "motion/react"
import { sectionType, storyChapterTitleSize } from "@/lib/section-typography"
import Image from "next/image"
import { TornPaperEdge } from "./TornPaperEdge"
import { TintedDeco } from "@/components/tinted-deco"
import { StoryGlyphText } from "@/lib/story-glyph-text"
import { RisingHearts, HEART_PATH } from "@/components/rising-hearts"

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const lightBg = "var(--color-welcome-bg)"
const darkBg = "var(--color-welcome-green)"
const revealEase = [0.22, 1, 0.36, 1] as const

// Plain cards: flat palette colors — teal text on light cards, light text on teal cards
const TEAL = "var(--color-welcome-navy)"
const ON_TEAL = "var(--color-motif-soft)"

export type LoveStoryEucalyptusDecos = {
  topLeft: string
  bottomRight: string
  timelineTop: string
  sectionBottom: string
}

interface StorySectionProps {
  imageSrc?: string
  imageAlt?: string
  // Which part of the photo stays in frame (CSS object-position), e.g. "center 20%"
  imagePosition?: string
  // Milestone date shown above the title (falls back to "Chapter 0X")
  date?: string
  title?: string
  text: React.ReactNode
  layout: "image-left" | "image-right"
  theme: "dark" | "light"
  isFirst?: boolean
  isLast?: boolean
  plain?: boolean
  chapterIndex?: number
  eucalyptusDecos?: LoveStoryEucalyptusDecos
  // Word before the number on plain cards, e.g. "Chapter" → "Chapter 01"
  chapterLabelText?: string
  // Plain layout: faint chapter number behind the text / heart divider after the chapter
  showNumber?: boolean
  showDivider?: boolean
}

function PlainEucalyptusDecos({ decos }: { decos: LoveStoryEucalyptusDecos }) {
  return (
    <>
      <TintedDeco src={decos.timelineTop} className="story-plain-card__euc story-plain-card__euc--center" />
      <TintedDeco src={decos.topLeft} className="story-plain-card__euc story-plain-card__euc--left" />
      <TintedDeco src={decos.bottomRight} className="story-plain-card__euc story-plain-card__euc--right" />
    </>
  )
}

function PlainChapterDivider({ dark }: { dark: boolean }) {
  const line = dark
    ? "color-mix(in srgb, var(--color-motif-soft) 45%, transparent)"
    : "color-mix(in srgb, var(--color-welcome-navy) 35%, transparent)"
  return (
    <div className="mb-4 flex items-center justify-center gap-1.5 sm:mb-5">
      <span className="h-px w-8 sm:w-12" style={{ background: line }} />
      <span
        className="h-1 w-1 rotate-45"
        style={{ background: dark ? "var(--color-motif-blush)" : "var(--color-romantic-coral)" }}
        aria-hidden
      />
      <span className="h-px w-8 sm:w-12" style={{ background: line }} />
    </div>
  )
}

/**
 * Plain mode: open layout, no card. Photo and text sit side by side and swap
 * sides each chapter (layout "image-left" / "image-right"); text aligns toward
 * its photo. A small dusty-blue divider with a heart separates chapters.
 */
function PlainOpenChapter({
  imageSrc,
  imageAlt,
  imagePosition,
  date,
  title,
  text,
  photoLeft,
  isLast,
  chapterIndex,
  fallbackLabel,
  showNumber,
  showDivider,
}: {
  imageSrc?: string
  imageAlt?: string
  imagePosition?: string
  date?: string
  title?: string
  text: React.ReactNode
  photoLeft: boolean
  isLast: boolean
  chapterIndex: number
  fallbackLabel: string
  showNumber: boolean
  showDivider: boolean
}) {
  const reduceMotion = useReducedMotion()
  const photoFrom = reduceMotion ? { opacity: 1, x: 0, rotate: 0 } : { opacity: 0, x: photoLeft ? -40 : 40, rotate: 0 }
  const textFrom = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
  const tilt = photoLeft ? -2.5 : 2.5

  return (
    <div className={`${theSeasons.variable} story-open relative z-[2] px-5 sm:px-8 md:px-10`}>
      {/* Soft powder-blue wash behind each chapter, on the photo's side */}
      <span className={`story-open-wash ${photoLeft ? "story-open-wash--left" : "story-open-wash--right"}`} aria-hidden />
      <RisingHearts />
      <div
        className={`relative mx-auto flex max-w-5xl items-center gap-5 py-10 sm:gap-10 sm:py-14 md:gap-14 md:py-16 ${
          photoLeft ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {imageSrc ? (
          <motion.div
            className="w-[44%] shrink-0 sm:w-[42%] md:w-5/12"
            initial={photoFrom}
            whileInView={{ opacity: 1, x: 0, rotate: tilt }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.95, ease: revealEase }}
          >
            <div className="story-open-photo">
              {/* Tall portrait frame (2:3) */}
              <div className="relative aspect-[2/3] w-full overflow-hidden">
                <Image
                  src={encodeURI(imageSrc)}
                  alt={imageAlt ?? ""}
                  fill
                  sizes="(max-width: 640px) 44vw, (max-width: 1024px) 40vw, 420px"
                  className="object-cover"
                  style={{ objectPosition: imagePosition || "center 30%" }}
                  quality={85}
                  priority={chapterIndex < 1}
                />
              </div>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          className={`relative min-w-0 flex-1 ${photoLeft ? "text-left" : "text-right"}`}
          initial={textFrom}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.85, delay: 0.15, ease: revealEase }}
        >
          {/* Faint chapter numeral behind the text (loveStory.showChapterNumbers) */}
          {showNumber && (
            <span
              className={`story-open-number ${photoLeft ? "right-0" : "left-0"}`}
              aria-hidden
            >
              {String(chapterIndex + 1).padStart(2, "0")}
            </span>
          )}
          {/* Year / date line — Cinzel (engraved serif with clean numerals), see .story-open-date */}
          <p className="story-open-date">
            <StoryGlyphText text={date || fallbackLabel} />
          </p>
          {title ? (
            <h2 className={`${theSeasons.className} story-open-title`}>
              <StoryGlyphText text={title} />
            </h2>
          ) : null}
          <span
            className={`story-open-rule ${photoLeft ? "" : "ml-auto"}`}
            aria-hidden
          />
          <div className="story-open-text">{text}</div>
        </motion.div>
      </div>

      {showDivider && !isLast && (
        <div className="story-open-divider flex items-center justify-center gap-2" aria-hidden>
          <span className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(to right, transparent, #EFA27C)" }} />
          {/* Deep slate heart — the one accent between chapters */}
          <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="#333C63">
            <path d={HEART_PATH} />
          </svg>
          <span className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(to left, transparent, #EFA27C)" }} />
        </div>
      )}
    </div>
  )
}

export const StorySection: React.FC<StorySectionProps> = ({
  imageSrc,
  imageAlt,
  imagePosition,
  date,
  title,
  text,
  layout,
  theme,
  isFirst = false,
  isLast = false,
  plain = false,
  chapterIndex = 0,
  eucalyptusDecos,
  chapterLabelText = "Chapter",
  showNumber = true,
  showDivider = true,
}) => {
  const reduceMotion = useReducedMotion()

  if (plain) {
    return (
      <PlainOpenChapter
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        imagePosition={imagePosition}
        date={date}
        title={title}
        text={text}
        photoLeft={layout === "image-left"}
        isLast={isLast}
        chapterIndex={chapterIndex}
        fallbackLabel={`${chapterLabelText} ${String(chapterIndex + 1).padStart(2, "0")}`}
        showNumber={showNumber}
        showDivider={showDivider}
      />
    )
  }

  const isDark = theme === "dark"
  const showImage = !plain && Boolean(imageSrc)
  const slideFromLeft = layout === "image-left"

  const imageFrameStyle = isDark
    ? {
        background:
          "color-mix(in srgb, var(--color-welcome-bg-soft) 12%, var(--color-welcome-bg-soft))",
        boxShadow:
          "0 10px 28px color-mix(in srgb, var(--color-motif-accent) 35%, transparent)",
      }
    : {
        background: "var(--color-welcome-bg-soft)",
        border: "1px solid color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
        boxShadow:
          "0 8px 24px color-mix(in srgb, var(--color-motif-deep) 7%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)",
      }

  const rotation = layout === "image-left" ? "rotate-1 md:rotate-2" : "-rotate-1 md:-rotate-2"
  const flexDirection = layout === "image-left" ? "flex-row" : "flex-row-reverse"
  const plainAlign =
    layout === "image-left" ? "md:text-left md:items-start" : "md:text-right md:items-end"

  const chapterLabel = String(chapterIndex + 1).padStart(2, "0")
  const stagger = Math.min(chapterIndex * 0.07, 0.45)

  const plainInitial = reduceMotion
    ? { opacity: 1, x: 0, y: 0, scale: 1 }
    : {
        opacity: 0,
        x: slideFromLeft ? -36 : 36,
        y: 20,
        scale: 0.97,
      }

  const plainAnimate = { opacity: 1, x: 0, y: 0, scale: 1 }

  const imageInitial = reduceMotion
    ? { opacity: 1, scale: 1, y: 0 }
    : { opacity: 0, scale: 0.9, y: 24 }

  const textInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 16 }

  const sectionSurfaceClass = plain
    ? `love-story-plain-track love-story-plain-track--theme-${theme}${isFirst ? " love-story-plain-track--first" : ""}${isLast ? " love-story-plain-track--last" : ""}`
    : ""

  return (
    <div
      className={`${theSeasons.variable} relative z-[2] ${sectionSurfaceClass}`}
      style={plain ? undefined : { background: isDark ? darkBg : lightBg }}
    >
      {plain && (
        <div className="story-plain-atmosphere" aria-hidden="true">
          <div className="story-plain-atmosphere__blobs">
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--a" />
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--b" />
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--c" />
          </div>
        </div>
      )}

      {!isDark && !plain && (
        <>
          {!isFirst && (
            <div className="pointer-events-none absolute left-0 top-0 z-20 -mt-[8px] w-full md:-mt-[20px]">
              <TornPaperEdge flipped={true} color={lightBg} />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 z-20 -mb-[8px] w-full md:-mb-[20px]">
            <TornPaperEdge flipped={false} color={lightBg} />
          </div>
        </>
      )}

      <div
        className={`container relative z-10 mx-auto px-2 md:px-12 ${showImage ? "py-12 md:py-32" : "py-1.5 md:py-14"} ${isFirst ? (showImage ? "pt-16 md:pt-36" : "pt-14 md:pt-16") : ""} ${isLast ? (showImage ? "pb-16 md:pb-36" : "pb-6 md:pb-16") : ""}`}
      >
        <div
          className={
            showImage
              ? `flex ${flexDirection} items-center justify-between gap-3 md:gap-16`
              : `mx-auto flex max-w-2xl flex-col items-center px-2 text-center sm:px-4 ${plainAlign}`
          }
        >
          {showImage && imageSrc && (
            <div className="flex w-[45%] shrink-0 justify-center md:w-5/12">
              <motion.div
                className={`relative w-full md:max-w-md ${rotation}`}
                initial={imageInitial}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.95, delay: stagger, ease: revealEase }}
              >
                <div className="w-full p-1.5 md:p-3" style={imageFrameStyle}>
                  <div className="group relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={imageAlt ?? ""}
                      fill
                      sizes="(max-width: 768px) 45vw, (max-width: 1024px) 40vw, 33vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      quality={90}
                      priority={chapterIndex < 2}
                    />
                    {isDark && (
                      <div className="pointer-events-none absolute inset-0 z-10 bg-black/5 mix-blend-multiply" />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {plain ? (
            <motion.article
              className={`story-plain-card w-full max-w-xl px-5 pb-7 pt-10 sm:rounded-2xl sm:px-8 sm:pb-9 sm:pt-12 md:px-9 md:pb-10 md:pt-14 ${isDark ? "story-plain-card--dark" : ""}`}
              initial={plainInitial}
              whileInView={plainAnimate}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.88, delay: stagger, ease: revealEase }}
            >
              {eucalyptusDecos ? (
                <PlainEucalyptusDecos decos={eucalyptusDecos} />
              ) : null}
              <span className="story-plain-card__frost" aria-hidden />
              <span className="story-plain-card__dot" aria-hidden />
              <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />
              <div className="relative z-[2]">
              {imageSrc ? (
                <div
                  className={`story-plain-photo mx-auto mb-6 w-[78%] max-w-[18rem] sm:mb-7 ${slideFromLeft ? "-rotate-2" : "rotate-2"}`}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={encodeURI(imageSrc)}
                      alt={imageAlt ?? ""}
                      fill
                      sizes="(max-width: 640px) 70vw, 288px"
                      className="object-cover"
                      quality={85}
                      priority={chapterIndex < 1}
                    />
                  </div>
                </div>
              ) : null}
              <p
                className={`${theSeasons.className} story-plain-chapter-label mb-2 text-[0.6rem] font-medium uppercase sm:text-[0.66rem]`}
              >
                <StoryGlyphText text={date || `${chapterLabelText} ${chapterLabel}`} />
              </p>
              {title ? (
                <h2
                  className={`${theSeasons.className} mb-3 uppercase leading-tight tracking-[0.08em] sm:mb-4 sm:tracking-[0.1em] md:tracking-[0.11em]`}
                  style={{
                    fontSize: storyChapterTitleSize,
                    color: isDark ? ON_TEAL : TEAL,
                  }}
                >
                  <StoryGlyphText text={title} />
                </h2>
              ) : null}
              <PlainChapterDivider dark={isDark} />
              <div
                style={{ color: isDark ? ON_TEAL : TEAL }}
                className={`font-goudy-italic space-y-3 sm:space-y-4 md:space-y-5 lg:leading-[1.7] ${sectionType.textRelaxed}`}
              >
                {text}
              </div>
              <div
                className={`story-plain-chapter-line mt-6 sm:mt-7 ${isDark ? "story-plain-chapter-line--dark" : ""}`}
                aria-hidden
              />
              </div>
              {!isLast && (
                <div className="story-plain-chapter-connector" aria-hidden>
                  <span className="story-plain-chapter-connector__stem" />
                </div>
              )}
            </motion.article>
          ) : (
            <motion.div
              className={
                showImage
                  ? "w-[55%] @container/story md:w-5/12"
                  : "w-full @container/story px-2 sm:px-4"
              }
              style={{ color: isDark ? lightBg : "var(--color-welcome-text)" }}
              initial={textInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.85, delay: stagger + 0.15, ease: revealEase }}
            >
              {title && (
                <h2
                  className={`${theSeasons.className} mb-3 uppercase leading-tight tracking-[0.08em] sm:mb-4 sm:tracking-[0.1em] md:mb-6 md:tracking-[0.12em]`}
                  style={{
                    fontSize: storyChapterTitleSize,
                    color: isDark ? lightBg : "var(--color-welcome-navy)",
                  }}
                >
                  <StoryGlyphText text={title} />
                </h2>
              )}
              <div
                className={`font-goudy-italic space-y-3 sm:space-y-4 md:space-y-6 lg:leading-[1.7] ${sectionType.textRelaxed}`}
              >
                {text}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
