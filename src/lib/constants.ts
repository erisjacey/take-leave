import type { LeaveTag, PtoConfig } from './types'

// ─── Storage ──────────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'takeleave_data' as const

// ─── Calendar ─────────────────────────────────────────────────────────────────

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export type Month = (typeof MONTHS)[number]

// ─── Tags ─────────────────────────────────────────────────────────────────────

export interface TagConfig {
  label: string
  /** Tailwind background classes (light + dark) */
  bgClass: string
  /** Tailwind text classes (light + dark) */
  textClass: string
}

export const TAG_CONFIG: Record<LeaveTag, TagConfig> = {
  travel: {
    label: 'Travel',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  personal: {
    label: 'Personal',
    bgClass: 'bg-violet-100 dark:bg-violet-900/30',
    textClass: 'text-violet-700 dark:text-violet-300',
  },
  family: {
    label: 'Family',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    textClass: 'text-pink-700 dark:text-pink-300',
  },
  other: {
    label: 'Other',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-600 dark:text-gray-400',
  },
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const ANNUAL_TOTAL_DAYS = 21

export const DEFAULT_CONFIG: PtoConfig = {
  accrualMode: 'rolling',
  totalDays: ANNUAL_TOTAL_DAYS,
  monthlyAccrual: ANNUAL_TOTAL_DAYS / 12,
  resetMonth: 1,
  startingBalance: 0,
  year: new Date().getFullYear(),
  annualExtras: [],
  leaveTypes: [
    {
      type: 'annual',
      label: 'Annual Leave',
      totalDays: ANNUAL_TOTAL_DAYS,
      accrualMode: 'rolling',
      monthlyAccrual: ANNUAL_TOTAL_DAYS / 12,
      startingBalance: 0,
    },
  ],
}
