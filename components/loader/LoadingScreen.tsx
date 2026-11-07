'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { useReducedMotion } from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { PhotoBackground } from '@/components/loader/invite-photo-backdrop';
import { TintedDeco } from '@/components/tinted-deco';
import { SectionBackdrop } from '@/components/section-backdrop';
import './loading-screen.css';

const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
});

const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
});

interface LoadingScreenProps {
  onComplete: () => void;
  onFadeStart?: () => void;
}

// Photo mode date cards: CSS-driven entrance (plays before hydration), one card after another
const DATE_CARD_START_MS = 800;
const DATE_CARD_STAGGER_MS = 3000; // one card every 3 seconds — Month, then Day, then Year
// Fanned resting tilt for Month / Day / Year
const DATE_CARD_TILT = ['-3deg', '0deg', '3deg'];
const FADE_OUT_MS = 1400;
// Plain mode handoff: the card tucks away first, then the envelope hero starts arriving
const PLAIN_HANDOFF_LEAD_MS = 550;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
// Lighter wash than the shared default so the couple's photos actually read behind the card
// (the vignette in loading-screen.css keeps the centre soft for the text)
const LOADER_PHOTO_VEIL = 0.3;

// Plain mode choreography — all CSS-delay driven so it plays in sync even before hydration:
// ornament → headline letters → countdown → names → date (day, month/year, weekday) → details
const PLAIN_LETTER_START_MS = 350;
const PLAIN_LETTER_STAGGER_MS = 75;
// Offsets below are measured from the moment the last headline letter has landed
const PLAIN_DATE_OFFSET_MS = 1300;
const PLAIN_DATE_STAGGER_MS = 800;

// Short joining words in the headline ("Save the Date") are set in script
const SCRIPT_WORDS = new Set(['the', 'of', 'and', '&', 'a']);

// Splits the headline into display words with a running letter index for staggering.
// Longer titles break onto a second line before a mid-title joining word
// ("A Celebration / of Love"); short ones like "Save the Date" stay on one line.
function splitHeadline(headline: string) {
  let letterIndex = 0;
  const words = headline.split(/\s+/).filter(Boolean);
  return words.map((word, i) => {
    const script = SCRIPT_WORDS.has(word.toLowerCase());
    const start = letterIndex;
    letterIndex += script ? 2 : word.length;
    const breakBefore = words.length >= 4 && script && i > 0 && i < words.length - 1;
    return { word, script, start, breakBefore };
  });
}

// Motif colors cycled through the floating petals (plain mode): mostly blush and
// dusty rose, a little sage, burgundy only once in a while
const MOTE_COLORS = [
  'var(--color-motif-blush)',
  'var(--color-motif-medium)',
  'var(--color-motif-blush)',
  'var(--color-motif-yellow)',
  'var(--color-motif-medium)',
  'var(--color-motif-blush)',
  'var(--color-motif-deep)',
]

// Colorful motes and petals drifting up behind the invitation card (plain mode)
const PLAIN_MOTES = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 4 + ((i * 7) % 6),
  dur: 14 + ((i * 5) % 10),
  delay: -((i * 3.1) % 18),
  drift: ((i % 2 === 0 ? 1 : -1) * (12 + ((i * 11) % 24))),
  spin: (i % 2 === 0 ? 1 : -1) * (180 + ((i * 47) % 360)),
  color: MOTE_COLORS[i % MOTE_COLORS.length],
  petal: i % 3 === 0,
}))

// "ZION EVENT PLACE" → "Zion Event Place" (the venue is stored in caps for other sections)
function toTitleCase(text: string) {
  return text.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, onFadeStart }) => {
  const siteConfig = useSiteConfig();
  // Fall back to the bundled config if a remote override is missing this block.
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const totalDurationMs = content.durationMs;
  const statusMessages = content.statusMessages;
  const isPlain = (content.loaderDisplay ?? content.display) === 'plain';
  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const backgroundPhotosDesktop = useMemo(
    () => (content.backgroundPhotosDesktop ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotosDesktop],
  );
  const showBackdrop = !isPlain && backgroundPhotos.length > 0;
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;

  const reduceMotion = useReducedMotion();
  const [fadeOut, setFadeOut] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const weddingDate = useMemo(() => new Date(siteConfig.wedding.date), [siteConfig.wedding.date]);
  const hasValidDate = !Number.isNaN(weddingDate.getTime());

  const countdownText = useMemo(() => {
    if (!hasValidDate) return '';
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, hasValidDate, now, weddingDate]);

  const dateParts = hasValidDate
    ? [
        weddingDate.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        String(weddingDate.getDate()).padStart(2, '0'),
        String(weddingDate.getFullYear()),
      ]
    : [];

  // Plain display: short month ("Dec") + full weekday for the engraved-style date line
  const silkDate = hasValidDate
    ? {
        weekday: weddingDate.toLocaleString('en-US', { weekday: 'long' }),
        month: weddingDate.toLocaleString('en-US', { month: 'short' }),
        day: String(weddingDate.getDate()).padStart(2, '0'),
        year: String(weddingDate.getFullYear()),
        label: weddingDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      }
    : null;

  const headlineWords = useMemo(() => splitHeadline(content.headline), [content.headline]);
  const headlineLetterCount = headlineWords.reduce(
    (n, w) => n + (w.script ? 2 : w.word.length),
    0,
  );
  // Plain mode: the rest of the card waits for the headline letters to land
  const afterHeadlineMs = isPlain
    ? PLAIN_LETTER_START_MS + headlineLetterCount * PLAIN_LETTER_STAGGER_MS + 250
    : 0;
  const revealDelay = (photoMs: number, plainOffsetMs: number) =>
    ({ '--ls-delay': `${isPlain ? afterHeadlineMs + plainOffsetMs : photoMs}ms` }) as React.CSSProperties;
  // Plain date steps: 0 = day, 1 = month & year, 2 = weekday
  const dateDelay = (step: number) =>
    ({
      '--ls-delay': `${afterHeadlineMs + PLAIN_DATE_OFFSET_MS + step * PLAIN_DATE_STAGGER_MS}ms`,
    }) as React.CSSProperties;

  const ceremonyLine = siteConfig.ceremony.time ?? '';
  const coupleNames = `${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname}`;


  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (statusMessages.length < 2) return;
    const step = totalDurationMs / statusMessages.length;
    const t = setInterval(
      () => setStatusIndex((i) => Math.min(i + 1, statusMessages.length - 1)),
      step,
    );
    return () => clearInterval(t);
  }, [statusMessages.length, totalDurationMs]);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let handoffTimer: ReturnType<typeof setTimeout> | undefined;
    const lead = isPlain && !reduceMotion ? PLAIN_HANDOFF_LEAD_MS : 0;
    const t = setTimeout(() => {
      setFadeOut(true);
      handoffTimer = setTimeout(() => {
        onFadeStart?.();
        fadeTimer = setTimeout(onComplete, reduceMotion ? 200 : FADE_OUT_MS);
      }, lead);
    }, totalDurationMs);
    return () => {
      clearTimeout(t);
      clearTimeout(handoffTimer);
      clearTimeout(fadeTimer);
    };
  }, [isPlain, onComplete, onFadeStart, reduceMotion, totalDurationMs]);

  return (
    <div
      className={`loading-screen loading-screen--invitation${isPlain ? ' loading-screen--plain' : ''} fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none h-dvh max-h-dvh w-screen${fadeOut ? ' is-fading' : ''}${reduceMotion ? ' is-reduced-motion' : ''}`}
      aria-live="polite"
      aria-busy={!fadeOut}
      aria-label="Loading invitation"
      style={
        {
          pointerEvents: fadeOut ? 'none' : 'auto',
          ...(isPlain && {
            '--ls-plain-bg': plainTheme.background,
            '--ls-plain-ink': plainTheme.text,
            '--ls-plain-accent': plainTheme.accent,
          }),
        } as React.CSSProperties
      }
    >
      {showBackdrop && (
        <>
          {/* Same photo strip + soft peach/ivory veil as the envelope (Hero.tsx), so the
              loader hands off to it without the background changing */}
          <PhotoBackground photos={backgroundPhotos} desktopPhotos={backgroundPhotosDesktop} />
          <div className="loading-screen__photo-layer" aria-hidden="true" />
        </>
      )}

      {isPlain && (
        <>
          <PhotoBackground
            photos={backgroundPhotos}
            desktopPhotos={backgroundPhotosDesktop}
            veil={LOADER_PHOTO_VEIL}
          />
          <div className="loading-screen__plain-photo-vignette" aria-hidden="true" />
          <div className="ls-plain-glow" aria-hidden="true" />
          {/* Paper grain + rising pink hearts, same as the invitation sections (section-backdrop.tsx);
              no extra wash — the photo background already has its blush veil */}
          <SectionBackdrop wash={false} overlay />
          {!reduceMotion && (
            <div className="ls-plain-motes" aria-hidden="true">
              {PLAIN_MOTES.map((m, i) => (
                <span
                  key={i}
                  className={`ls-plain-mote${m.petal ? ' ls-plain-mote--petal' : ''}`}
                  style={
                    {
                      '--x': `${m.x}%`,
                      '--size': `${m.size}px`,
                      '--dur': `${m.dur}s`,
                      '--delay': `${m.delay}s`,
                      '--drift': `${m.drift}px`,
                      '--spin': `${m.spin}deg`,
                      '--c': m.color,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Corner florals + thin double frame — shown in both display modes, same as the envelope (Hero.tsx) */}
      <div className="loading-screen__plain-corners" aria-hidden="true">
        {(
          [
            { src: cornerDecos.topLeft, pos: 'tl', className: 'left-0 top-0' },
            { src: cornerDecos.topRight, pos: 'tr', className: 'right-0 top-0' },
            { src: cornerDecos.bottomLeft, pos: 'bl', className: 'left-0 bottom-0' },
            { src: cornerDecos.bottomRight, pos: 'br', className: 'right-0 bottom-0' },
          ] as const
        ).filter(({ src }) => src).map(({ src, pos, className }) => (
          <div
            key={pos}
            className={`loading-screen__plain-corner-slot loading-screen__plain-corner-slot--${pos} pointer-events-none absolute ${className}`}
          >
            {/* Corners keep their original artwork colors (no tint) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="loading-screen__plain-corner-img" />
          </div>
        ))}
      </div>
      <div className="loading-screen__plain-frame" aria-hidden="true" />

      <div className="loading-screen__save-date">
        <header className="flex flex-col items-center w-full pt-10 sm:pt-14 md:pt-16 px-4 sm:px-6 flex-shrink-0">
          {isPlain && plainInvite.ornament && (
            <TintedDeco
              src={plainInvite.ornament}
              className="loading-screen__plain-ornament ls-ornament-in"
              style={{ '--ls-delay': '100ms' } as React.CSSProperties}
            />
          )}
          {isPlain ? (
            <h1 className="loading-screen__std-headline ls-headline" aria-label={content.headline}>
              {headlineWords.map(({ word, script, start, breakBefore }, wi) =>
                script ? (
                  <React.Fragment key={wi}>
                  {breakBefore && <span className="ls-headline__break" aria-hidden="true" />}
                  <span
                    className="ls-headline__script"
                    aria-hidden="true"
                    style={
                      {
                        '--ls-delay': `${PLAIN_LETTER_START_MS + start * PLAIN_LETTER_STAGGER_MS}ms`,
                      } as React.CSSProperties
                    }
                  >
                    {word}
                  </span>
                  </React.Fragment>
                ) : (
                  <span key={wi} className="ls-headline__word" aria-hidden="true">
                    {Array.from(word).map((ch, ci) => (
                      <span
                        key={ci}
                        className="ls-headline__letter"
                        style={
                          {
                            '--ls-delay': `${PLAIN_LETTER_START_MS + (start + ci) * PLAIN_LETTER_STAGGER_MS}ms`,
                          } as React.CSSProperties
                        }
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                ),
              )}
            </h1>
          ) : (
            <h1 className="loading-screen__std-headline ls-reveal" style={{ '--ls-delay': '0ms' } as React.CSSProperties}>
              {content.headline}
            </h1>
          )}
          {countdownText && (
            <p className="loading-screen__std-kicker ls-reveal" style={revealDelay(250, 0)}>
              {countdownText}
            </p>
          )}
        </header>

        {isPlain && plainInvite.lineAbove && (
          <p className="loading-screen__plain-line ls-reveal" style={revealDelay(350, 200)}>
            {plainInvite.lineAbove}
          </p>
        )}

        <div className="loading-screen__std-names-slot ls-reveal" style={revealDelay(450, 400)}>
          <h2 className="loading-screen__std-names loading-screen__std-names--text" aria-label={coupleNames}>
            <span className={`${theSeasons.className} ls-names__nick`} aria-hidden="true">
              {siteConfig.couple.groomNickname}
            </span>
            <span className={`${aboveTheBeyond.className} ls-names__and`} aria-hidden="true">
              and
            </span>
            <span className={`${theSeasons.className} ls-names__nick`} aria-hidden="true">
              {siteConfig.couple.brideNickname}
            </span>
          </h2>
        </div>

        {isPlain && plainInvite.lineBelow && (
          <p className="loading-screen__plain-line ls-reveal" style={revealDelay(550, 650)}>
            {plainInvite.lineBelow}
          </p>
        )}

        {isPlain && silkDate && (
          <div className="ls-silk-date px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0" role="img" aria-label={silkDate.label}>
            {/* Entry order: day rises in → month & year glide out from it → weekday draws in */}
            <p className="ls-silk-date__weekday is-visible" style={dateDelay(2)}>
              {silkDate.weekday}
            </p>
            <div className="ls-silk-date__row">
              <span className="ls-silk-date__side ls-silk-date__side--month is-visible" style={dateDelay(1)}>
                {silkDate.month}
              </span>
              <span className="ls-silk-date__day is-visible" style={dateDelay(0)}>
                {Array.from(silkDate.day).map((digit, i) => (
                  <span key={i} className="ls-silk-date__digit" style={{ '--i': i } as React.CSSProperties}>
                    <span className="ls-silk-date__digit-inner">{digit}</span>
                  </span>
                ))}
              </span>
              <span className="ls-silk-date__side ls-silk-date__side--year is-visible" style={dateDelay(1)}>
                {silkDate.year}
              </span>
            </div>
          </div>
        )}

        {!isPlain && dateParts.length > 0 && (
          <div className="ls-date-cards flex items-stretch justify-center gap-3 sm:gap-4 md:gap-6 px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0">
            {dateParts.map((value, i) => {
              const photo = content.photos[i % content.photos.length];
              return (
                <div
                  key={content.dateLabels[i] ?? i}
                  className="loading-screen__std-box ls-date-card relative flex-1 max-w-[28vw] sm:max-w-[140px] md:max-w-[160px] aspect-[3/4] overflow-hidden rounded-2xl"
                  style={
                    {
                      // Entrance timing + resting tilt (keyframes in loading-screen.css → .ls-date-card)
                      '--ls-card-delay': `${DATE_CARD_START_MS + i * DATE_CARD_STAGGER_MS}ms`,
                      '--ls-card-tilt': DATE_CARD_TILT[i] ?? '0deg',
                    } as React.CSSProperties
                  }
                >
                  {photo && (
                    <Image
                      src={encodeURI(photo)}
                      alt=""
                      fill
                      priority={i === 0}
                      className="loading-screen__std-box-img object-cover"
                      sizes="(max-width: 640px) 28vw, 160px"
                    />
                  )}
                  <div className="loading-screen__std-box-overlay absolute inset-0" />
                  {/* One light sweep across the card as it lands */}
                  <span className="ls-date-card__shine" aria-hidden="true" />
                  <div className="ls-date-card__meta absolute bottom-2.5 inset-x-0 sm:bottom-3 flex flex-col items-center">
                    <span className="loading-screen__std-box-num text-2xl sm:text-3xl md:text-4xl select-none leading-none text-center">
                      {value}
                    </span>
                    <span className="loading-screen__std-box-label text-[9px] sm:text-[10px] uppercase mt-1">
                      {content.dateLabels[i]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="loading-screen__std-footer flex flex-col items-center w-full pt-1 px-6 flex-shrink-0">
          {content.showCeremonyDetails && (ceremonyLine || siteConfig.ceremony.location) && (
            <div className="loading-screen__std-venue ls-reveal" style={revealDelay(900, 3200)}>
              {ceremonyLine && <span className="loading-screen__std-venue-time">{ceremonyLine}</span>}
              {siteConfig.ceremony.location && (
                <span className="loading-screen__std-venue-name">{toTitleCase(siteConfig.ceremony.location)}</span>
              )}
            </div>
          )}
          <p className="loading-screen__std-eyebrow ls-reveal" style={revealDelay(1100, 3400)}>
            {content.eyebrow}
          </p>
          <p className="loading-screen__std-copy ls-reveal" style={revealDelay(1250, 3550)}>
            {content.message}
          </p>
          <div className="loading-screen__std-rule" aria-hidden="true" />
          {statusMessages.length > 0 && (
            <p key={statusIndex} className="loading-screen__std-status">
              {statusMessages[statusIndex]}
            </p>
          )}
          <div
            className="w-full max-w-[200px] sm:max-w-xs mx-auto"
            role="progressbar"
            aria-label="Loading invitation"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="loading-screen__std-track">
              <div
                className="loading-screen__std-bar"
                style={{ animationDuration: `${totalDurationMs}ms` }}
              />
              {isPlain && !reduceMotion && (
                <span
                  className="ls-plain-progress-glow"
                  style={{ animationDuration: `${totalDurationMs}ms` }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
