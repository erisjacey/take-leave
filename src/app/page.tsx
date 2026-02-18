'use client'

import { Header, LeaveList, StatsBar } from '@/components'
import type { PtoStats } from '@/lib'

const MOCK_STATS: PtoStats = {
  currentBalance: 3.5,
  plannedLeave: 5,
  yearEndForecast: 12.25,
  nextAccrualDate: '2026-03-01',
  nextAccrualDays: 1.75,
}

const Home = () => (
  <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
    <Header onOpenConfig={() => {}} />
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <StatsBar stats={MOCK_STATS} />
      <LeaveList entries={[]} onAdd={() => {}} onEdit={() => {}} />
    </main>
  </div>
)

export default Home
