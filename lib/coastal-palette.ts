import type { CSSProperties } from "react"

/** Reference palette — peach, blush, midnight navy, slate navy and white. */
export const coastalPalette = {
  peach: "#F7B7A3",
  lavenderBlue: "#FFFAF7",
  blueGray: "#8E9AB8",
  dustyRose: "#1A3A6E",
  teal: "#1A3A6E",
  body: "#002059",
  title: "#1A3A6E",
  deep: "#002059",
  cream: "#FFFFFF",
} as const

export const displayScript: CSSProperties = {
  fontFamily: "'Brightwall', cursive",
  fontWeight: 400,
}

export const coastalLightBg = coastalPalette.lavenderBlue
export const coastalDarkBg = coastalPalette.teal

export const coastalLightGradient = coastalLightBg
export const coastalDarkGradient = coastalDarkBg

export const coastalCardShadow = `0 16px 48px color-mix(in srgb, ${coastalPalette.teal} 14%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.72)`

export const coastalTitleShadow =
  "0 2px 4px rgba(255, 255, 255, 0.85), 0 0 16px rgba(133, 140, 164, 0.45)"
