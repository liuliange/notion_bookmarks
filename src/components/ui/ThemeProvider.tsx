"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  defaultTheme = "simple-dark",
}: {
  children: React.ReactNode
  defaultTheme?: string
}) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  )
}
