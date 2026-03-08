'use client'

import type { LeaveEntry, PtoConfig, WhatIfScenario } from '@/lib'
import { formatDate } from '@/lib'
import { CalendarPlus, FlaskConical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import DateRangePicker from './date-range-picker'
import NumberStepper from './number-stepper'

interface WhatIfProps {
  config: PtoConfig
  entries: LeaveEntry[]
  scenarios: WhatIfScenario[]
  onAddScenario: (data: Omit<WhatIfScenario, 'id'>) => void
  onUpdateScenario: (scenario: WhatIfScenario) => void
  onDeleteScenario: (id: string) => void
  onConvertToLeave: (scenario: WhatIfScenario) => void
}

interface FormState {
  name: string
  startDate: string
  endDate: string
  days: number
}

const countWeekdays = (start: string, end: string): number => {
  const d1 = new Date(`${start}T12:00:00`)
  const d2 = new Date(`${end}T12:00:00`)
  if (d1 > d2) {
    return 0
  }
  let count = 0
  const cur = new Date(d1)
  while (cur <= d2) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) {
      count++
    }
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

const defaultForm = (): FormState => {
  const today = new Date().toISOString().slice(0, 10)
  return {
    name: '',
    startDate: today,
    endDate: today,
    days: 1,
  }
}

const inputClass =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500'

const ScenarioForm = ({
  form,
  onFormChange,
  onDateRangeChange,
  onSave,
  onCancel,
  isEdit,
}: {
  form: FormState
  onFormChange: (patch: Partial<FormState>) => void
  onDateRangeChange: (start: string, end: string) => void
  onSave: () => void
  onCancel: () => void
  isEdit: boolean
}) => (
  <div className="space-y-3">
    <div>
      <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
        Name
      </label>
      <input
        type="text"
        value={form.name}
        onChange={(e) => {
          onFormChange({ name: e.target.value })
        }}
        placeholder="e.g. Beach holiday"
        className={inputClass}
      />
    </div>
    <div>
      <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
        Dates
      </label>
      <DateRangePicker
        startDate={form.startDate}
        endDate={form.endDate}
        onChange={onDateRangeChange}
      />
    </div>
    <div>
      <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
        Days
      </label>
      <NumberStepper
        value={form.days}
        onChange={(v) => {
          onFormChange({ days: v })
        }}
        min={0.5}
        step={0.5}
      />
      <p className="mt-1 text-xs text-zinc-400">
        Auto-calculated weekdays. Adjust for half-days.
      </p>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={form.name.trim() === ''}
        className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
      >
        {isEdit ? 'Save' : 'Add'}
      </button>
    </div>
  </div>
)

const ScenarioCard = ({
  scenario,
  onEdit,
  onDelete,
  onConvert,
}: {
  scenario: WhatIfScenario
  onEdit: () => void
  onDelete: () => void
  onConvert: () => void
}) => {
  const { name, startDate, endDate, days } = scenario
  const isSameDay = startDate === endDate
  const dateLabel = isSameDay
    ? formatDate(startDate)
    : `${formatDate(startDate)} – ${formatDate(endDate)}`

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {name}
        </p>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onConvert}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-blue-600 dark:hover:bg-zinc-700 dark:hover:text-blue-400"
            title="Add to leaves"
          >
            <CalendarPlus size={14} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            title="Edit scenario"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-red-600 dark:hover:bg-zinc-700 dark:hover:text-red-400"
            title="Delete scenario"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {dateLabel} &middot; {days.toFixed(1)} day{days !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

const WhatIf = ({
  scenarios,
  onAddScenario,
  onUpdateScenario,
  onDeleteScenario,
  onConvertToLeave,
}: WhatIfProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const updateForm = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const handleDateRangeChange = (start: string, end: string) => {
    const newDays = countWeekdays(start, end)
    setForm((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
      days: newDays > 0 ? newDays : prev.days,
    }))
  }

  const handleStartAdd = () => {
    setForm(defaultForm())
    setEditingId(null)
    setIsAdding(true)
  }

  const handleStartEdit = (scenario: WhatIfScenario) => {
    setForm({
      name: scenario.name,
      startDate: scenario.startDate,
      endDate: scenario.endDate,
      days: scenario.days,
    })
    setEditingId(scenario.id)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSave = () => {
    const trimmedName = form.name.trim()
    if (trimmedName === '') {
      return
    }

    const data = {
      name: trimmedName,
      startDate: form.startDate,
      endDate: form.endDate,
      days: form.days,
    }

    if (editingId !== null) {
      onUpdateScenario({ ...data, id: editingId })
    } else {
      onAddScenario(data)
    }

    setIsAdding(false)
    setEditingId(null)
  }

  const isFormOpen = isAdding || editingId !== null
  const isEmpty = scenarios.length === 0

  // Empty state
  if (isEmpty && !isFormOpen) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <FlaskConical
            size={36}
            className="text-zinc-300 dark:text-zinc-600"
          />
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              No scenarios yet
            </p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              Add one to see how your balance changes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartAdd}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Add Scenario
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            What If?
          </h2>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-blue-400 dark:hover:bg-blue-950/40"
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Form */}
        {isFormOpen && (
          <div className="mb-3">
            <ScenarioForm
              form={form}
              onFormChange={updateForm}
              onDateRangeChange={handleDateRangeChange}
              onSave={handleSave}
              onCancel={handleCancel}
              isEdit={editingId !== null}
            />
          </div>
        )}

        {/* Scenario list */}
        {scenarios.length > 0 && (
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onEdit={() => {
                  handleStartEdit(scenario)
                }}
                onDelete={() => {
                  onDeleteScenario(scenario.id)
                }}
                onConvert={() => {
                  onConvertToLeave(scenario)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WhatIf
