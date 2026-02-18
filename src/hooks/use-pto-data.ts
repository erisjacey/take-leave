'use client'

import {
  buildChartData,
  computeStats,
  storageService,
  DEFAULT_CONFIG,
} from '@/lib'
import type {
  ChartDataPoint,
  LeaveEntry,
  PtoConfig,
  PtoStats,
  StoredData,
} from '@/lib'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

interface PtoData {
  config: PtoConfig
  entries: LeaveEntry[]
  stats: PtoStats
  chartData: ChartDataPoint[]
  isLoading: boolean
  hasOnboarded: boolean
  addEntry: (data: Omit<LeaveEntry, 'id'>) => void
  updateEntry: (entry: LeaveEntry) => void
  deleteEntry: (id: string) => void
  updateConfig: (config: PtoConfig) => void
  completeOnboarding: (config: PtoConfig) => void
}

const usePtoData = (): PtoData => {
  const [data, setData] = useState<StoredData>({
    config: DEFAULT_CONFIG,
    entries: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasOnboarded, setHasOnboarded] = useState(false)

  useEffect(() => {
    const stored = storageService.getData()
    if (stored !== null) {
      setData(stored)
      setHasOnboarded(true)
    }
    setIsLoading(false)
  }, [])

  const persist = (next: StoredData) => {
    setData(next)
    storageService.saveData(next)
  }

  const addEntry = (entryData: Omit<LeaveEntry, 'id'>) => {
    const entry: LeaveEntry = { ...entryData, id: nanoid() }
    persist({ ...data, entries: [...data.entries, entry] })
  }

  const updateEntry = (entry: LeaveEntry) => {
    persist({
      ...data,
      entries: data.entries.map((e) => (e.id === entry.id ? entry : e)),
    })
  }

  const deleteEntry = (id: string) => {
    persist({ ...data, entries: data.entries.filter((e) => e.id !== id) })
  }

  const updateConfig = (config: PtoConfig) => {
    persist({ ...data, config })
  }

  const completeOnboarding = (config: PtoConfig) => {
    persist({ config, entries: [] })
    setHasOnboarded(true)
  }

  const stats = computeStats(data.config, data.entries)
  const chartData = buildChartData(data.config, data.entries)

  return {
    config: data.config,
    entries: data.entries,
    stats,
    chartData,
    isLoading,
    hasOnboarded,
    addEntry,
    updateEntry,
    deleteEntry,
    updateConfig,
    completeOnboarding,
  }
}

export default usePtoData
