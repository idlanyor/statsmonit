'use client'

import { useEffect, useRef } from 'react'
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
}

export default function LineChart({
  data,
  label,
  color,
  dataKey = 'value',
  maxValue = 100,
}: LineChartProps) {
  const chartRef = useRef<any>(null)

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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: color,
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: () => label,
          label: (context) => {
            const value = context.parsed.y
            if (value === null || value === undefined) return '0'
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
        max: maxValue,
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10,
          },
          maxTicksLimit: 5,
          callback: function (value) {
            return `${value}${maxValue === 100 ? '%' : ''}`
          },
        },
      },
    },
    animation: {
      duration: 750,
    },
  }

  return (
    <div className="w-full h-full">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}
