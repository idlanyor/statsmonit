'use client'

import DoughnutChart from './DoughnutChart'

interface StatsCardProps {
  title: string
  icon: string
  iconColor: string
  value: string
  subtitle?: string
  chartValue: number
  chartColor: string
  children?: React.ReactNode
}

export default function StatsCard({
  title,
  icon,
  iconColor,
  value,
  subtitle,
  chartValue,
  chartColor,
  children,
}: StatsCardProps) {
  return (
    <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-opacity-50 transition-all duration-300 card-hover backdrop-blur-sm">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/60 dark:border-gray-700/60">
            <i className={`fas ${icon} text-sm sm:text-lg`} style={{ color: chartColor }}></i>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-primary">{title}</h2>
            {subtitle && <p className="text-xs text-secondary">{subtitle}</p>}
          </div>
        </div>
        <div className="status-pill bg-white/90 dark:bg-gray-800/90 text-primary dark:text-white backdrop-blur-sm text-xs sm:text-sm">
          <i className="fas fa-eye text-xs mr-1"></i>Live
        </div>
      </div>
      <div className="flex items-center justify-between">
        <DoughnutChart value={chartValue} color={chartColor} label={title} />
        <div className="text-right ml-3 sm:ml-4">
          <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-primary transition-colors duration-300">
            {value}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
