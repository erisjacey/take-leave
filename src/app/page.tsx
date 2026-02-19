'use client'

import {
  ConfigModal,
  ForecastChart,
  Header,
  LeaveList,
  LeaveModal,
  Onboarding,
  StatsBar,
  WhatIf,
} from '@/components'
import { usePtoData } from '@/hooks'
import type { LeaveEntry, PtoConfig } from '@/lib'
import { storageService } from '@/lib'
import { useState } from 'react'

const Home = () => {
  const pto = usePtoData()
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LeaveEntry | undefined>()

  if (pto.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">Loading…</p>
      </div>
    )
  }

  if (!pto.hasOnboarded) {
    return <Onboarding onComplete={pto.completeOnboarding} />
  }

  // ─── Leave modal handlers ──────────────────────────────────────────────────

  const handleLeaveAdd = () => {
    setEditingEntry(undefined)
    setIsLeaveModalOpen(true)
  }

  const handleLeaveEdit = (entry: LeaveEntry) => {
    setEditingEntry(entry)
    setIsLeaveModalOpen(true)
  }

  const handleLeaveClose = () => {
    setIsLeaveModalOpen(false)
    setEditingEntry(undefined)
  }

  const handleLeaveSave = (data: Omit<LeaveEntry, 'id'>) => {
    if (editingEntry !== undefined) {
      pto.updateEntry({ ...data, id: editingEntry.id })
    } else {
      pto.addEntry(data)
    }
    handleLeaveClose()
  }

  const handleLeaveDelete = () => {
    if (editingEntry !== undefined) {
      pto.deleteEntry(editingEntry.id)
    }
    handleLeaveClose()
  }

  // ─── Config modal handlers ─────────────────────────────────────────────────

  const handleConfigOpen = () => {
    setIsConfigModalOpen(true)
  }

  const handleConfigClose = () => {
    setIsConfigModalOpen(false)
  }

  const handleConfigSave = (config: PtoConfig) => {
    pto.updateConfig(config)
    setIsConfigModalOpen(false)
  }

  const handleExportJson = () => {
    const json = storageService.exportJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `takeleave-backup-${pto.config.year.toString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJson = (json: string) => {
    const data = storageService.importJson(json)
    pto.updateConfig(data.config)
    // Reload page to fully re-hydrate from storage
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header onOpenConfig={handleConfigOpen} />
      <main className="mx-auto max-w-4xl space-y-4 px-3 py-4 sm:px-4">
        <StatsBar stats={pto.stats} />
        <ForecastChart chartData={pto.chartData} />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <LeaveList
            entries={pto.entries}
            onAdd={handleLeaveAdd}
            onEdit={handleLeaveEdit}
          />
          <div className="lg:sticky lg:top-[4.5rem] lg:self-start">
            <WhatIf config={pto.config} entries={pto.entries} />
          </div>
        </div>
      </main>
      {isLeaveModalOpen && (
        <LeaveModal
          entry={editingEntry}
          onSave={handleLeaveSave}
          onDelete={editingEntry !== undefined ? handleLeaveDelete : undefined}
          onClose={handleLeaveClose}
        />
      )}
      {isConfigModalOpen && (
        <ConfigModal
          config={pto.config}
          onSave={handleConfigSave}
          onClose={handleConfigClose}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
        />
      )}
    </div>
  )
}

export default Home
