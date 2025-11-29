'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface LineChartProps {
  data: any[]
  label: string
  color: string
  dataKey?: string
  maxValue?: number
  formatAsBytes?: boolean
}

// Format bytes to human readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(1)} ${sizes[i]}`
}

export default function LineChart({
  data,
  label,
  color,
  dataKey = 'value',
  maxValue = 100,
  formatAsBytes = false,
}: LineChartProps) {
  const chartRef = useRef<any>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }

    checkDarkMode()

    // Watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Disable animation on first render for faster initial load
    if (isFirstRender && data.length > 0) {
      setIsFirstRender(false)
    }
  }, [data, isFirstRender])

  // Prepare chart data
  const chartData = {
    labels: data.map((_, index) => ''),
    datasets: [
      {
        label: label,
        data: data.map((item) => {
          if (typeof item === 'number') return item
          return item[dataKey] || 0
        }),
        borderColor: color,
        backgroundColor: `${color}30`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#fff' : '#1e293b',
        bodyColor: isDarkMode ? '#fff' : '#1e293b',
        borderColor: color,
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: () => label,
          label: (context) => {
            const value = context.parsed.y
            if (value === null || value === undefined) return '0'
            if (formatAsBytes) return `${formatBytes(value)}/s`
            return `${value.toFixed(2)}${dataKey.includes('percent') || maxValue === 100 ? '%' : ''}`
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        min: 0,
        ...(formatAsBytes ? {} : { max: maxValue }),
        border: {
          display: false,
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(30, 41, 55, 0.7)',
          font: {
            size: 10,
          },
          maxTicksLimit: 5,
          callback: function (value) {
            if (formatAsBytes) return formatBytes(Number(value))
            return `${value}${maxValue === 100 ? '%' : ''}`
          },
        },
      },
    },
    animation: isFirstRender ? false : {
      duration: 200,
    },
  }

  return (
    <div className="w-full h-full">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}
