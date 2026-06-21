import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme, event?: React.MouseEvent | MouseEvent | Event) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "juse-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme, event?: React.MouseEvent | MouseEvent | Event) => {
      if (!document.startViewTransition || !event || !('clientX' in event)) {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
        return
      }

      const x = event.clientX
      const y = event.clientY

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      document.documentElement.style.setProperty("--x", `${x}px`)
      document.documentElement.style.setProperty("--y", `${y}px`)
      document.documentElement.style.setProperty("--r", `${endRadius}px`)

      document.documentElement.classList.add("theme-transitioning")
      const transition = document.startViewTransition(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        if (newTheme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          root.classList.add(systemTheme)
        } else {
          root.classList.add(newTheme)
        }
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      })

      transition.finished.finally(() => {
        document.documentElement.classList.remove("theme-transitioning")
      })
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
