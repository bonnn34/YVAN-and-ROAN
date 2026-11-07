"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { cinzel } from "@/lib/fonts"


// Motif colors (app/globals.css): white paper, dusty-blue accents, sky borders
const IVORY = "#FFFFFF"
const GOLD = "var(--color-welcome-heading)"
const NAVY = "var(--color-welcome-navy)"
const GOLD_BORDER = "color-mix(in srgb, var(--color-motif-medium) 60%, transparent)"
const NAV_GOLD =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 70%, var(--color-welcome-navy)) 100%)"

const MAX_IMAGE_RETRIES = 5
const DISPLAY_RETRY_MS = 6000
const LAZY_ROOT_MARGIN = "480px 0px"

type ImageItem = {
  src: string
  category: "desktop" | "mobile" | "front" | "gallery"
  width: number
  height: number
  orientation: "portrait" | "landscape"
}

function cacheBustSrc(src: string, attempt: number) {
  if (attempt <= 0) return src
  const joiner = src.includes("?") ? "&" : "?"
  return `${src}${joiner}retry=${attempt}`
}

function RetryableGalleryImage({
  src,
  width,
  height,
  alt,
  sizes,
  className,
  style,
  priority = false,
  variant = "grid",
}: {
  src: string
  width: number
  height: number
  alt: string
  sizes: string
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  variant?: "grid" | "lightbox"
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const loadedRef = useRef(false)
  const [inView, setInView] = useState(priority)
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const isLightbox = variant === "lightbox"

  const retry = useCallback(() => {
    if (loadedRef.current) return
    setAttempt((current) => (current >= MAX_IMAGE_RETRIES ? current : current + 1))
  }, [])

  useEffect(() => {
    if (inView) return
    const el = wrapRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        observer.disconnect()
      },
      { rootMargin: LAZY_ROOT_MARGIN },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  useEffect(() => {
    if (!inView || loaded) return

    const timeoutId = window.setTimeout(() => {
      if (!loadedRef.current) retry()
    }, DISPLAY_RETRY_MS + attempt * 400)

    return () => window.clearTimeout(timeoutId)
  }, [attempt, inView, loaded, retry])

  return (
    <div
      ref={wrapRef}
      className={isLightbox ? "relative flex max-h-[85vh] w-full items-center justify-center" : "relative w-full overflow-hidden"}
      style={
        isLightbox
          ? undefined
          : {
              aspectRatio: `${width} / ${height}`,
              backgroundColor: "color-mix(in srgb, var(--color-motif-medium) 18%, white)",
            }
      }
    >
      {inView ? (
        <Image
          key={`${src}-${attempt}`}
          src={cacheBustSrc(src, attempt)}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          unoptimized
          priority={priority}
          loading="eager"
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          className={`${className ?? ""} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${
            isLightbox
              ? "h-auto max-h-[85vh] w-auto max-w-full shadow-2xl"
              : "absolute inset-0 h-full w-full"
          }`}
          style={style}
          onLoad={() => {
            loadedRef.current = true
            setLoaded(true)
          }}
          onError={() => {
            window.setTimeout(retry, 180)
          }}
        />
      ) : null}
    </div>
  )
}

export default function MasonryGallery({ images }: { images: ImageItem[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const topRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIdx == null) return
      if (e.key === "Escape") setLightboxIdx(null)
      if (e.key === "ArrowRight") setLightboxIdx((idx) => (idx == null ? null : (idx + 1) % images.length))
      if (e.key === "ArrowLeft") setLightboxIdx((idx) => (idx == null ? null : (idx - 1 + images.length) % images.length))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [images.length, lightboxIdx])

  useEffect(() => {
    if (lightboxIdx == null) return
    const neighbors = [
      images[(lightboxIdx + 1) % images.length],
      images[(lightboxIdx - 1 + images.length) % images.length],
    ]
    neighbors.forEach((image) => {
      if (!image) return
      const preload = new window.Image()
      preload.decoding = "async"
      preload.src = image.src
    })
  }, [images, lightboxIdx])

  return (
    <div ref={topRef} className="relative">
      <div className="mb-6 flex justify-end">
        <div
          className={`${cinzel.className} text-[0.6875rem] font-semibold uppercase tracking-[0.18em] sm:text-xs`}
          style={{ color: GOLD }}
        >
          {images.length} photos
        </div>
      </div>

      {images.length === 0 ? (
        <div className="font-goudy-italic text-center" style={{ color: "var(--color-welcome-text)" }}>
          No images to display.
        </div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4">
          {images.map((img, idx) => (
            <button
              key={img.src}
              type="button"
              className="group mb-3 block w-full break-inside-avoid text-left sm:mb-4"
              onClick={() => setLightboxIdx(idx)}
              aria-label={`Open photo ${idx + 1}`}
            >
              <div
                className="relative w-full overflow-hidden rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{
                  borderColor: GOLD_BORDER,
                  backgroundColor: IVORY,
                }}
              >
                <RetryableGalleryImage
                  src={img.src}
                  alt=""
                  width={img.width}
                  height={img.height}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="rounded-xl object-cover"
                  style={{ imageOrientation: "from-image" }}
                  priority={idx < 4}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxIdx != null && images[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "color-mix(in srgb, var(--color-welcome-navy) 40%, black 60%)" }}
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative flex w-full max-w-6xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={`${cinzel.className} absolute left-2 top-1/2 -translate-y-1/2 rounded-full border px-4 py-2.5 text-lg shadow-lg transition-all duration-200 hover:scale-110 sm:left-4`}
              style={{
                background: NAV_GOLD,
                borderColor: GOLD_BORDER,
                color: IVORY,
              }}
              onClick={() => setLightboxIdx((i) => (i == null ? null : (i - 1 + images.length) % images.length))}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <RetryableGalleryImage
              src={images[lightboxIdx].src}
              alt=""
              width={images[lightboxIdx].width}
              height={images[lightboxIdx].height}
              sizes="100vw"
              className="rounded-xl object-contain"
              style={{
                border: `1px solid ${GOLD_BORDER}`,
                imageOrientation: "from-image",
              }}
              priority
              variant="lightbox"
            />
            <button
              type="button"
              className={`${cinzel.className} absolute right-2 top-1/2 -translate-y-1/2 rounded-full border px-4 py-2.5 text-lg shadow-lg transition-all duration-200 hover:scale-110 sm:right-4`}
              style={{
                background: NAV_GOLD,
                borderColor: GOLD_BORDER,
                color: IVORY,
              }}
              onClick={() => setLightboxIdx((i) => (i == null ? null : (i + 1) % images.length))}
              aria-label="Next photo"
            >
              ›
            </button>
            <button
              type="button"
              className={`${cinzel.className} absolute right-3 top-3 rounded-full border px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] shadow-lg transition-all duration-200 hover:scale-105`}
              style={{
                backgroundColor: NAVY,
                borderColor: GOLD_BORDER,
                color: IVORY,
              }}
              onClick={() => setLightboxIdx(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className={`${cinzel.className} rounded-full border px-6 py-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] shadow-lg transition-all duration-200 hover:scale-105 sm:text-[0.6875rem] sm:tracking-[0.2em]`}
          style={{
            background: NAV_GOLD,
            borderColor: GOLD_BORDER,
            color: IVORY,
          }}
          onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          Back to top
        </button>
      </div>
    </div>
  )
}
