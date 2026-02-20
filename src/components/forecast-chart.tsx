'use client'

import type { ChartDataPoint } from '@/lib'
import { Stethoscope } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ForecastChartProps {
  annualLeaveChartData: ChartDataPoint[]
  sickLeaveChartData: ChartDataPoint[] | null
}

interface CombinedPoint {
  month: string
  past: number | null
  future: number | null
  sick: number | null
}

interface TooltipPayloadEntry {
  dataKey: string
  value: number | null
}

interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadEntry[]
  showSick: boolean
}

const ChartTooltip = ({
  active,
  label,
  payload,
  showSick,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const pastEntry = payload.find((p) => p.dataKey === 'past')
  const futureEntry = payload.find((p) => p.dataKey === 'future')
  const sickEntry = payload.find((p) => p.dataKey === 'sick')
  const annualValue = pastEntry?.value ?? futureEntry?.value

  if (annualValue === null || annualValue === undefined) {
    return null
  }

  return (
    <div className="rounded-md border border-[var(--chart-tooltip-border)] bg-[var(--chart-tooltip-bg)] px-3 py-2 font-mono text-xs shadow-sm">
      <p className="mb-1 text-[var(--chart-axis)]">{label}</p>
      <p className="text-zinc-900 dark:text-zinc-50">
        Annual: {annualValue.toFixed(1)} days
      </p>
      {showSick &&
        sickEntry?.value !== null &&
        sickEntry?.value !== undefined && (
          <p className="text-[var(--chart-sick-line)]">
            Sick: {sickEntry.value.toFixed(1)} days
          </p>
        )}
    </div>
  )
}

const ForecastChart = ({
  annualLeaveChartData,
  sickLeaveChartData,
}: ForecastChartProps) => {
  const [mounted, setMounted] = useState(false)
  const [showSick, setShowSick] = useState(true)
  const [isWide, setIsWide] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px)')
    setIsWide(mql.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsWide(e.matches)
    }
    mql.addEventListener('change', handler)
    setMounted(true)
    return () => {
      mql.removeEventListener('change', handler)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="h-[220px] rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
    )
  }

  const hasSickData = sickLeaveChartData !== null

  // Split data into past and future series
  // Past includes past months + first future month (bridge point for smooth connection)
  // Future includes only non-past months (no backward overlap that causes dashed line in past region)
  const pastData = annualLeaveChartData.map((point) =>
    point.isPast || isFirstFuture(point, annualLeaveChartData)
      ? point.balance
      : null,
  )
  const futureData = annualLeaveChartData.map((point) =>
    !point.isPast ? point.balance : null,
  )

  const combined: CombinedPoint[] = annualLeaveChartData.map((point, i) => ({
    month: point.month,
    past: pastData[i],
    future: futureData[i],
    sick:
      hasSickData && showSick ? (sickLeaveChartData[i]?.balance ?? null) : null,
  }))

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Leave Forecast
        </h2>
        {hasSickData && (
          <button
            type="button"
            onClick={() => {
              setShowSick((prev) => !prev)
            }}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
              showSick
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
            title={showSick ? 'Hide sick leave' : 'Show sick leave'}
          >
            <Stethoscope size={14} />
            <span>Sick</span>
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={combined}
          margin={{ top: 4, right: 4, bottom: 0, left: -4 }}
        >
          <defs>
            <linearGradient id="pastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-fill)"
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-fill)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id="futureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-fill)"
                stopOpacity={0.15}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-fill)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--chart-grid)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={
              isWide
                ? {
                    fontSize: 11,
                    fill: 'var(--chart-axis)',
                    fontFamily: 'var(--font-space-mono)',
                  }
                : false
            }
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid)' }}
          />
          <YAxis
            tick={{
              fontSize: 11,
              fill: 'var(--chart-axis)',
              fontFamily: 'var(--font-space-mono)',
            }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={36}
          />
          <Tooltip
            content={<ChartTooltip showSick={hasSickData && showSick} />}
          />
          <ReferenceLine
            y={0}
            stroke="var(--chart-danger)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="future"
            stroke="var(--chart-line)"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#futureGradient)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="past"
            stroke="var(--chart-line)"
            strokeWidth={2}
            fill="url(#pastGradient)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          {hasSickData && showSick && (
            <Line
              type="monotone"
              dataKey="sick"
              stroke="var(--chart-sick-line)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              connectNulls
            />
          )}
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

export default ForecastChart
