'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { parseWeddingDate } from '@/lib/wedding-date';
import { InviteParticles } from '@/components/loader/InviteParticles';
import { InvitePhotoBackdrop, PhotoBackground } from '@/components/loader/invite-photo-backdrop';
import { TintedDeco } from '@/components/tinted-deco';
import { SectionBackdrop } from '@/components/section-backdrop';
import './envelope-invite.css';

const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
});

const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
});

interface HeroProps {
  onOpen: () => void;
  onTransitionStart?: () => void;
  visible: boolean;
  enterFromLoading?: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Short joining words in the headline ("A Celebration of Love") are set in script — matches the loading screen
const SCRIPT_WORDS = new Set(['the', 'of', 'and', '&', 'a']);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const photoInteractEase: Transition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] };
const focusLiftEase: Transition = { duration: 1.15, ease: [0.22, 1, 0.36, 1] };
const revealEntryEase: Transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
const buttonEntryEase: Transition = { duration: 0.95, ease: [0.16, 1, 0.3, 1] };

type PhotoSide = 'left' | 'center' | 'right' | 'right-inner';

type EnvelopePhase =
  | 'idle'
  | 'seal-press'
  | 'seal-break'
  | 'flap-open'
  | 'rising'
  | 'photos'
  | 'revealed'
  | 'cta';

function getFocusLiftPhase(phase: EnvelopePhase): 'idle' | 'opening' | 'photos' | 'revealed' | 'cta' {
  if (phase === 'idle') return 'idle';
  if (
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising'
  ) {
    return 'opening';
  }
  if (phase === 'photos') return 'photos';
  if (phase === 'revealed') return 'revealed';
  return 'cta';
}

const photoEmergenceEase: Transition = { duration: 2.35, ease: [0.22, 1, 0.18, 1] };
const letterEmergenceEase: Transition = { duration: 3.05, ease: [0.5, 0.02, 0.14, 1] };
const flapEase: Transition = { duration: 1.1, ease: [0.65, 0, 0.35, 1] };
const inviteExitEase: Transition = { duration: 1.65, ease: [0.22, 1, 0.36, 1], delay: 0.75 };
const inviteEnterEase: Transition = { duration: 1.2, ease: [0.22, 1, 0.36, 1] };
const letterExitEase: Transition = { duration: 1.55, ease: [0.16, 1, 0.3, 1] };
const inviteRevealLeadMs = 460;
const INVITE_EXIT_MS = 2500;
// "View the invitation" photo reveal — the envelope, letter and portraits never move:
//   pull   — right on click, a photo card slides up out of the pocket
//   center — it lifts off and glides to the middle of the screen (envelope softly dims behind)
//   expand — it opens to full screen
//   fade   — the screen fades into the home hero (same photo)
const PHOTO_PULL_MS = 3000;
const PHOTO_CENTER_MS = 950;
const PHOTO_CENTER_HOLD_MS = 450;
const PHOTO_EXPAND_MS = 1100;
const PHOTO_HOLD_MS = 800;
const PHOTO_FADE_MS = 1000;
// Slow pull in three beats: the top edge peeks over the pocket lip, pauses, then glides all the way out
const PHOTO_RISE_S = 2.8;
const photoCardRiseEase: Transition = {
  duration: PHOTO_RISE_S,
  times: [0, 0.32, 0.46, 1],
  ease: [[0.33, 0, 0.2, 1], 'easeInOut', [0.45, 0, 0.15, 1]],
};
const photoCenterEase: Transition = { duration: PHOTO_CENTER_MS / 1000, ease: [0.22, 1, 0.36, 1] };
const photoExpandEase: Transition = { duration: PHOTO_EXPAND_MS / 1000, ease: [0.76, 0, 0.24, 1] };

type FlyRect = { top: number; left: number; width: number; height: number };

export const Hero: React.FC<HeroProps> = ({
  onOpen,
  onTransitionStart,
  visible,
  enterFromLoading = false,
}) => {
  const siteConfig = useSiteConfig();
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const isPlain = content.display === 'plain';
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;
  const reduceMotion = useReducedMotion();
  const openedRef = useRef(false);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<EnvelopePhase>('idle');
  const [liveMessage, setLiveMessage] = useState('');
  const [liftedPhoto, setLiftedPhoto] = useState<PhotoSide | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [exitStage, setExitStage] = useState<'none' | 'pull' | 'center' | 'expand' | 'fade'>('none');
  // Where the photo card sat in the envelope when it lifted off, and where it rests mid-screen
  const [flyRect, setFlyRect] = useState<FlyRect | null>(null);
  const [centerRect, setCenterRect] = useState<FlyRect | null>(null);
  const photoCardRef = useRef<HTMLDivElement>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const groomName = siteConfig.couple.groomNickname;
  const brideName = siteConfig.couple.brideNickname;
  const coupleNames = `${groomName} & ${brideName}`;

  const letterDateNumeric = useMemo(() => {
    const parsed = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date);
    const wedding = new Date(`${parsed.month} ${parsed.day}, ${parsed.year}`);
    // Month as its short name ("Dec"), day and year as numbers
    if (Number.isNaN(wedding.getTime())) {
      const monthDate = new Date(`${parsed.month} 1, ${parsed.year}`);
      const month = Number.isNaN(monthDate.getTime())
        ? String(parsed.month).slice(0, 3)
        : monthDate.toLocaleString('en-US', { month: 'short' });
      const day = String(parsed.day).padStart(2, '0');
      const year = String(parsed.year).slice(-2);
      return `${month} | ${day} | ${year}`;
    }
    const month = wedding.toLocaleString('en-US', { month: 'short' });
    const day = String(wedding.getDate()).padStart(2, '0');
    const year = String(wedding.getFullYear()).slice(-2);
    return `${month} | ${day} | ${year}`;
  }, [siteConfig.ceremony.date, siteConfig.wedding.date]);

  const weddingDateGhost = useMemo(() => {
    const [month, day, year] = letterDateNumeric.split(' | ');
    return { month, day, year };
  }, [letterDateNumeric]);

  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const backgroundPhotosDesktop = useMemo(
    () => (content.backgroundPhotosDesktop ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotosDesktop],
  );
  const showPhotoBackdrop = !isPlain && backgroundPhotos.length > 0;

  // One portrait of the groom (left) and one of the bride (right), revealed as the envelope opens
  const portraitPair = useMemo(() => {
    const portraits = content.portraits ?? defaultSiteConfig.loadingScreen.portraits;
    if (!portraits?.groom || !portraits?.bride) return [];
    return [
      { src: encodeURI(portraits.groom), side: 'left' as const, alt: `${groomName} portrait` },
      { src: encodeURI(portraits.bride), side: 'right' as const, alt: `${brideName} portrait` },
    ];
  }, [content.portraits, groomName, brideName]);

  const envelopeFlowers = content.envelopeFlowers ?? defaultSiteConfig.loadingScreen.envelopeFlowers;
  // Same photo as the home hero cover, so the reveal flows straight into it
  const exitPhotoSrc = content.coverPhoto ?? defaultSiteConfig.loadingScreen.coverPhoto;
  const exitPhoto = exitPhotoSrc ? encodeURI(exitPhotoSrc) : '';
  const usePhotoExit = Boolean(exitPhoto) && !reduceMotion;

  const envelopePolaroids = useMemo(() => {
    const photos = (content.photos ?? []).map((src) => encodeURI(src));
    const pick = (index: number) => photos[index % photos.length];
    if (!photos.length) return { mobile: [] as const, desktop: [] as const };
    return {
      mobile: [
        { src: pick(0), side: 'left' as const },
        { src: pick(1), side: 'right' as const },
      ] as const,
      desktop: [
        { src: pick(0), side: 'left' as const },
        { src: pick(1), side: 'center' as const },
        { src: pick(2), side: 'right' as const },
        { src: pick(3), side: 'right-inner' as const },
      ] as const,
    };
  }, [content.photos]);

  const countdownText = useMemo(() => {
    const weddingDate = new Date(siteConfig.wedding.date);
    if (Number.isNaN(weddingDate.getTime())) return '';
    const now = new Date();
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, siteConfig.wedding.date]);

  const flapIsOpen =
    phase === 'flap-open' ||
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  const contentsVisible =
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  const sealGone =
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!visible) {
      openedRef.current = false;
      setPhase('idle');
      setLiveMessage('');
      setLiftedPhoto(null);
      setIsExiting(false);
      setExitStage('none');
      setFlyRect(null);
      setCenterRect(null);
    }
  }, [visible]);

  useEffect(() => {
    // The photo reveal keeps the page locked so nothing behind the envelope shifts
    if (!visible || (isExiting && !usePhotoExit)) return;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [visible, isExiting, usePhotoExit]);

  useEffect(() => {
    if (phase === 'cta') {
      enterBtnRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  useEffect(() => {
    if (
      phase === 'idle' ||
      phase === 'seal-press' ||
      phase === 'seal-break' ||
      phase === 'flap-open' ||
      phase === 'rising'
    ) {
      setLiftedPhoto(null);
    }
  }, [phase]);

  const toggleLiftedPhoto = useCallback((side: PhotoSide) => {
    setLiftedPhoto((current) => (current === side ? null : side));
  }, []);

  const handleEnterInvitation = useCallback(async () => {
    if (isExiting || phase !== 'cta') return;

    setIsExiting(true);
    setLiveMessage('Opening your invitation.');

    if (reduceMotion) {
      onTransitionStart?.();
      onOpen();
      return;
    }

    if (usePhotoExit) {
      setExitStage('pull');
      await wait(PHOTO_PULL_MS);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = photoCardRef.current?.getBoundingClientRect();
      const from =
        rect && rect.width > 0
          ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
          : { top: vh * 0.45, left: vw * 0.3, width: vw * 0.4, height: vw * 0.5 };
      // Portrait card in the middle of the screen
      const w = Math.min(vw * 0.78, 360, vh * 0.56);
      const h = w * 1.28;
      setFlyRect(from);
      setCenterRect({ top: (vh - h) / 2, left: (vw - w) / 2, width: w, height: h });
      setExitStage('center');
      await wait(PHOTO_CENTER_MS + PHOTO_CENTER_HOLD_MS);
      setExitStage('expand');
      await wait(PHOTO_EXPAND_MS + PHOTO_HOLD_MS);
      // Hero mounts underneath while the photo screen fades away
      onTransitionStart?.();
      setExitStage('fade');
      await wait(PHOTO_FADE_MS);
      onOpen();
      return;
    }

    await wait(inviteRevealLeadMs);
    onTransitionStart?.();
    await wait(INVITE_EXIT_MS - inviteRevealLeadMs);
    onOpen();
  }, [isExiting, onOpen, onTransitionStart, phase, reduceMotion, usePhotoExit]);

  const runOpenSequence = useCallback(async () => {
    if (reduceMotion) {
      setPhase('cta');
      setLiveMessage('Invitation opened.');
      return;
    }

    setLiveMessage('Pressing seal.');
    setPhase('seal-press');
    await wait(180);

    setLiveMessage('Breaking seal.');
    setPhase('seal-break');
    await wait(320);

    setLiveMessage('Opening envelope.');
    setPhase('flap-open');
    await wait(1100);

    setLiveMessage('Invitation rising.');
    setPhase('rising');
    await wait(isPlain ? 2400 : 3200);

    setLiveMessage('Photos revealing.');
    setPhase('photos');
    await wait(isPlain ? 2600 : 3600);

    setPhase('revealed');
    await wait(650);

    setPhase('cta');
    setLiveMessage('Invitation ready.');
  }, [isPlain, reduceMotion]);

  const handleSealClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (openedRef.current || phase !== 'idle') return;
      openedRef.current = true;
      void runOpenSequence();
    },
    [phase, runOpenSequence]
  );

  /* Match reference sample: single flap, rotateX(180deg) positive, origin top center */
  const flapVariants: Variants = {
    closed: { rotateX: 0 },
    open: { rotateX: 180 },
  };

  const sealVariants: Variants = {
    idle: { scale: 1, opacity: 1, rotate: 0, y: 0 },
    press: { scale: 0.94, opacity: 1, rotate: 0, y: 2 },
    // Seal stays on the envelope: it lifts off the flap and settles on the pocket lip
    break: { scale: 1, opacity: 1, rotate: 0, y: 0 },
  };

  /*
    Letter starts deep in the pocket (positive y) and pulls up through the lip.
    Mobile rises higher during entry; desktop keeps its settled position.
  */
  const letterVariants: Variants = useMemo(
    () => ({
      hidden: { y: '100%', scale: 0.86, opacity: 1, rotate: -0.4 },
      rising: {
        y: isMobileViewport ? '-22%' : '14%',
        scale: 1,
        opacity: 1,
        rotate: 0,
      },
      out: {
        y: isMobileViewport ? '-22%' : '14%',
        scale: 1,
        opacity: 1,
        rotate: 0,
      },
      exitPortal: {
        y: '-118%',
        scale: 3.35,
        opacity: 1,
        rotate: 0,
        zIndex: 48,
      },
    }),
    [isMobileViewport],
  );

  const photoLeftVariants: Variants = {
    hidden: { y: '58%', x: '12%', rotate: -4, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '0%', rotate: -7, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '0%', rotate: -8, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '0%', rotate: -7.5, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '0%', rotate: -8, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '-108%', rotate: -24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const photoCenterVariants: Variants = {
    hidden: { y: '62%', x: '0%', rotate: 0, scale: 0.7, opacity: 0, zIndex: 11 },
    emerge: { y: '0%', x: '0%', rotate: 2, scale: 1, opacity: 1, zIndex: 15 },
    hover: { y: '-6%', x: '0%', rotate: 2.5, scale: 1.05, opacity: 1, zIndex: 27 },
    press: { y: '-3%', x: '0%', rotate: 2.2, scale: 1.02, opacity: 1, zIndex: 25 },
    lifted: { y: '-12%', x: '0%', rotate: 3, scale: 1.08, opacity: 1, zIndex: 31 },
    exit: { y: '-108%', x: '0%', rotate: 10, scale: 0.72, opacity: 0, zIndex: 10 },
  };

  const photoRightVariants: Variants = {
    hidden: { y: '58%', x: '-12%', rotate: 4, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '0%', rotate: 7, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '0%', rotate: 8, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '0%', rotate: 7.5, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '0%', rotate: 8, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '108%', rotate: 24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const photoRightInnerVariants: Variants = {
    hidden: { y: '62%', x: '-10%', rotate: 1, scale: 0.7, opacity: 0, zIndex: 11 },
    emerge: { y: '0%', x: '0%', rotate: -2, scale: 1, opacity: 1, zIndex: 15 },
    hover: { y: '-6%', x: '0%', rotate: -2.5, scale: 1.05, opacity: 1, zIndex: 27 },
    press: { y: '-3%', x: '0%', rotate: -2.2, scale: 1.02, opacity: 1, zIndex: 25 },
    lifted: { y: '-12%', x: '0%', rotate: -3, scale: 1.08, opacity: 1, zIndex: 31 },
    exit: { y: '-18%', x: '108%', rotate: 16, scale: 0.72, opacity: 0, zIndex: 10 },
  };

  const mobileEnvelopePhotoLeftVariants: Variants = {
    hidden: { y: '58%', x: '6%', rotate: -1, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '-8%', rotate: -4, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '-8%', rotate: -4.5, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '-8%', rotate: -4.2, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '-8%', rotate: -4.5, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '-108%', rotate: -24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const mobileEnvelopePhotoRightVariants: Variants = {
    hidden: { y: '58%', x: '-6%', rotate: 1, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '8%', rotate: 4, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '8%', rotate: 4.5, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '8%', rotate: 4.2, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '8%', rotate: 4.5, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '108%', rotate: 24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const revealCopyContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.16, delayChildren: 0.1 },
    },
    exit: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const revealCopyItemVariants: Variants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: revealEntryEase,
    },
    exit: {
      opacity: 0,
      y: 28,
      filter: 'blur(6px)',
      transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
    },
  };

  const buttonRevealVariants: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.92, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: buttonEntryEase,
    },
    exit: {
      opacity: 0,
      y: 18,
      scale: 1.06,
      filter: 'blur(8px)',
      transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
    },
  };

  const focusLiftVariants: Variants = {
    idle: { y: 0, scale: 1, opacity: 1 },
    opening: { y: 0, scale: 1, opacity: 1 },
    photos: { y: 0, scale: 1, opacity: 1 },
    revealed: { y: 0, scale: 1, opacity: 1 },
    cta: { y: 0, scale: 1, opacity: 1 },
    exit: {
      y: -18,
      scale: 0.94,
      opacity: 0,
      transition: { duration: 1.15, delay: 0.52, ease: [0.4, 0, 0.2, 1] },
    },
    // Photo reveal: letter and portraits stay exactly where they are and simply fade
    fadeAway: {
      y: 0,
      scale: 1,
      opacity: 0,
      transition: { duration: 0.8, delay: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
  };

  if (!mounted) return null;

  // With the photo reveal, the envelope stays put while the card is pulled out, then fades
  const envelopeLeaving = usePhotoExit
    ? exitStage === 'expand' || exitStage === 'fade'
    : isExiting;

  const letterState =
    phase === 'idle' ||
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open'
      ? 'hidden'
      : phase === 'rising'
        ? 'rising'
        : 'out';

  const photoState =
    phase === 'idle' ||
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising'
      ? 'hidden'
      : 'emerge';

  const photosInteractive = photoState === 'emerge';

  const sealState =
    phase === 'idle' ? 'idle' : phase === 'seal-press' ? 'press' : 'break';

  // Envelope fold geometry in % of the envelope box — mirrors the CSS custom properties
  // (--env-flap-h, and the open-state --pocket-v / --pocket-side) for each breakpoint
  const foldGeo: FoldGeo = isMobileViewport
    ? { flap: 58, pocketV: 54, pocketSide: 18, scale: 1 }
    : { flap: 50, pocketV: 86, pocketSide: 78, scale: 0.4 };

  return (
    <motion.div
      className={`env-invite-screen${isPlain ? ' env-invite-screen--plain' : ''}${isPlain && enterFromLoading && visible && !reduceMotion ? ' is-arriving' : ''} ${visible ? '' : 'is-hidden'}`}
      // Photo reveal keeps the open-envelope look the whole time (letter stays under the pocket lip)
      data-phase={isExiting && !usePhotoExit ? 'exiting' : phase}
      aria-hidden={!visible}
      initial={false}
      animate={
        isExiting
          ? { opacity: usePhotoExit && exitStage !== 'fade' ? 1 : 0, y: 0, scale: 1 }
          : visible
            ? { opacity: 1, y: 0, scale: 1 }
            : isPlain
              ? // plain: the background matches the loader's, so only fade — the envelope itself arrives (CSS .is-arriving)
                { opacity: 0, y: 0, scale: 1 }
              : { opacity: 0, y: 18, scale: 0.985 }
      }
      transition={
        isExiting
          ? usePhotoExit
            ? { duration: PHOTO_FADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }
            : inviteExitEase
          : visible && enterFromLoading && !reduceMotion
            ? inviteEnterEase
            : { duration: reduceMotion ? 0.2 : 0.01 }
      }
      style={{
        pointerEvents: !visible || isExiting ? 'none' : undefined,
        ...(isPlain && {
          '--env-plain-bg': plainTheme.background,
          '--env-plain-ink': plainTheme.text,
          '--env-plain-accent': plainTheme.accent,
        }),
      } as React.CSSProperties}
    >
      {showPhotoBackdrop && (
        <div className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--envelope" aria-hidden="true">
          <InvitePhotoBackdrop className="invite-photo-backdrop--envelope" photos={backgroundPhotos} />
        </div>
      )}

      {isPlain && (
        <>
          <PhotoBackground photos={backgroundPhotos} desktopPhotos={backgroundPhotosDesktop} />
          <div className="env-invite-plain-corners" aria-hidden="true">
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
                className={`env-invite-plain-corner-slot--${pos} pointer-events-none absolute ${className}`}
              >
                {/* Corners keep their original artwork colors (no tint) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="env-invite-plain-corner-img" />
              </div>
            ))}
          </div>
          <div className="env-invite-plain-frame" aria-hidden="true" />
          {/* Paper grain + rising pink hearts, same as the loader and invitation sections
              (section-backdrop.tsx); no extra wash — the photo background has its blush veil */}
          <SectionBackdrop wash={false} overlay />
        </>
      )}

      {!isPlain && <div className="env-invite-readability-scrim" aria-hidden="true" />}

      {!reduceMotion && (
        <div className="env-invite-particles pointer-events-none" aria-hidden="true">
          <InviteParticles count={28} />
        </div>
      )}

      <div className="env-invite-bg-glow pointer-events-none" aria-hidden="true" />

      <div className="env-invite-ghost-date pointer-events-none select-none" aria-hidden="true">
        <span className="env-invite-ghost-date-part">{weddingDateGhost.month}</span>
        <span className="env-invite-ghost-date-sep" aria-hidden="true" />
        <span className="env-invite-ghost-date-part">{weddingDateGhost.day}</span>
        <span className="env-invite-ghost-date-sep" aria-hidden="true" />
        <span className="env-invite-ghost-date-part">{weddingDateGhost.year}</span>
      </div>

      {usePhotoExit && phase === 'cta' && !isExiting && (
        // Loads the reveal photo ahead of the click so the card is ready instantly
        <div className="env-invite-exit-preload" aria-hidden="true">
          <Image src={exitPhoto} alt="" fill priority sizes="100vw" />
        </div>
      )}

      {/* The photo card lifts off the envelope, rests in the middle, then opens to full screen */}
      {usePhotoExit && flyRect && centerRect && exitStage !== 'none' && exitStage !== 'pull' && (
        <>
          {/* Soft blush veil over the (unmoved) envelope so the card stands out */}
          <motion.div
            className="env-invite-exit-dim"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
          <motion.div
            className="env-invite-exit-glow"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={
              exitStage === 'center'
                ? { opacity: 0.85, scale: 1 }
                : { opacity: 0, scale: 1.8 }
            }
            transition={{ duration: exitStage === 'center' ? 0.9 : 1.1, ease: 'easeOut' }}
          />
          <motion.div
            className="env-invite-exit-photo"
            aria-hidden="true"
            initial={{ ...flyRect, padding: 6, borderRadius: 4, rotate: 0 }}
            animate={
              exitStage === 'center'
                ? { ...centerRect, padding: 8, borderRadius: 6, rotate: [0, -5, -2] }
                : {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    padding: 0,
                    borderRadius: 0,
                    rotate: 0,
                  }
            }
            transition={exitStage === 'center' ? photoCenterEase : photoExpandEase}
          >
            <div className="env-invite-exit-photo__frame">
              <motion.div
                className="env-invite-exit-photo__img"
                initial={{ scale: 1 }}
                animate={{ scale: exitStage === 'center' ? 1 : 1.07 }}
                transition={{ duration: (PHOTO_EXPAND_MS + PHOTO_HOLD_MS + PHOTO_FADE_MS) / 1000, ease: 'easeOut' }}
              >
                <Image src={exitPhoto} alt="" fill priority sizes="100vw" className="object-cover" />
              </motion.div>
              <motion.span
                className="env-invite-exit-photo__veil"
                initial={{ opacity: 0 }}
                animate={{ opacity: exitStage === 'center' ? 0 : 1 }}
                transition={{ duration: 0.8, delay: exitStage === 'center' ? 0 : PHOTO_EXPAND_MS / 1000 - 0.3 }}
              />
            </div>
          </motion.div>
        </>
      )}

      {isExiting && !reduceMotion && !usePhotoExit && (
        <>
          <motion.div
            className="env-invite-exit-ring"
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 3.45, opacity: [0, 0.62, 0] }}
            transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1], times: [0, 0.34, 1], delay: 0.06 }}
          />
          <motion.div
            className="env-invite-exit-bloom"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.28 }}
            animate={{ opacity: [0, 0.96, 0.72, 0], scale: [0.28, 1.08, 1.52, 1.78] }}
            transition={{
              duration: 1.72,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.26, 0.58, 1],
              delay: 0.1,
            }}
          />
          <motion.div
            className="env-invite-exit-shimmer"
            aria-hidden="true"
            initial={{ x: '-130%', opacity: 0 }}
            animate={{ x: '130%', opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.25, ease: 'easeInOut', delay: 0.22 }}
          />
          <motion.div
            className="env-invite-exit-curtain env-invite-exit-curtain--left"
            aria-hidden="true"
            initial={{ x: '-105%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.95, delay: 1.15, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.div
            className="env-invite-exit-curtain env-invite-exit-curtain--right"
            aria-hidden="true"
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.95, delay: 1.15, ease: [0.65, 0, 0.35, 1] }}
          />
        </>
      )}

      <p className="env-invite-live" aria-live="polite">
        {liveMessage}
      </p>

      <div className="env-invite-stage">
        <div className="env-invite-cluster">
          <motion.div
            className="env-invite-focus"
            variants={focusLiftVariants}
            initial="idle"
            animate={envelopeLeaving ? (usePhotoExit ? 'fadeAway' : 'exit') : getFocusLiftPhase(phase)}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : envelopeLeaving
                  ? { duration: usePhotoExit ? 0.7 : 1.15, delay: usePhotoExit ? 0.15 : 0.52, ease: [0.4, 0, 0.2, 1] }
                  : focusLiftEase
            }
          >
          <motion.div
            className="env-invite-scene"
            initial={false}
            animate={
              envelopeLeaving
                ? { opacity: 0, scale: usePhotoExit ? 1 : 0.98, y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={
              isExiting
                ? { duration: 1.1, delay: 0.68, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.01 }
            }
          >
          <div className="env-invite-ground-shadow" aria-hidden="true" />
          <div className="env-invite-ground-contact" aria-hidden="true" />

          <div className="env-invite-envelope">
            {/* Flap behind body when open — rendered first in paint order */}
            <div className="env-invite-flap-shadow" aria-hidden="true" />
            <motion.div
              className="env-invite-flap"
              variants={flapVariants}
              initial="closed"
              animate={flapIsOpen ? 'open' : 'closed'}
              transition={flapEase}
              style={{ transformOrigin: 'top center' }}
              aria-hidden="true"
            >
              {isPlain && (
                <>
                  {/* Light catching the folded paper edge of the flap */}
                  <svg className="env-invite-flap-edge" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline points="0,0 50,100 100,0" />
                  </svg>
                  {/* Inside of the flap — shows once the flap has swung open */}
                  <span className="env-invite-flap-liner" />
                </>
              )}
            </motion.div>

            <div className="env-invite-envelope-body">
              {/* Back panel */}
              <div className="env-invite-back" aria-hidden="true" />

              {/* Interior shadow — only visible once contents rise */}
              <div className="env-invite-interior" aria-hidden="true" />

              {/* Contents — clipped inside pocket */}
              <div className="env-invite-contents-clip" aria-hidden={!contentsVisible}>
              <div className="env-invite-contents">
                <div className="env-invite-emerge-stack">
                  <motion.div
                    className="env-invite-letter"
                    variants={letterVariants}
                    initial="hidden"
                    animate={isExiting && !usePhotoExit ? 'exitPortal' : letterState}
                    transition={
                      isExiting && !usePhotoExit
                        ? { ...letterExitEase, delay: 0.14 }
                        : letterState === 'rising'
                          ? {
                              ...letterEmergenceEase,
                              opacity: { duration: 0 },
                            }
                          : { duration: 0.01 }
                    }
                  >
                    <div className="env-invite-letter-frame" aria-hidden="true" />
                    <div className="env-invite-letter-inner">
                      {isPlain && plainInvite.ornament && (
                        <TintedDeco src={plainInvite.ornament} className="env-invite-letter-ornament" />
                      )}
                      <span className="env-invite-letter-label" aria-label={content.headline}>
                        {content.headline.split(/\s+/).filter(Boolean).map((word, i, words) => {
                          const script = SCRIPT_WORDS.has(word.toLowerCase());
                          // Longer titles break before a mid-title joining word ("A Celebration / of Love")
                          const breakBefore = words.length >= 4 && script && i > 0 && i < words.length - 1;
                          return (
                            <React.Fragment key={i}>
                              {breakBefore && <span className="env-invite-letter-label__break" aria-hidden="true" />}
                              <span
                                aria-hidden="true"
                                className={script ? 'env-invite-letter-label__script' : 'env-invite-letter-label__word'}
                              >
                                {word}
                              </span>
                            </React.Fragment>
                          );
                        })}
                      </span>
                      <span className="env-invite-letter-date">{letterDateNumeric}</span>
                      <span className="env-invite-letter-invited">{content.eyebrow}</span>
                      <h2 className="env-invite-letter-names env-invite-letter-names--text" aria-label={coupleNames}>
                        <span className={`${theSeasons.className} env-invite-names__nick`} aria-hidden="true">
                          {groomName}
                        </span>
                        <span className={`${aboveTheBeyond.className} env-invite-names__and`} aria-hidden="true">
                          and
                        </span>
                        <span className={`${theSeasons.className} env-invite-names__nick`} aria-hidden="true">
                          {brideName}
                        </span>
                      </h2>
                    </div>
                  </motion.div>

                  {usePhotoExit && isExiting && (
                    // Photo card tucked in the pocket — slides up out of the envelope on "View the invitation"
                    <motion.div
                      ref={photoCardRef}
                      className="env-invite-exit-card"
                      aria-hidden="true"
                      // Overlays the letter's box (absolutely — it never pushes the letter), starts deep
                      // in the pocket and rises out in front of it
                      initial={{ y: '100%', rotate: 0, scale: 0.96 }}
                      animate={{
                        // Peek values put the card's top edge just above the pocket lip (the letter sits higher on phones)
                        y: ['100%', isMobileViewport ? '-4%' : '18%', isMobileViewport ? '-9%' : '13%', isMobileViewport ? '-82%' : '-40%'],
                        rotate: [0, -1.5, 1, 0],
                        scale: [0.96, 0.97, 0.97, 1],
                      }}
                      transition={photoCardRiseEase}
                      style={{ zIndex: 32, opacity: exitStage === 'pull' ? 1 : 0 }}
                    >
                      <div className="env-invite-exit-card__photo">
                        <Image src={exitPhoto} alt="" fill sizes="100vw" className="object-cover" />
                        {/* Light sweep across the photo as it comes out */}
                        <motion.span
                          className="env-invite-exit-card__shine"
                          initial={{ x: '-120%' }}
                          animate={{ x: '120%' }}
                          transition={{ duration: 1.1, delay: PHOTO_RISE_S * 0.55, ease: 'easeInOut' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {isPlain && envelopeFlowers && (
                    // Bouquet tucked inside the envelope — peeks out above the pocket once it opens
                    <div className="env-invite-inner-flowers" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={envelopeFlowers} alt="" className="env-invite-inner-flowers__img env-invite-inner-flowers__img--left" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={envelopeFlowers} alt="" className="env-invite-inner-flowers__img env-invite-inner-flowers__img--right" />
                    </div>
                  )}

                  {isPlain ? (
                    portraitPair.length > 0 && (
                      <div className="env-invite-photos-emerge env-invite-photos-emerge--portraits">
                        {portraitPair.map((photo, index) => (
                          <PolaroidPhoto
                            key={`portrait-${photo.side}-${photo.src}`}
                            side={photo.side}
                            src={photo.src}
                            alt={photo.alt}
                            variants={
                              photo.side === 'left'
                                ? mobileEnvelopePhotoLeftVariants
                                : mobileEnvelopePhotoRightVariants
                            }
                            photoState={photoState}
                            liftedPhoto={liftedPhoto}
                            onToggle={toggleLiftedPhoto}
                            interactive={photosInteractive}
                            emergenceDelay={index === 0 ? 0.25 : 0.6}
                            reduceMotion={reduceMotion}
                            isExiting={isExiting && !usePhotoExit}
                            envelopePair
                          />
                        ))}
                      </div>
                    )
                  ) : (
                  <div className="env-invite-photos-emerge">
                    {isMobileViewport
                      ? envelopePolaroids.mobile.map((photo, index) => (
                          <PolaroidPhoto
                            key={`mobile-${photo.side}-${photo.src}`}
                            side={photo.side}
                            src={photo.src}
                            alt={photo.side === 'left' ? `${groomName} portrait` : `${brideName} portrait`}
                            variants={
                              photo.side === 'left'
                                ? mobileEnvelopePhotoLeftVariants
                                : mobileEnvelopePhotoRightVariants
                            }
                            photoState={photoState}
                            liftedPhoto={liftedPhoto}
                            onToggle={toggleLiftedPhoto}
                            interactive={photosInteractive}
                            emergenceDelay={index === 0 ? 0.55 : 1.0}
                            reduceMotion={reduceMotion}
                            isExiting={isExiting}
                            envelopePair
                          />
                        ))
                      : envelopePolaroids.desktop.map((photo, index) => {
                          const delays = [0.55, 1.0, 1.45, 1.7] as const;
                          const variantsBySide: Record<PhotoSide, Variants> = {
                            left: photoLeftVariants,
                            center: photoCenterVariants,
                            right: photoRightVariants,
                            'right-inner': photoRightInnerVariants,
                          };
                          return (
                            <PolaroidPhoto
                              key={`desktop-${photo.side}-${photo.src}`}
                              side={photo.side}
                              src={photo.src}
                              alt={coupleNames}
                              variants={variantsBySide[photo.side]}
                              photoState={photoState}
                              liftedPhoto={liftedPhoto}
                              onToggle={toggleLiftedPhoto}
                              interactive={photosInteractive}
                              emergenceDelay={delays[index] ?? 1.7}
                              reduceMotion={reduceMotion}
                              isExiting={isExiting}
                            />
                          );
                        })}
                  </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Closed front skin — solid cover, hides when open */}
            <div className="env-invite-front-closed" aria-hidden="true">
              {isPlain ? (
                <EnvelopeClosedFolds geo={foldGeo} />
              ) : (
                <>
                  <div className="env-invite-fold env-invite-fold--tl" />
                  <div className="env-invite-fold env-invite-fold--bl" />
                  <div className="env-invite-fold env-invite-fold--br" />
                  <div className="env-invite-fold env-invite-fold--b" />
                  <svg
                    className="env-invite-creases"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <line x1="0" y1="0" x2="50" y2="50" />
                    <line x1="100" y1="0" x2="50" y2="50" />
                    <line x1="0" y1="100" x2="50" y2="50" />
                    <line x1="100" y1="100" x2="50" y2="50" />
                  </svg>
                </>
              )}
            </div>

            <div className="env-invite-hinge" aria-hidden="true" />
            </div>

            {/* Front pocket — above body so paper stays tucked inside */}
            <div className="env-invite-pocket" aria-hidden="true">
              <div className="env-invite-pocket-front" />
              <div className="env-invite-pocket-left" />
              <div className="env-invite-pocket-right" />
              {isPlain && <EnvelopePocketFolds geo={foldGeo} />}
            </div>

            {/* Wax seal — centered on flap junction */}
            <div className={`env-invite-seal-wrap${sealGone ? ' is-opened' : ''}`}>
              <motion.button
                type="button"
                className="env-invite-seal-btn"
                variants={sealVariants}
                initial="idle"
                animate={sealState}
                transition={
                  sealState === 'break'
                    ? { duration: 0.4, ease: 'easeOut' }
                    : { duration: 0.16, ease: 'easeOut' }
                }
                onClick={handleSealClick}
                disabled={phase !== 'idle'}
                aria-label="Break the wax seal to open the invitation"
              >
                <Image
                  src={content.sealImage ?? defaultSiteConfig.loadingScreen.sealImage}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 148px, 132px"
                  className="env-invite-seal-img object-contain"
                />
              </motion.button>
            </div>

          </div>
        </motion.div>

          <p className="env-invite-hint">{content.hintText}</p>

          </motion.div>
        </div>
      </div>

      <div className="env-invite-cta-bar" aria-live="off">
        <motion.div
          className="env-invite-reveal-copy"
          variants={revealCopyContainerVariants}
          initial="hidden"
          animate={
            isExiting
              ? 'exit'
              : phase === 'revealed' || phase === 'cta'
                ? 'visible'
                : 'hidden'
          }
        >
          {countdownText && (
            <motion.p
              className="env-invite-days-to-go"
              variants={revealCopyItemVariants}
            >
              {countdownText}
            </motion.p>
          )}
          <motion.h2 variants={revealCopyItemVariants}>{content.message}</motion.h2>
        </motion.div>

        <motion.button
          ref={enterBtnRef}
          type="button"
          className="env-invite-enter-btn"
          variants={buttonRevealVariants}
          initial="hidden"
          animate={
            isExiting
              ? 'exit'
              : phase === 'cta'
                ? 'visible'
                : 'hidden'
          }
          whileHover={
            phase === 'cta' && !isExiting && !reduceMotion
              ? { y: -2, scale: 1.02 }
              : undefined
          }
          whileTap={
            phase === 'cta' && !isExiting && !reduceMotion
              ? { y: 0, scale: 0.98 }
              : undefined
          }
          onClick={handleEnterInvitation}
          disabled={phase !== 'cta' || isExiting}
        >
          {content.enterButtonText}
        </motion.button>
      </div>
    </motion.div>
  );
};

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

interface PolaroidPhotoProps {
  side: PhotoSide;
  src: string;
  alt: string;
  variants: Variants;
  photoState: 'hidden' | 'emerge';
  liftedPhoto: PhotoSide | null;
  onToggle: (side: PhotoSide) => void;
  interactive: boolean;
  emergenceDelay: number;
  reduceMotion: boolean | null;
  isExiting?: boolean;
  envelopePair?: boolean;
}

const PHOTO_EXIT_DELAY: Record<PhotoSide, number> = {
  left: 0.06,
  center: 0.1,
  right: 0.04,
  'right-inner': 0.14,
};

function PolaroidPhoto({
  side,
  src,
  alt,
  variants,
  photoState,
  liftedPhoto,
  onToggle,
  interactive,
  emergenceDelay,
  reduceMotion,
  isExiting = false,
  envelopePair = false,
}: PolaroidPhotoProps) {
  const canInteract = interactive && !reduceMotion && !isExiting;

  const animateState = isExiting
    ? 'exit'
    : photoState === 'hidden'
      ? 'hidden'
      : liftedPhoto === side
        ? 'lifted'
        : 'emerge';

  return (
    <motion.button
      type="button"
      className={`env-invite-polaroid env-invite-polaroid--${side}${liftedPhoto === side ? ' is-lifted' : ''}${envelopePair ? ' env-invite-polaroid--envelope-pair' : ''}`}
      variants={variants}
      initial="hidden"
      animate={animateState}
      whileHover={canInteract && liftedPhoto !== side ? 'hover' : undefined}
      whileTap={canInteract ? 'press' : undefined}
      transition={
        reduceMotion
          ? { duration: 0.01 }
          : isExiting
            ? { duration: 0.92, ease: [0.4, 0, 0.2, 1], delay: PHOTO_EXIT_DELAY[side] }
            : photoState === 'hidden'
              ? { duration: 0.01 }
              : animateState === 'emerge' && liftedPhoto === null
                ? { ...photoEmergenceEase, delay: emergenceDelay }
                : photoInteractEase
      }
      onClick={(e) => {
        e.stopPropagation();
        if (interactive) onToggle(side);
      }}
      disabled={!interactive}
      aria-label={`View photo: ${alt}`}
      aria-pressed={liftedPhoto === side}
    >
      <div className="env-invite-polaroid-photo">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover env-invite-polaroid-img"
          sizes={envelopePair ? '(max-width: 767px) 42vw, 140px' : '(min-width: 768px) 310px, 140px'}
          priority
        />
      </div>
    </motion.button>
  );
}
type FoldGeo = {
  /** Top flap tip (--env-flap-h) */
  flap: number;
  /** Open pocket: V point (--pocket-v) and where the side flaps meet the edges (--pocket-side) */
  pocketV: number;
  pocketSide: number;
  /** Shadow size multiplier — the desktop envelope fills the screen, so units are much larger */
  scale: number;
};

// Warm brown shading so the folds read naturally on the peach paper
const FOLD_SHADE = '#A65A47';

/** A paper fold: a crisp dark crease with light catching the edge just below it */
function FoldCrease({ d }: { d: string }) {
  return (
    <>
      <path className="env-invite-paper-folds__crease" d={d} />
      <path className="env-invite-paper-folds__edge" d={d} transform="translate(0,0.6)" />
    </>
  );
}

/** Shared SVG defs: edge shading for side flaps, a lit bottom flap and a soft blur */
function FoldDefs({ id, scale }: { id: string; scale: number }) {
  return (
    <defs>
      <linearGradient id={`${id}-side-l`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={FOLD_SHADE} stopOpacity="0.14" />
        <stop offset="1" stopColor={FOLD_SHADE} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-side-r`} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor={FOLD_SHADE} stopOpacity="0.14" />
        <stop offset="1" stopColor={FOLD_SHADE} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-bottom`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.2" />
        <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.06" />
        <stop offset="1" stopColor={FOLD_SHADE} stopOpacity="0.06" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={1.1 * scale} />
      </filter>
    </defs>
  );
}

/**
 * Closed envelope back: side flaps, the bottom flap lapped over them, and the soft
 * shadows cast by the bottom flap and the closed top flap.
 */
function EnvelopeClosedFolds({ geo }: { geo: FoldGeo }) {
  const { flap: f, scale: k } = geo;
  const bottom = `M0,100 L43,${f + 1} Q50,${f - 5} 57,${f + 1} L100,100`;
  return (
    <svg className="env-invite-paper-folds" viewBox="0 0 100 100" preserveAspectRatio="none">
      <FoldDefs id="envc" scale={k} />
      <defs>
        <clipPath id="envc-above-bottom">
          <path d={`M0,0 H100 V100 L57,${f + 1} Q50,${f - 5} 43,${f + 1} L0,100 Z`} />
        </clipPath>
        <clipPath id="envc-below-flap">
          <path d={`M0,0 L50,${f} L100,0 V100 H0 Z`} />
        </clipPath>
      </defs>
      <path d={`M0,0 L50,${f + 2} L0,100 Z`} fill="url(#envc-side-l)" />
      <path d={`M100,0 L50,${f + 2} L100,100 Z`} fill="url(#envc-side-r)" />
      <g clipPath="url(#envc-above-bottom)">
        <path
          className="env-invite-paper-folds__shadow"
          d={bottom}
          strokeWidth={2.4 * k}
          filter="url(#envc-soft)"
          transform={`translate(0,${-0.8 * k})`}
        />
      </g>
      <path d={`${bottom} Z`} fill="url(#envc-bottom)" />
      <FoldCrease d={bottom} />
      <g clipPath="url(#envc-below-flap)">
        <path
          className="env-invite-paper-folds__shadow"
          d={`M0,0 L50,${f} L100,0`}
          strokeWidth={3 * k}
          filter="url(#envc-soft)"
          transform={`translate(0,${1.6 * k})`}
        />
      </g>
      <path className="env-invite-paper-folds__crease" d={`M0,0 L50,${f} L100,0`} />
    </svg>
  );
}

/**
 * Open envelope pocket — same paper shading as the closed back, plus the shadow the
 * pocket lip casts onto the letter and photos tucked inside. Drawn above the pocket
 * panels (shapes match their clip-paths in envelope-invite.css).
 */
function EnvelopePocketFolds({ geo }: { geo: FoldGeo }) {
  const { pocketV: v, pocketSide: sd, scale: k } = geo;
  const sides = `M0,${sd} L50,${v} L100,${sd}`;
  const bottom = `M0,100 L50,${v} L100,100`;
  return (
    <svg className="env-invite-paper-folds env-invite-paper-folds--pocket" viewBox="0 0 100 100" preserveAspectRatio="none">
      <FoldDefs id="envp" scale={k} />
      <defs>
        <clipPath id="envp-above-pocket">
          <path d={`M0,0 H100 V${sd} L50,${v} L0,${sd} Z`} />
        </clipPath>
        <clipPath id="envp-above-bottom">
          <path d={`M0,0 H100 V100 L50,${v} L0,100 Z`} />
        </clipPath>
      </defs>
      {/* Shadow of the pocket lip on the letter + photos */}
      <g clipPath="url(#envp-above-pocket)">
        <path
          className="env-invite-paper-folds__shadow env-invite-paper-folds__shadow--contents"
          d={sides}
          strokeWidth={3.2 * k}
          filter="url(#envp-soft)"
          transform={`translate(0,${-1.2 * k})`}
        />
      </g>
      <path d={`M0,${sd} L50,${v} L0,100 Z`} fill="url(#envp-side-l)" />
      <path d={`M100,${sd} L50,${v} L100,100 Z`} fill="url(#envp-side-r)" />
      <FoldCrease d={sides} />
      <g clipPath="url(#envp-above-bottom)">
        <path
          className="env-invite-paper-folds__shadow"
          d={bottom}
          strokeWidth={2.4 * k}
          filter="url(#envp-soft)"
          transform={`translate(0,${-0.8 * k})`}
        />
      </g>
      <path d={`${bottom} Z`} fill="url(#envp-bottom)" />
      <FoldCrease d={bottom} />
    </svg>
  );
}
