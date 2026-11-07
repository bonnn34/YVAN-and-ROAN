import { siteConfig } from "@/content/site";

/** Mobile invitation photo marquee — `public/mobile-background` */
export const MOBILE_BACKGROUND_PHOTO_COUNT = 38;

export const MOBILE_BACKGROUND_PHOTOS = Array.from(
  { length: MOBILE_BACKGROUND_PHOTO_COUNT },
  (_, index) => encodeURI(`/mobile-background/couple (${index + 1}).webp`),
);

/** Loader background photos for preloading — set in content/site.ts (loadingScreen.backgroundPhotos). */
export const LOADING_BG_PHOTOS = (siteConfig.loadingScreen.backgroundPhotos ?? []).map((src) => encodeURI(src));

/** Desktop (768px+) marquee photos — set in content/site.ts (loadingScreen.backgroundPhotosDesktop). */
export const LOADING_BG_PHOTOS_DESKTOP = (siteConfig.loadingScreen.backgroundPhotosDesktop ?? []).map((src) =>
  encodeURI(src),
);

/** Photos used by the loader / envelope / home hero marquee — enough to fill both rows */
export const BACKGROUND_PHOTO_LIMIT = 12;

/** Marquee tile <Image> settings — shared with the preloads in app/layout.tsx so they hit the same file */
export const MARQUEE_IMAGE_SIZES = "(min-width: 768px) 38vw, 82vw";
export const MARQUEE_IMAGE_QUALITY = 55;
