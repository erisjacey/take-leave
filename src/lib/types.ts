// ─── Accrual ────────────────────────────────────────────────────────────────

export type AccrualMode = 'rolling' | 'lump_sum'

// ─── Leave types ─────────────────────────────────────────────────────────────

export type LeaveType = 'annual' | 'sick'

export interface LeaveTypeConfig {
  type: LeaveType
  label: string
  totalDays: number
  accrualMode: AccrualMode
  /** Derived: totalDays / 12 for rolling, 0 for lump_sum */
  monthlyAccrual: number
  startingBalance: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface AnnualExtra {
  id: string
  name: string
  days: number
  /** 1–12 */
  month: number
}

export interface PtoConfig {
  /** Mirrors leaveTypes[annual].accrualMode — convenience field */
  accrualMode: AccrualMode
  /** Mirrors leaveTypes[annual].totalDays — convenience field */
  totalDays: number
  /** Mirrors leaveTypes[annual].monthlyAccrual — convenience field */
  monthlyAccrual: number
  /** Month (1–12) when the year resets / lump sum is credited */
  resetMonth: number
  /** Mirrors leaveTypes[annual].startingBalance — convenience field */
  startingBalance: number
  year: number
  annualExtras: AnnualExtra[]
  leaveTypes: LeaveTypeConfig[]
}

// ─── Entries ──────────────────────────────────────────────────────────────────

export type LeaveTag = 'travel' | 'personal' | 'family' | 'gaming' | 'other'

export interface LeaveEntry {
  id: string
  title: string
  tag: LeaveTag
  leaveType: LeaveType
  /** YYYY-MM-DD */
  startDate: string
  /** YYYY-MM-DD */
  endDate: string
  /** Supports half-days (0.5) */
  days: number
  notes?: string
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  /** YYYY-MM-DD */
  date: string
  type: 'accrual' | 'extra' | 'leave' | 'lump_sum'
  /** Positive for credits, negative for debits */
  days: number
  label: string
  balanceAfter: number
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export interface StoredData {
  config: PtoConfig
  entries: LeaveEntry[]
}
