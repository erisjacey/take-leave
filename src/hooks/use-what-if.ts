import {
  computeRunningBalance,
  generateAccrualEvents,
  generateExtraEvents,
  generateLeaveEvents,
  mergeAndSortEvents,
} from '@/lib'
import type { LeaveEntry, PtoConfig } from '@/lib'
import { useMemo } from 'react'

interface WhatIfInput {
  days: number
  /** 1–12 */
  month: number
}

interface WhatIfResult {
  projectedBalance: number
  isNegative: boolean
  /** Balance at end of target month including existing leave, before hypothetical */
  balanceAtMonth: number
}

const useWhatIf = (
  config: PtoConfig,
  entries: LeaveEntry[],
  input: WhatIfInput,
): WhatIfResult =>
  useMemo(() => {
    const annualConfig = config.leaveTypes.find((lt) => lt.type === 'annual')
    if (!annualConfig) {
      return { projectedBalance: 0, isNegative: false, balanceAtMonth: 0 }
    }

    // Include existing leave entries so the projection accounts for commitments
    const yearPrefix = `${config.year.toString()}-`
    const yearEntries = entries.filter((e) =>
      e.startDate.startsWith(yearPrefix),
    )

    const events = mergeAndSortEvents([
      ...generateAccrualEvents(annualConfig, config.year),
      ...generateExtraEvents(config.annualExtras, config.year),
      ...generateLeaveEvents(yearEntries, 'annual'),
    ])

    const timeline = computeRunningBalance(events, annualConfig.startingBalance)

    // Find balance at end of target month (last event on or before month end)
    const monthStr = input.month.toString().padStart(2, '0')
    const monthEnd = `${config.year.toString()}-${monthStr}-32`

    const eventsUpToMonth = timeline.filter(
      (e) => e.date.localeCompare(monthEnd) < 0,
    )

    const balanceAtMonth =
      eventsUpToMonth.length > 0
        ? eventsUpToMonth[eventsUpToMonth.length - 1].balanceAfter
        : annualConfig.startingBalance

    const projectedBalance = balanceAtMonth - input.days
    const isNegative = projectedBalance < 0

    return { projectedBalance, isNegative, balanceAtMonth }
  }, [config, entries, input.days, input.month])

export default useWhatIf
