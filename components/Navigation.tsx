'use client'

import { useState, useEffect } from 'react'

interface NavigationProps {
  isConnected: boolean
  uptime?: number
}

export default function Navigation({ isConnected, uptime }: NavigationProps) {
  const [isDark, setIsDark] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('statsmonit-theme') || 'light'
    const isDarkMode = savedTheme === 'dark'
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('statsmonit-theme', newTheme)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'Initializing...'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <nav className="glass-effect sticky top-0 z-40 px-4 sm:px-6 py-4 mb-6 shadow-lg border-b border-gray-300/70 dark:border-gray-200/20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <i className="fas fa-chart-line text-2xl sm:text-3xl text-blue-600 dark:text-blue-500"></i>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold animated-text">StatsMonit</h1>
          </div>
          <div className="hidden lg:flex items-center space-x-2 text-sm text-secondary">
            <i className="fas fa-server text-xs"></i>
            <span>System Monitor</span>
            <span className="text-accent">•</span>
            <span>Real-time</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="status-pill hover:scale-105 transition-all duration-200 touch-manipulation"
            title="Toggle Theme"
          >
            <i className={`fas ${isDark ? 'fa-moon' : 'fa-sun'} text-yellow-500 dark:text-yellow-400`}></i>
          </button>
          <button
            onClick={toggleFullscreen}
            className="hidden sm:block status-pill hover:scale-105 transition-all duration-200"
            title="Toggle Fullscreen"
          >
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-secondary`}></i>
          </button>
          <div className="status-pill flex items-center">
            <span
              className={`status-indicator ${
                isConnected ? 'indicator-green' : 'indicator-yellow'
              } animate-pulse`}
            ></span>
            <span className="font-medium hidden sm:inline text-secondary">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
            <span className="sm:hidden text-xs">•</span>
          </div>
          <div className="hidden md:block status-pill">
            <i className="fas fa-clock text-xs mr-1 text-secondary"></i>
            <span className="text-secondary">{formatUptime(uptime)}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
