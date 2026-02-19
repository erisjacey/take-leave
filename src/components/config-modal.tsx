'use client'

import type { AccrualMode, AnnualExtra, PtoConfig } from '@/lib'
import { MONTHS } from '@/lib'
import { Download, Plus, Trash2, Upload, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'

interface ConfigModalProps {
  config: PtoConfig
  onSave: (config: PtoConfig) => void
  onClose: () => void
  onExportJson: () => void
  onImportJson: (json: string) => void
}

interface FormState {
  year: number
  totalDays: number
  accrualMode: AccrualMode
  startingBalance: number
  annualExtras: AnnualExtra[]
  hasSickLeave: boolean
  sickDays: number
}

const configToForm = (config: PtoConfig): FormState => {
  const sickConfig = config.leaveTypes.find((lt) => lt.type === 'sick')
  return {
    year: config.year,
    totalDays: config.totalDays,
    accrualMode: config.accrualMode,
    startingBalance: config.startingBalance,
    annualExtras: config.annualExtras,
    hasSickLeave: sickConfig !== undefined,
    sickDays: sickConfig?.totalDays ?? 14,
  }
}

const formToConfig = (form: FormState): PtoConfig => {
  const monthlyAccrual =
    form.accrualMode === 'rolling' ? form.totalDays / 12 : 0

  const leaveTypes: PtoConfig['leaveTypes'] = [
    {
      type: 'annual',
      label: 'Annual Leave',
      totalDays: form.totalDays,
      accrualMode: form.accrualMode,
      monthlyAccrual,
      startingBalance: form.startingBalance,
    },
  ]

  if (form.hasSickLeave) {
    leaveTypes.push({
      type: 'sick',
      label: 'Sick Leave',
      totalDays: form.sickDays,
      accrualMode: 'lump_sum',
      monthlyAccrual: 0,
      startingBalance: form.sickDays,
    })
  }

  return {
    accrualMode: form.accrualMode,
    totalDays: form.totalDays,
    monthlyAccrual,
    resetMonth: 1,
    startingBalance: form.startingBalance,
    year: form.year,
    annualExtras: form.annualExtras,
    leaveTypes,
  }
}

const ConfigModal = ({
  config,
  onSave,
  onClose,
  onExportJson,
  onImportJson,
}: ConfigModalProps) => {
  const [form, setForm] = useState<FormState>(() => configToForm(config))
  const [importError, setImportError] = useState<string | null>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const mouseDownTargetRef = useRef<EventTarget | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownTargetRef.current = e.target
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target === backdropRef.current &&
      mouseDownTargetRef.current === backdropRef.current
    ) {
      onClose()
    }
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    onSave(formToConfig(form))
  }

  const addExtra = () => {
    update({
      annualExtras: [
        ...form.annualExtras,
        { id: nanoid(), name: '', days: 1, month: 1 },
      ],
    })
  }

  const updateExtra = (id: string, patch: Partial<AnnualExtra>) => {
    update({
      annualExtras: form.annualExtras.map((ex) =>
        ex.id === id ? { ...ex, ...patch } : ex,
      ),
    })
  }

  const removeExtra = (id: string) => {
    update({
      annualExtras: form.annualExtras.filter((ex) => ex.id !== id),
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    setImportError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        onImportJson(reader.result as string)
        onClose()
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Invalid JSON file')
      }
    }
    reader.readAsText(file)
    // Reset so the same file can be re-imported
    e.target.value = ''
  }

  const inputBase =
    'rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500'
  const inputClass = `w-full ${inputBase}`
  const labelClass =
    'mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300'

  return (
    <div
      ref={backdropRef}
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="w-full overflow-y-auto rounded-xl bg-white shadow-xl max-sm:h-full max-sm:rounded-none sm:max-h-[85vh] sm:max-w-lg dark:bg-zinc-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex flex-col gap-5">
            {/* Year */}
            <div>
              <label className={labelClass}>Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => {
                  update({ year: parseInt(e.target.value, 10) })
                }}
                onBlur={() => {
                  if (Number.isNaN(form.year)) {
                    update({ year: new Date().getFullYear() })
                  }
                }}
                className={`${inputClass} w-28`}
              />
            </div>

            {/* Annual Leave: totalDays */}
            <div>
              <label className={labelClass}>Annual Leave Days</label>
              <input
                type="number"
                min={1}
                value={form.totalDays}
                onChange={(e) => {
                  update({ totalDays: parseFloat(e.target.value) })
                }}
                onBlur={() => {
                  if (Number.isNaN(form.totalDays)) {
                    update({ totalDays: 21 })
                  }
                }}
                className={`${inputClass} w-28`}
              />
            </div>

            {/* Accrual Mode */}
            <div>
              <label className={labelClass}>Accrual Mode</label>
              <div className="flex gap-2">
                {(
                  [
                    { value: 'rolling', label: 'Rolling monthly' },
                    { value: 'lump_sum', label: 'Lump sum (1 Jan)' },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      update({ accrualMode: value })
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      form.accrualMode === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly accrual (derived, read-only) */}
            {form.accrualMode === 'rolling' && (
              <div>
                <label className={labelClass}>Monthly Accrual</label>
                <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                  {(form.totalDays / 12).toFixed(2)} days/month
                </p>
              </div>
            )}

            {/* Starting Balance */}
            <div>
              <label className={labelClass}>Starting Balance</label>
              <input
                type="number"
                min={0}
                step="any"
                value={form.startingBalance}
                onChange={(e) => {
                  update({ startingBalance: parseFloat(e.target.value) })
                }}
                onBlur={() => {
                  if (Number.isNaN(form.startingBalance)) {
                    update({ startingBalance: 0 })
                  }
                }}
                className={`${inputClass} w-32`}
              />
              <p className="mt-1 text-xs text-zinc-400">
                Carried-over balance at start of year.
              </p>
            </div>

            {/* Annual Extras */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={labelClass}>Annual Extras</label>
                <button
                  type="button"
                  onClick={addExtra}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
              {form.annualExtras.length === 0 && (
                <p className="text-xs text-zinc-400">
                  No extras configured. Add birthday leave, company days, etc.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {form.annualExtras.map((extra) => (
                  <div key={extra.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={extra.name}
                      onChange={(e) => {
                        updateExtra(extra.id, { name: e.target.value })
                      }}
                      className={`${inputBase} min-w-0 flex-1`}
                    />
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={extra.days}
                      onChange={(e) => {
                        updateExtra(extra.id, {
                          days: parseFloat(e.target.value),
                        })
                      }}
                      onBlur={() => {
                        if (Number.isNaN(extra.days)) {
                          updateExtra(extra.id, { days: 1 })
                        }
                      }}
                      className={`${inputBase} w-16 shrink-0`}
                    />
                    <select
                      value={extra.month}
                      onChange={(e) => {
                        updateExtra(extra.id, {
                          month: parseInt(e.target.value, 10),
                        })
                      }}
                      className={`${inputBase} w-20 shrink-0`}
                    >
                      {MONTHS.map((label, i) => (
                        <option key={label} value={i + 1}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        removeExtra(extra.id)
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sick Leave */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  id="sick-toggle"
                  type="checkbox"
                  checked={form.hasSickLeave}
                  onChange={(e) => {
                    update({ hasSickLeave: e.target.checked })
                  }}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
                />
                <label
                  htmlFor="sick-toggle"
                  className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Track Sick Leave
                </label>
              </div>
              {form.hasSickLeave && (
                <div className="mt-2">
                  <label className={labelClass}>Sick Leave Days</label>
                  <input
                    type="number"
                    min={1}
                    value={form.sickDays}
                    onChange={(e) => {
                      update({ sickDays: parseInt(e.target.value, 10) })
                    }}
                    onBlur={() => {
                      if (Number.isNaN(form.sickDays)) {
                        update({ sickDays: 14 })
                      }
                    }}
                    className={`${inputClass} w-28`}
                  />
                </div>
              )}
            </div>

            {/* Import/Export */}
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <label className={labelClass}>Data</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onExportJson}
                  className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <Download size={14} />
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click()
                  }}
                  className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <Upload size={14} />
                  Import JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
              {importError !== null && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {importError}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConfigModal
