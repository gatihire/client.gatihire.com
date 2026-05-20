"use client"

import { createContext, useCallback, useContext, useMemo } from "react"

type Theme = "light"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme() {
  document.documentElement.classList.remove("dark")
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme: Theme = "light"

  const setTheme = useCallback(() => {
    applyTheme()
  }, [])

  const toggleTheme = useCallback(() => {
    applyTheme()
  }, [])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [setTheme, toggleTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const v = useContext(ThemeContext)
  if (!v) throw new Error("useTheme must be used within ThemeProvider")
  return v
}
