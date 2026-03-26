import React, { createContext, useContext, useEffect, useState } from "react"

export type ThemePreference = "dark" | "light" | "system"
type ResolvedTheme = Exclude<ThemePreference, "system">

interface ThemeContextType {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
}

const THEME_STORAGE_KEY = "clubrm-theme"
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "dark"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove("dark", "light")
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return "dark"
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system") {
      return storedTheme
    }

    return "system"
  })
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => getSystemTheme())

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const syncTheme = () => {
      const nextResolvedTheme = theme === "system" ? getSystemTheme() : theme
      setResolvedTheme(nextResolvedTheme)
      applyTheme(nextResolvedTheme)
    }

    syncTheme()
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)

    mediaQuery.addEventListener("change", syncTheme)
    return () => mediaQuery.removeEventListener("change", syncTheme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
