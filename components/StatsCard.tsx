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
    <div className={`gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700/50 hover:border-${iconColor}-500/50 transition-all duration-300 card-hover backdrop-blur-sm`}>
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-1.5 sm:p-2 bg-${iconColor}-500/20 rounded-lg`}>
            <i className={`fas ${icon} text-${iconColor}-400 text-sm sm:text-lg`}></i>
          </div>
          <div>
            <h2 className={`text-lg sm:text-xl font-semibold text-${iconColor}-300`}>{title}</h2>
            {subtitle && <p className="text-xs text-black dark:text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className={`status-pill bg-${iconColor}-900/50 text-${iconColor}-300 backdrop-blur-sm text-xs sm:text-sm`}>
          <i className="fas fa-eye text-xs mr-1"></i>Live
        </div>
      </div>
      <div className="flex items-center justify-between">
        <DoughnutChart value={chartValue} color={chartColor} label={title} />
        <div className="text-right ml-3 sm:ml-4">
          <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 transition-colors duration-300">
            {value}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
