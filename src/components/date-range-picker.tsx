'use client'

import { formatDate } from '@/lib'
import { Calendar } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import 'react-day-picker/style.css'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
}

/** Convert YYYY-MM-DD string to Date at noon (avoids timezone shift) */
const toDate = (dateStr: string): Date => new Date(`${dateStr}T12:00:00`)

/** Convert Date to YYYY-MM-DD string */
const toDateStr = (date: Date): string => {
  const y = date.getFullYear().toString()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const defaultClassNames = getDefaultClassNames()

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selected: DateRange = {
    from: toDate(startDate),
    to: toDate(endDate),
  }

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from === undefined) {
      return
    }
    const newStart = toDateStr(range.from)
    const newEnd = range.to !== undefined ? toDateStr(range.to) : newStart
    onChange(newStart, newEnd)
  }

  const isSameDay = startDate === endDate

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev)
        }}
        className="flex w-full items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-left text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
      >
        <Calendar size={14} className="shrink-0 text-zinc-400" />
        <span className="font-sans">
          {isSameDay
            ? formatDate(startDate)
            : `${formatDate(startDate)} – ${formatDate(endDate)}`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={toDate(startDate)}
            classNames={{
              root: `${defaultClassNames.root} rdp-custom`,
              today: 'rdp-today-custom',
              selected: 'rdp-selected-custom',
              chevron: 'rdp-chevron-custom',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default DateRangePicker
