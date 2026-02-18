'use client'

import { Header, LeaveList, LeaveModal, StatsBar } from '@/components'
import { usePtoData } from '@/hooks'
import type { LeaveEntry } from '@/lib'
import { useState } from 'react'

const Home = () => {
  const pto = usePtoData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LeaveEntry | undefined>()

  if (pto.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">Loading…</p>
      </div>
    )
  }

  if (!pto.hasOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">
          Setup coming soon — onboarding in step 15.
        </p>
      </div>
    )
  }

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

  const handleSave = (data: Omit<LeaveEntry, 'id'>) => {
    if (editingEntry !== undefined) {
      pto.updateEntry({ ...data, id: editingEntry.id })
    } else {
      pto.addEntry(data)
    }
    handleClose()
  }

  const handleDelete = () => {
    if (editingEntry !== undefined) {
      pto.deleteEntry(editingEntry.id)
    }
    handleClose()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header onOpenConfig={() => {}} />
      <main className="mx-auto max-w-4xl space-y-4 p-4">
        <StatsBar stats={pto.stats} />
        <LeaveList
          entries={pto.entries}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      </main>
      {isModalOpen && (
        <LeaveModal
          entry={editingEntry}
          onSave={handleSave}
          onDelete={editingEntry !== undefined ? handleDelete : undefined}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

export default Home
