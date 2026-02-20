'use client'

import { Minus, Plus } from 'lucide-react'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min: number
  step: number
  id?: string
}

const NumberStepper = ({
  value,
  onChange,
  min,
  step,
  id,
}: NumberStepperProps) => {
  const decrement = () => {
    onChange(Math.max(min, value - step))
  }

  const increment = () => {
    onChange(value + step)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value)
    if (!Number.isNaN(parsed)) {
      onChange(Math.max(min, parsed))
    }
  }

  const btnClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 dark:active:bg-zinc-600'

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease"
        className={`${btnClass} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Minus size={14} />
      </button>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-14 appearance-none rounded-md border border-zinc-200 bg-zinc-50 px-1 py-1.5 text-center font-mono text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        aria-label="Increase"
        className={btnClass}
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

export default NumberStepper
