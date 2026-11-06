"use client"

import { useEffect, useState } from "react"

// Resolve a CSS color variable (var chains, color-mix, ...) to a literal rgb() string.
// QR codes draw to canvas / SVG attributes, which can't read CSS variables directly.
export function useCssColor(variable: string, fallback: string) {
  const [color, setColor] = useState(fallback)

  useEffect(() => {
    const probe = document.createElement("span")
    probe.style.display = "none"
    probe.style.color = `var(${variable}, ${fallback})`
    document.body.appendChild(probe)
    const computed = getComputedStyle(probe).color
    probe.remove()
    // color-mix computes to color(srgb ...) — paint one pixel to normalize it to rgb()
    const ctx = document.createElement("canvas").getContext("2d")
    if (!ctx || !computed) return
    ctx.fillStyle = computed
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    setColor(`rgb(${r}, ${g}, ${b})`)
  }, [variable, fallback])

  return color
}

export const QR_FG_FALLBACK = "#25253D"
export const QR_BG_FALLBACK = "#FFFFFF"

export function useQrColors() {
  return {
    fg: useCssColor("--color-qr-fg", QR_FG_FALLBACK),
    bg: useCssColor("--color-qr-bg", QR_BG_FALLBACK),
  }
}
