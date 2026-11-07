'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import {
  BACKGROUND_PHOTO_LIMIT,
  LOADING_BG_PHOTOS,
  MARQUEE_IMAGE_QUALITY,
  MARQUEE_IMAGE_SIZES,
  MOBILE_BACKGROUND_PHOTOS,
} from '@/lib/loading-bg-photos';
import './loading-screen.css';

export { LOADING_BG_PHOTOS };

export const MOBILE_BG_PHOTOS = MOBILE_BACKGROUND_PHOTOS;

const MARQUEE_SAMPLE_SIZE = 24;
const MARQUEE_EAGER_COUNT = 3;

/** White wash over the photo strip — one value for the loader and the envelope so the
 *  hand-off between them doesn't shift the tone. */
export const PHOTO_BACKGROUND_VEIL = 0.48;

// One clock for every photo strip on the page: each marquee starts its slide that many
// seconds in (negative animation-delay, see --marquee-elapsed in loading-screen.css), so
// the loader, the envelope and the home hero always show the strip at the same spot and
// cross-fade without the photos jumping.
let marqueeEpoch: number | null = null;
function marqueeElapsedSeconds() {
  const now = performance.now();
  if (marqueeEpoch === null) marqueeEpoch = now;
  return (now - marqueeEpoch) / 1000;
}

// Photos that have already decoded once show straight away in later strips
// (no second fade-in from blank during the loader → envelope cross-fade)
const loadedPhotos = new Set<string>();

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function pickRandomPhotos(photos: readonly string[], count: number) {
  const next = [...photos];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next.slice(0, Math.min(count, next.length));
}

function splitMarqueeRows(photos: readonly string[]) {
  const top: string[] = [];
  const bottom: string[] = [];
  photos.forEach((src, index) => {
    (index % 2 === 0 ? top : bottom).push(src);
  });
  return [top, bottom] as const;
}

function MarqueeRow({
  photos,
  copies,
  direction,
  eagerCount,
  lazyOnly = false,
}: {
  photos: readonly string[];
  copies: number;
  direction: 'left' | 'right';
  eagerCount: number;
  lazyOnly?: boolean;
}) {
  return (
    <div className={`loading-screen__marquee-row loading-screen__marquee-row--${direction}`}>
      <div className="loading-screen__slide-track">
        {Array.from({ length: copies }, (_, copy) => (
          <div key={copy} className="loading-screen__slide-strip">
            {photos.map((src, index) => {
              const eager = copy === 0 && index < eagerCount;
              return (
                <div key={`${copy}-${src}`} className="loading-screen__slide-photo">
                  <Image
                    data-loaded={loadedPhotos.has(src) ? '' : undefined}
                    src={src}
                    alt=""
                    fill
                    sizes={MARQUEE_IMAGE_SIZES}
                    quality={MARQUEE_IMAGE_QUALITY}
                    // lazyOnly: both phone + desktop strips are in the HTML and CSS hides one;
                    // lazy images in a hidden strip are never fetched, and the visible tiles hit the
                    // media-matched preloads in app/layout.tsx
                    priority={lazyOnly ? false : eager}
                    loading={lazyOnly ? 'lazy' : undefined}
                    draggable={false}
                    decoding="async"
                    fetchPriority={copy === 0 && index < 2 ? 'high' : 'low'}
                    className="object-cover"
                    // Each photo fades in once it has decoded instead of popping in
                    onLoad={(e) => {
                      loadedPhotos.add(src);
                      e.currentTarget.setAttribute('data-loaded', '');
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhotoMarquee({
  photos,
  copies,
  variant,
  shuffle = true,
  lazyOnly = false,
}: {
  photos: readonly string[];
  copies: number;
  variant: 'mobile' | 'desktop' | 'loader';
  shuffle?: boolean;
  lazyOnly?: boolean;
}) {
  const compact = !shuffle || photos.length <= 5;
  const [selected, setSelected] = useState(() =>
    compact ? [...photos] : photos.slice(0, MARQUEE_SAMPLE_SIZE),
  );

  useEffect(() => {
    if (compact) {
      setSelected([...photos]);
      return;
    }
    setSelected(pickRandomPhotos(photos, MARQUEE_SAMPLE_SIZE));
  }, [photos, compact]);

  const [top, bottom] = compact
    ? [selected, [...selected].reverse()]
    : splitMarqueeRows(selected);
  // Only the first tiles on screen load eagerly; the rest wait their turn
  const eagerCount = Math.min(selected.length, MARQUEE_EAGER_COUNT);

  // Join the shared clock before the first paint (see marqueeElapsedSeconds)
  const rootRef = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    rootRef.current?.style.setProperty('--marquee-elapsed', `${marqueeElapsedSeconds().toFixed(3)}s`);
  }, []);

  return (
    <div ref={rootRef} className={`loading-screen__marquee loading-screen__marquee--${variant}`}>
      <MarqueeRow photos={top} copies={copies} direction="left" eagerCount={eagerCount} lazyOnly={lazyOnly} />
      <MarqueeRow photos={bottom} copies={copies} direction="right" eagerCount={eagerCount} lazyOnly={lazyOnly} />
    </div>
  );
}

/**
 * Sliding photo marquee with a soft white wash — drop-in for BackgroundVideo
 * behind the plain loader and envelope (fills its positioned parent).
 */
export function PhotoBackground({
  photos,
  desktopPhotos,
  veil = PHOTO_BACKGROUND_VEIL,
}: {
  /** Portrait photos (public/mobile-background) — phones */
  photos: readonly string[];
  /** Landscape photos (public/desktop-background) — 768px and up; falls back to `photos` */
  desktopPhotos?: readonly string[];
  /** Strength of the white wash over the photos (0–1). */
  veil?: number;
}) {
  const reduceMotion = useReducedMotion();
  const copies = reduceMotion ? 1 : 2;
  const mobile = useMemo(
    () => (photos.length > 0 ? photos : MOBILE_BG_PHOTOS).slice(0, BACKGROUND_PHOTO_LIMIT),
    [photos],
  );
  const desktop = useMemo(
    () => (desktopPhotos && desktopPhotos.length > 0 ? desktopPhotos : mobile).slice(0, BACKGROUND_PHOTO_LIMIT),
    [desktopPhotos, mobile],
  );
  if (mobile.length === 0) return null;

  // Both strips are rendered straight away (also in the server HTML) so the photos show on the
  // very first paint — no waiting for hydration to measure the screen. CSS shows the phone strip
  // below 768px and the desktop strip from 768px up (.background-video__strip--*).
  // Same order every time: the photos preloaded in app/layout.tsx are the ones shown first,
  // and the loader → envelope → home hero keep one continuous strip.
  return (
    <div className="background-video" aria-hidden="true">
      <div className="background-video__strip background-video__strip--mobile">
        <PhotoMarquee photos={mobile} copies={copies} variant="loader" shuffle={false} lazyOnly />
      </div>
      <div className="background-video__strip background-video__strip--desktop">
        <PhotoMarquee photos={desktop} copies={copies} variant="loader" shuffle={false} lazyOnly />
      </div>
      <div className="background-video__veil" style={{ opacity: veil, zIndex: 2 }} />
    </div>
  );
}

/** Fixed photo marquee + veil — continuity from loading screen (photos display only). */
export function InvitePhotoBackdrop({
  className = '',
  photos,
}: {
  className?: string;
  photos?: readonly string[];
}) {
  const reduceMotion = useReducedMotion();
  const copies = reduceMotion ? 1 : 2;
  const resolved =
    photos && photos.length > 0
      ? photos
      : LOADING_BG_PHOTOS.length > 0
        ? LOADING_BG_PHOTOS
        : MOBILE_BG_PHOTOS;

  if (resolved.length === 0) return null;

  return (
    <div className={`invite-photo-backdrop ${className}`.trim()} aria-hidden="true">
      <PhotoMarquee photos={resolved} copies={copies} variant="mobile" />
      <div className="loading-screen__backdrop-veil" />
    </div>
  );
}
