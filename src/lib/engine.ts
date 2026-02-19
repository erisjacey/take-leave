import type {
  AnnualExtra,
  LeaveEntry,
  LeaveType,
  LeaveTypeConfig,
  PtoConfig,
  TimelineEvent,
} from './types'
import { MONTHS } from './constants'

// ─── Output types ─────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  month: string
  /** 1–12 */
  monthIndex: number
  balance: number
  isPast: boolean
  hasLeave: boolean
}

export interface PtoStats {
  currentBalance: number
  plannedLeave: number
  yearEndForecast: number
  /** null if no upcoming accrual in the config year */
  nextAccrualDate: string | null
  nextAccrualDays: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const padTwo = (n: number): string => n.toString().padStart(2, '0')

const toDateStr = (year: number, month: number, day: number): string =>
  `${year.toString()}-${padTwo(month)}-${padTwo(day)}`

const currentDateStr = (): string => {
  const d = new Date()
  return toDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

// ─── Event generators ─────────────────────────────────────────────────────────

export const generateAccrualEvents = (
  leaveTypeConfig: LeaveTypeConfig,
  year: number,
): TimelineEvent[] => {
  if (leaveTypeConfig.accrualMode === 'lump_sum') {
    return [
      {
        date: toDateStr(year, 1, 1),
        type: 'lump_sum',
        days: leaveTypeConfig.totalDays,
        label: `${leaveTypeConfig.label} lump sum`,
        balanceAfter: 0,
      },
    ]
  }

  // rolling: 12 monthly credits on the 1st
  return Array.from({ length: 12 }, (_, i) => ({
    date: toDateStr(year, i + 1, 1),
    type: 'accrual' as const,
    days: leaveTypeConfig.monthlyAccrual,
    label: `${leaveTypeConfig.label} accrual`,
    balanceAfter: 0,
  }))
}

export const generateExtraEvents = (
  annualExtras: AnnualExtra[],
  year: number,
): TimelineEvent[] =>
  annualExtras.map((extra) => ({
    date: toDateStr(year, extra.month, 1),
    type: 'extra' as const,
    days: extra.days,
    label: extra.name,
    balanceAfter: 0,
  }))

export const generateLeaveEvents = (
  entries: LeaveEntry[],
  leaveType: LeaveType,
): TimelineEvent[] =>
  entries
    .filter((e) => e.leaveType === leaveType)
    .map((e) => ({
      date: e.startDate,
      type: 'leave' as const,
      days: -e.days,
      label: e.title,
      balanceAfter: 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

// ─── Merge & sort ─────────────────────────────────────────────────────────────

const EVENT_PRIORITY: Record<TimelineEvent['type'], number> = {
  accrual: 0,
  lump_sum: 0,
  extra: 1,
  leave: 2,
}

export const mergeAndSortEvents = (events: TimelineEvent[]): TimelineEvent[] =>
  [...events].sort((a, b) => {
    const dateDiff = a.date.localeCompare(b.date)
    if (dateDiff !== 0) {
      return dateDiff
    }
    return EVENT_PRIORITY[a.type] - EVENT_PRIORITY[b.type]
  })

// ─── Running balance ──────────────────────────────────────────────────────────

export const computeRunningBalance = (
  events: TimelineEvent[],
  startingBalance: number,
): TimelineEvent[] => {
  let balance = startingBalance
  return events.map((event) => {
    balance += event.days
    return { ...event, balanceAfter: balance }
  })
}

// ─── Chart data ───────────────────────────────────────────────────────────────

/** Map a timeline into 12 monthly ChartDataPoints */
const timelineToChartData = (
  timeline: TimelineEvent[],
  year: number,
  startingBalance: number,
): ChartDataPoint[] => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // 1–12

  let lastBalance = startingBalance

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const monthPrefix = `${year.toString()}-${padTwo(m)}-`
    const monthEvents = timeline.filter((e) => e.date.startsWith(monthPrefix))

    const hasLeave = monthEvents.some((e) => e.type === 'leave')

    if (monthEvents.length > 0) {
      lastBalance = monthEvents[monthEvents.length - 1].balanceAfter
    }

    return {
      month: MONTHS[i],
      monthIndex: m,
      balance: lastBalance,
      isPast: year === currentYear && m < currentMonth,
      hasLeave,
    }
  })
}

export const buildAnnualLeaveChartData = (
  config: PtoConfig,
  entries: LeaveEntry[],
): ChartDataPoint[] => {
  const annualConfig = config.leaveTypes.find((lt) => lt.type === 'annual')
  if (!annualConfig) {
    return []
  }

  // Only include leave entries from the config year to avoid double-counting
  // days already baked into startingBalance from prior years.
  const yearPrefix = `${config.year.toString()}-`
  const yearEntries = entries.filter((e) => e.startDate.startsWith(yearPrefix))

  const allEvents = mergeAndSortEvents([
    ...generateAccrualEvents(annualConfig, config.year),
    ...generateExtraEvents(config.annualExtras, config.year),
    ...generateLeaveEvents(yearEntries, 'annual'),
  ])
  const timeline = computeRunningBalance(
    allEvents,
    annualConfig.startingBalance,
  )

  return timelineToChartData(
    timeline,
    config.year,
    annualConfig.startingBalance,
  )
}

/** Sick leave chart data — same shape as annual but no extras, lump_sum only */
export const buildSickLeaveChartData = (
  config: PtoConfig,
  entries: LeaveEntry[],
): ChartDataPoint[] | null => {
  const sickConfig = config.leaveTypes.find((lt) => lt.type === 'sick')
  if (!sickConfig) {
    return null
  }

  const yearPrefix = `${config.year.toString()}-`
  const yearEntries = entries.filter((e) => e.startDate.startsWith(yearPrefix))

  const allEvents = mergeAndSortEvents([
    ...generateAccrualEvents(sickConfig, config.year),
    ...generateLeaveEvents(yearEntries, 'sick'),
  ])
  const timeline = computeRunningBalance(allEvents, sickConfig.startingBalance)

  return timelineToChartData(timeline, config.year, sickConfig.startingBalance)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export const computeStats = (
  config: PtoConfig,
  entries: LeaveEntry[],
): PtoStats => {
  const annualConfig = config.leaveTypes.find((lt) => lt.type === 'annual')
  if (!annualConfig) {
    return {
      currentBalance: 0,
      plannedLeave: 0,
      yearEndForecast: 0,
      nextAccrualDate: null,
      nextAccrualDays: 0,
    }
  }

  const today = currentDateStr()
  const yearPrefix = `${config.year.toString()}-`
  const yearEntries = entries.filter((e) => e.startDate.startsWith(yearPrefix))

  const accrualEvents = generateAccrualEvents(annualConfig, config.year)
  const extraEvents = generateExtraEvents(config.annualExtras, config.year)
  const leaveEvents = generateLeaveEvents(yearEntries, 'annual')

  const allEvents = mergeAndSortEvents([
    ...accrualEvents,
    ...extraEvents,
    ...leaveEvents,
  ])
  const timeline = computeRunningBalance(
    allEvents,
    annualConfig.startingBalance,
  )

  // currentBalance: last balanceAfter at or before today
  const pastEvents = timeline.filter((e) => e.date <= today)
  const currentBalance =
    pastEvents.length > 0
      ? pastEvents[pastEvents.length - 1].balanceAfter
      : annualConfig.startingBalance

  // plannedLeave: future annual leave days within the config year
  const plannedLeave = yearEntries
    .filter((e) => e.leaveType === 'annual' && e.startDate > today)
    .reduce((sum, e) => sum + e.days, 0)

  // yearEndForecast: last event's balanceAfter in the full timeline
  const yearEndForecast =
    timeline.length > 0
      ? timeline[timeline.length - 1].balanceAfter
      : annualConfig.startingBalance

  // nextAccrual: first accrual or extra event after today
  const nextAccrualEvent = mergeAndSortEvents([
    ...accrualEvents,
    ...extraEvents,
  ]).find((e) => e.date > today)

  return {
    currentBalance,
    plannedLeave,
    yearEndForecast,
    nextAccrualDate: nextAccrualEvent?.date ?? null,
    nextAccrualDays: nextAccrualEvent?.days ?? 0,
  }
}
