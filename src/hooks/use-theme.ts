import { useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "system"
    }
    return "system"
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement
      if (root.classList.contains("dark")) return "dark"
      if (root.classList.contains("light")) return "light"
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }
    return "light"
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let resolved: ResolvedTheme
    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(resolved)
    } else {
      resolved = theme
      root.classList.add(theme)
    }

    setResolvedTheme(resolved)
    
    // Listen for system theme changes when theme is set to "system"
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark")
        const newResolved = e.matches ? "dark" : "light"
        root.classList.add(newResolved)
        setResolvedTheme(newResolved)
      }
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
      }
      // Fallback for older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, [theme])

  const setThemeValue = (value: Theme) => {
    localStorage.setItem("theme", value)
    setTheme(value)
  }

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeValue,
  }
}

