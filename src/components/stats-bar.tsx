import type { PtoStats } from '@/lib'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  isAlert?: boolean
}

const StatCard = ({ label, value, sub, isAlert = false }: StatCardProps) => (
  <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
      {label}
    </p>
    <p
      className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
        isAlert
          ? 'text-red-600 dark:text-red-400'
          : 'text-zinc-900 dark:text-zinc-50'
      }`}
    >
      {value}
    </p>
    {sub !== undefined && (
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
    )}
  </div>
)

interface StatsBarProps {
  stats: PtoStats
}

const StatsBar = ({ stats }: StatsBarProps) => {
  const nextAccrualSub =
    stats.nextAccrualDate !== null
      ? `on ${stats.nextAccrualDate}`
      : 'none remaining'

  return (
    <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
      <StatCard
        label="Current Balance"
        value={`${stats.currentBalance.toFixed(1)} days`}
        isAlert={stats.currentBalance < 3}
      />
      <StatCard
        label="Planned Leave"
        value={`${stats.plannedLeave.toFixed(1)} days`}
      />
      <StatCard
        label="Year-end Forecast"
        value={`${stats.yearEndForecast.toFixed(1)} days`}
        isAlert={stats.yearEndForecast < 0}
      />
      <StatCard
        label="Next Accrual"
        value={
          stats.nextAccrualDays > 0
            ? `+${stats.nextAccrualDays.toFixed(2)} days`
            : '—'
        }
        sub={nextAccrualSub}
      />
    </div>
  )
}

export default StatsBar
