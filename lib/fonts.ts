import localFont from "next/font/local"
import { Cinzel } from "next/font/google"

/**
 * Couple-name script from public/fonts/AnastasiaScript.ttf
 * (AnastasiaScript Regular.ttf is the same face).
 */
export const anastasiaScript = localFont({
  src: "../Font/AnastasiaScript.ttf",
  display: "swap",
  preload: true,
  variable: "--font-anastasia-script",
  weight: "400",
  style: "normal",
  adjustFontFallback: false,
})

/**
 * One shared Cinzel instance for every component.
 * Declaring `Cinzel({...})` separately in many files (especially ones loaded with
 * next/dynamic) can give the server and the browser different class names for the
 * same font, which shows up as a hydration mismatch. Import this one instead:
 *   import { cinzel } from "@/lib/fonts"
 */
export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
