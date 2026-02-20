'use client'

import { useWhatIf } from '@/hooks'
import type { LeaveEntry, PtoConfig } from '@/lib'
import { MONTHS } from '@/lib'
import { FlaskConical } from 'lucide-react'
import { useState } from 'react'
import NumberStepper from './number-stepper'

interface WhatIfProps {
  config: PtoConfig
  entries: LeaveEntry[]
}

const WhatIf = ({ config, entries }: WhatIfProps) => {
  const [days, setDays] = useState(1)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    // Default to next month, or January of next year's config
    return config.year === now.getFullYear()
      ? Math.min(currentMonth + 1, 12)
      : 1
  })

  const { projectedBalance, isNegative } = useWhatIf(config, entries, {
    days,
    month,
  })

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center gap-2">
        <FlaskConical size={16} className="text-zinc-400" />
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          What If?
        </h2>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="whatif-days"
            className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400"
          >
            Days off
          </label>
          <NumberStepper
            id="whatif-days"
            value={days}
            onChange={setDays}
            min={0.5}
            step={0.5}
          />
        </div>
        <div>
          <label
            htmlFor="whatif-month"
            className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400"
          >
            In month
          </label>
          <select
            id="whatif-month"
            value={month}
            onChange={(e) => {
              setMonth(parseInt(e.target.value, 10))
            }}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {MONTHS.map((label, i) => (
              <option key={label} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`rounded-md px-4 py-3 ${
          isNegative
            ? 'bg-red-50 dark:bg-red-950/40'
            : 'bg-emerald-50 dark:bg-emerald-950/40'
        }`}
      >
        <p
          className={`font-mono text-2xl font-semibold ${
            isNegative
              ? 'text-red-600 dark:text-red-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {projectedBalance.toFixed(1)}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          projected balance after {days.toFixed(1)} day
          {days !== 1 ? 's' : ''} in {MONTHS[month - 1]}
        </p>
      </div>
    </div>
  )
}

export default WhatIf
