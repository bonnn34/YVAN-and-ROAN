// Motif roles (CSS variables from app/globals.css)
export const sectionPalette = {
  forest: "var(--color-motif-deep)",
  sage: "var(--color-motif-medium)",
  mustard: "var(--color-motif-blush)",
  butter: "var(--color-motif-silver)",
  cream: "var(--color-motif-cream)",
} as const

// Page background for invitation surfaces — built from app/globals.css tokens,
// so it follows the palette (no hardcoded colors).
export const sectionBackground = `
  radial-gradient(920px 520px at 50% 6%, color-mix(in srgb, white 70%, transparent) 0%, transparent 55%),
  radial-gradient(640px 420px at 12% 88%, color-mix(in srgb, var(--color-highlight) 30%, transparent) 0%, transparent 58%),
  radial-gradient(560px 380px at 92% 78%, color-mix(in srgb, var(--color-motif-yellow) 18%, transparent) 0%, transparent 55%),
  linear-gradient(180deg, color-mix(in srgb, #8E9AB8 45%, white) 0%, var(--color-motif-cream) 45%, var(--invite-page-bg) 100%)
`.trim()

export const sectionText = {
  title: "var(--color-welcome-navy)",
  script: "var(--color-welcome-green)",
  body: "var(--color-welcome-text)",
  heading: "var(--color-welcome-navy)",
  label: "var(--color-welcome-heading)",
  accent: "var(--color-welcome-green)",
} as const

export const sectionDividerLineStyle = {
  background:
    "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent), transparent)",
} as const

export const sectionDividerLineStyleLeft = {
  background:
    "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent), transparent)",
} as const
