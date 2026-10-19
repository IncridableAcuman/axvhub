import React, { useEffect, useState } from 'react'
import { ThemeContext, type Theme } from './ThemeContext'
import { userPreferenceApi } from '@/api'

const THEME_STORAGE_KEY = 'axm_nexus_theme'
const MOTION_STORAGE_KEY = 'axm_nexus_reduced_motion'

const safeMatchMedia = (query: string): boolean => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      return window.matchMedia(query).matches
    } catch {
      return false
    }
  }
  return false
}

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: Theme }> = ({
  children,
  defaultTheme = 'system',
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    }
    return defaultTheme
  })

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MOTION_STORAGE_KEY)
      if (stored !== null) {
        return stored === 'true'
      }
      return safeMatchMedia('(prefers-reduced-motion: reduce)')
    }
    return false
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') return 'dark'
      if (theme === 'light') return 'light'
      return safeMatchMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement

    const updateResolved = () => {
      const active: 'light' | 'dark' =
        theme === 'system'
          ? safeMatchMedia('(prefers-color-scheme: dark)')
            ? 'dark'
            : 'light'
          : theme

      setResolvedTheme(active)
      if (active === 'dark') {
        root.classList.add('dark')
        root.setAttribute('data-theme', 'dark')
      } else {
        root.classList.remove('dark')
        root.setAttribute('data-theme', 'light')
      }
    }

    updateResolved()

    if (theme === 'system' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const listener = () => updateResolved()
        media.addEventListener?.('change', listener)
        return () => media.removeEventListener?.('change', listener)
      } catch {
        // ignore
      }
    }
  }, [theme])

  // Reduced motion effect
  useEffect(() => {
    const root = document.documentElement
    if (reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [reducedMotion])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    setThemeState(newTheme)

    try {
      const storedUser = localStorage.getItem('axm_nexus_user')
      if (storedUser) {
        userPreferenceApi.updatePreferences({ theme: newTheme }).catch(() => {})
      }
    } catch {
      // ignore
    }
  }

  const setReducedMotion = (reduced: boolean) => {
    localStorage.setItem(MOTION_STORAGE_KEY, String(reduced))
    setReducedMotionState(reduced)

    try {
      const storedUser = localStorage.getItem('axm_nexus_user')
      if (storedUser) {
        userPreferenceApi.updatePreferences({ reducedMotion: reduced }).catch(() => {})
      }
    } catch {
      // ignore
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, reducedMotion, setReducedMotion }}>
      {children}
    </ThemeContext.Provider>
  )
}
