'use client'

import { Header, LeaveList, LeaveModal, StatsBar } from '@/components'
import type { LeaveEntry, PtoStats } from '@/lib'
import { useState } from 'react'

const MOCK_STATS: PtoStats = {
  currentBalance: 3.5,
  plannedLeave: 5,
  yearEndForecast: 12.25,
  nextAccrualDate: '2026-03-01',
  nextAccrualDays: 1.75,
}

const MOCK_ENTRIES: LeaveEntry[] = [
  {
    id: '1',
    title: 'Bali trip',
    tag: 'travel',
    leaveType: 'annual',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    days: 5,
  },
]

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LeaveEntry | undefined>()

  const handleAdd = () => {
    setEditingEntry(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (entry: LeaveEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingEntry(undefined)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header onOpenConfig={() => {}} />
      <main className="mx-auto max-w-4xl space-y-4 p-4">
        <StatsBar stats={MOCK_STATS} />
        <LeaveList
          entries={MOCK_ENTRIES}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      </main>
      {isModalOpen && (
        <LeaveModal
          entry={editingEntry}
          onSave={() => {
            handleClose()
          }}
          onDelete={editingEntry !== undefined ? handleClose : undefined}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

export default Home
