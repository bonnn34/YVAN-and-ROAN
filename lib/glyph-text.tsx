import { Fragment } from "react"

/**
 * Display fonts (The Seasons, Goudy italic) draw some punctuation as ornaments — e.g. the
 * apostrophe in "You're" or "O'Brien" — so any character that isn't a letter, number or
 * space is set in Playfair Display italic instead. Runs of symbols stay together.
 * (Same idea as lib/story-glyph-text.tsx, but self-contained: no global CSS needed.)
 */
const GLYPHS = /([^\p{L}\p{N}\s]+)/gu

const glyphStyle = {
  fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: "normal",
  textTransform: "none",
} as const

export function GlyphText({ text }: { text: string }) {
  return (
    <>
      {text.split(GLYPHS).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} style={glyphStyle}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}
