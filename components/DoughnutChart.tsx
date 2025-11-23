'use client'

import { useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DoughnutChartProps {
  value: number
  color: string
  label: string
}

export default function DoughnutChart({ value, color, label }: DoughnutChartProps) {
  const data = {
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [color, '#1F2937'],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  }

  return (
    <div className="chart-container relative">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs sm:text-sm font-bold" style={{ color }}>
            {value.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}
