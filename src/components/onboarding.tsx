'use client'

import type { AccrualMode, AnnualExtra, PtoConfig } from '@/lib'
import { MONTHS } from '@/lib'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useState } from 'react'

interface OnboardingProps {
  onComplete: (config: PtoConfig) => void
}

interface FormState {
  totalDays: number
  accrualMode: AccrualMode
  startingBalance: number
  hasSickLeave: boolean
  sickDays: number
  annualExtras: AnnualExtra[]
}

const TOTAL_STEPS = 5

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    totalDays: 21,
    accrualMode: 'rolling',
    startingBalance: 0,
    hasSickLeave: false,
    sickDays: 14,
    annualExtras: [],
  })

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const goNext = () => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleComplete = () => {
    const monthlyAccrual =
      form.accrualMode === 'rolling' ? form.totalDays / 12 : 0
    const year = new Date().getFullYear()

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

    onComplete({
      accrualMode: form.accrualMode,
      totalDays: form.totalDays,
      monthlyAccrual,
      resetMonth: 1,
      startingBalance: form.startingBalance,
      year,
      annualExtras: form.annualExtras,
      leaveTypes,
    })
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

  const inputClass =
    'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500'
  const inputBase =
    'rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500'

  // ─── Step renderers ─────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Annual leave days
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        How many annual leave days do you get per year?
      </p>
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
        className={`${inputClass} mt-4 w-28`}
      />
    </div>
  )

  const renderStep2 = () => (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Accrual mode
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        How does your company credit your leave?
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {(
          [
            {
              value: 'rolling',
              title: 'Rolling monthly',
              desc: 'Leave accrues each month (total / 12 per month)',
            },
            {
              value: 'lump_sum',
              title: 'Lump sum',
              desc: 'Full allocation credited on 1 January',
            },
          ] as const
        ).map(({ value, title, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              update({ accrualMode: value })
            }}
            className={`rounded-lg border px-4 py-3 text-left transition-colors ${
              form.accrualMode === value
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                form.accrualMode === value
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-zinc-900 dark:text-zinc-50'
              }`}
            >
              {title}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Current balance
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Your carried-over balance at the start of this year. May differ from
        your total if you started mid-year or rolled over days.
      </p>
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
        className={`${inputClass} mt-4 w-32`}
      />
    </div>
  )

  const renderStep4 = () => (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Sick leave
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Do you want to track sick leave separately?
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {(
          [
            { value: true, label: 'Yes, track sick leave' },
            { value: false, label: 'No, skip sick leave' },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => {
              update({ hasSickLeave: value })
            }}
            className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              form.hasSickLeave === value
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-300'
                : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {form.hasSickLeave && (
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Sick leave days per year
          </label>
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
  )

  const renderStep5 = () => (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Annual extras
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Birthday leave, company days off, etc. You can skip this and add them
        later in settings.
      </p>
      <div className="mt-4 flex flex-col gap-2">
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
      <button
        type="button"
        onClick={addExtra}
        className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        <Plus size={14} />
        Add extra
      </button>
    </div>
  )

  const stepRenderers = [
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
  ]

  const isLastStep = step === TOTAL_STEPS

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-400">
            Step {step.toString()} of {TOTAL_STEPS.toString()}
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i < step
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {stepRenderers[step - 1]()}
        </div>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}
          {isLastStep ? (
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
