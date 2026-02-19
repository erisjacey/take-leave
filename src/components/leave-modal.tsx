'use client'

import type { LeaveEntry, LeaveTag, LeaveType } from '@/lib'
import { TAG_CONFIG } from '@/lib'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import DateRangePicker from './date-range-picker'

interface LeaveModalProps {
  entry?: LeaveEntry
  onSave: (data: Omit<LeaveEntry, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}

interface FormData {
  title: string
  leaveType: LeaveType
  tag: LeaveTag
  startDate: string
  endDate: string
  days: number
  notes: string
}

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'annual', label: 'Annual' },
  { value: 'sick', label: 'Sick' },
]

const TAGS = Object.keys(TAG_CONFIG) as LeaveTag[]

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

const LeaveModal = ({ entry, onSave, onDelete, onClose }: LeaveModalProps) => {
  const isEdit = entry !== undefined
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState<FormData>({
    title: entry?.title ?? '',
    leaveType: entry?.leaveType ?? 'annual',
    tag: entry?.tag ?? 'personal',
    startDate: entry?.startDate ?? today,
    endDate: entry?.endDate ?? today,
    days: entry?.days ?? Math.max(1, countWeekdays(today, today)),
    notes: entry?.notes ?? '',
  })
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const backdropRef = useRef<HTMLDivElement>(null)

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

  const update = (patch: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const handleDateRangeChange = (start: string, end: string) => {
    const newDays = countWeekdays(start, end)
    update({
      startDate: start,
      endDate: end,
      days: newDays > 0 ? newDays : form.days,
    })
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    onSave({
      title: form.title,
      leaveType: form.leaveType,
      tag: form.tag,
      startDate: form.startDate,
      endDate: form.endDate,
      days: form.days,
      ...(form.notes !== '' && { notes: form.notes }),
    })
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  const inputClass =
    'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500'

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit leave entry' : 'Add leave entry'}
    >
      <div className="w-full overflow-y-auto rounded-xl bg-white shadow-xl max-sm:h-full max-sm:rounded-none sm:max-w-md dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {isEdit ? 'Edit Leave' : 'Add Leave'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => {
                  update({ title: e.target.value })
                }}
                placeholder="e.g. Bali trip"
                className={inputClass}
              />
            </div>

            {/* Leave type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Leave Type
              </label>
              <div className="flex gap-2">
                {LEAVE_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      update({ leaveType: value })
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      form.leaveType === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Tag
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => {
                  const cfg = TAG_CONFIG[t]
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        update({ tag: t })
                      }}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-opacity ${cfg.bgClass} ${cfg.textClass} ${
                        form.tag === t
                          ? 'ring-2 ring-blue-500 ring-offset-1'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date range */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Dates
              </label>
              <DateRangePicker
                startDate={form.startDate}
                endDate={form.endDate}
                onChange={handleDateRangeChange}
              />
            </div>

            {/* Days */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Days
              </label>
              <input
                type="number"
                required
                min={0.5}
                step={0.5}
                value={form.days}
                onChange={(e) => {
                  update({ days: parseFloat(e.target.value) })
                }}
                className="w-28 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <p className="mt-1 text-xs text-zinc-400">
                Auto-calculated weekdays. Adjust for half-days.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Notes{' '}
                <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => {
                  update({ notes: e.target.value })
                }}
                rows={2}
                placeholder="Add any notes..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            {isEdit && onDelete !== undefined ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Are you sure?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfirmingDelete(false)
                    }}
                    className="text-xs font-medium text-zinc-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmingDelete(true)
                  }}
                  className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex gap-2">
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
                {isEdit ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeaveModal
