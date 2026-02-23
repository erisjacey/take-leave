'use client'

import {
  buildAnnualLeaveChartData,
  buildSickLeaveChartData,
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
  WhatIfScenario,
} from '@/lib'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

interface PtoData {
  config: PtoConfig
  entries: LeaveEntry[]
  scenarios: WhatIfScenario[]
  stats: PtoStats
  annualLeaveChartData: ChartDataPoint[]
  sickLeaveChartData: ChartDataPoint[] | null
  isLoading: boolean
  hasOnboarded: boolean
  addEntry: (data: Omit<LeaveEntry, 'id'>) => void
  updateEntry: (entry: LeaveEntry) => void
  deleteEntry: (id: string) => void
  addScenario: (data: Omit<WhatIfScenario, 'id'>) => void
  updateScenario: (scenario: WhatIfScenario) => void
  deleteScenario: (id: string) => void
  updateConfig: (config: PtoConfig) => void
  completeOnboarding: (config: PtoConfig) => void
}

const usePtoData = (): PtoData => {
  const [data, setData] = useState<StoredData>({
    config: DEFAULT_CONFIG,
    entries: [],
    scenarios: [],
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

  const addScenario = (scenarioData: Omit<WhatIfScenario, 'id'>) => {
    const scenario: WhatIfScenario = { ...scenarioData, id: nanoid() }
    persist({ ...data, scenarios: [...data.scenarios, scenario] })
  }

  const updateScenario = (scenario: WhatIfScenario) => {
    persist({
      ...data,
      scenarios: data.scenarios.map((s) =>
        s.id === scenario.id ? scenario : s,
      ),
    })
  }

  const deleteScenario = (id: string) => {
    persist({
      ...data,
      scenarios: data.scenarios.filter((s) => s.id !== id),
    })
  }

  const completeOnboarding = (config: PtoConfig) => {
    persist({ config, entries: [], scenarios: [] })
    setHasOnboarded(true)
  }

  const stats = computeStats(data.config, data.entries)
  const annualLeaveChartData = buildAnnualLeaveChartData(
    data.config,
    data.entries,
  )
  const sickLeaveChartData = buildSickLeaveChartData(data.config, data.entries)

  return {
    config: data.config,
    entries: data.entries,
    scenarios: data.scenarios,
    stats,
    annualLeaveChartData,
    sickLeaveChartData,
    isLoading,
    hasOnboarded,
    addEntry,
    updateEntry,
    deleteEntry,
    addScenario,
    updateScenario,
    deleteScenario,
    updateConfig,
    completeOnboarding,
  }
}

export default usePtoData
