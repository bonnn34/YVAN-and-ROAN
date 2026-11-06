import type { CSSProperties } from "react"

/** Reference palette — peach, blush, midnight navy, slate navy and white. */
export const coastalPalette = {
  peach: "#FBC8AF",
  lavenderBlue: "#FFFAF7",
  blueGray: "#858CA4",
  dustyRose: "#333C63",
  teal: "#333C63",
  body: "#25253D",
  title: "#333C63",
  deep: "#25253D",
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
