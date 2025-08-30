// Theme configuration system

import { useState, useEffect } from 'react'

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('jyotish-theme')
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('jyotish-theme', theme)
  }, [theme])

  return { theme, setTheme }
}
