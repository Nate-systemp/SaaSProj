import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('flowboard-theme')
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement

    // Add transitioning class for smooth theme swap
    root.classList.add('theme-transitioning')
    root.setAttribute('data-theme', theme)
    localStorage.setItem('flowboard-theme', theme)

    const timeout = setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 350)

    return () => clearTimeout(timeout)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
