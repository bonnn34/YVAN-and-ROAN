"use client"

import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: "primary" | "secondary" | "outline"
  className?: string
}

export function Button({ children, onClick, href, variant = "primary", className = "" }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-colors inline-block"
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
  }

  if (href) {
    return (
      <a href={href} className={`${baseStyles} ${variants[variant]} ${className}`}>
        {children}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
