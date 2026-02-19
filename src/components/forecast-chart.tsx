'use client'

import type { ChartDataPoint } from '@/lib'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ForecastChartProps {
  chartData: ChartDataPoint[]
}

const ForecastChart = ({ chartData }: ForecastChartProps) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-[220px] rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  const gridColor = isDark ? '#3f3f46' : '#e4e4e7' // zinc-700 / zinc-200
  const axisColor = isDark ? '#a1a1aa' : '#71717a' // zinc-400 / zinc-500
  const tooltipBg = isDark ? '#18181b' : '#ffffff' // zinc-900 / white
  const tooltipBorder = isDark ? '#3f3f46' : '#e4e4e7'

  // Split data into past and future series (with overlap at boundary)
  const pastData = chartData.map((point) =>
    point.isPast || isFirstFuture(point, chartData) ? point.balance : null,
  )
  const futureData = chartData.map((point, i) =>
    !point.isPast || isLastPast(i, chartData) ? point.balance : null,
  )

  const combined = chartData.map((point, i) => ({
    month: point.month,
    past: pastData[i],
    future: futureData[i],
  }))

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Annual Leave Forecast
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={combined}
          margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
        >
          <defs>
            <linearGradient id="pastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isDark ? '#6366f1' : '#818cf8'}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={isDark ? '#6366f1' : '#818cf8'}
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id="futureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isDark ? '#6366f1' : '#818cf8'}
                stopOpacity={0.15}
              />
              <stop
                offset="100%"
                stopColor={isDark ? '#6366f1' : '#818cf8'}
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{
              fontSize: 11,
              fill: axisColor,
              fontFamily: 'var(--font-space-mono)',
            }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            tick={{
              fontSize: 11,
              fill: axisColor,
              fontFamily: 'var(--font-space-mono)',
            }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'var(--font-space-mono)',
            }}
            formatter={(value: number | undefined) => [
              `${(value ?? 0).toFixed(1)} days`,
              'Balance',
            ]}
            labelStyle={{ color: axisColor, marginBottom: '2px' }}
          />
          <ReferenceLine
            y={0}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="past"
            stroke={isDark ? '#818cf8' : '#6366f1'}
            strokeWidth={2}
            fill="url(#pastGradient)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="future"
            stroke={isDark ? '#818cf8' : '#6366f1'}
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#futureGradient)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Check if this is the first future point (used to create overlap with past) */
const isFirstFuture = (
  point: ChartDataPoint,
  data: ChartDataPoint[],
): boolean => {
  if (point.isPast) {
    return false
  }
  const idx = data.indexOf(point)
  return idx > 0 && data[idx - 1].isPast
}

/** Check if this is the last past point (used to create overlap with future) */
const isLastPast = (index: number, data: ChartDataPoint[]): boolean => {
  if (!data[index].isPast) {
    return false
  }
  return index < data.length - 1 && !data[index + 1].isPast
}

export default ForecastChart
