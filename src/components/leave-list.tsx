import type { LeaveEntry, LeaveTag } from '@/lib'
import { formatDate, TAG_CONFIG } from '@/lib'
import { Calendar, Coffee, Pencil, Pin, Plane, Plus, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const TAG_ICONS: Record<LeaveTag, LucideIcon> = {
  travel: Plane,
  personal: Coffee,
  family: Users,
  other: Pin,
}

interface LeaveListProps {
  entries: LeaveEntry[]
  onAdd: () => void
  onEdit: (entry: LeaveEntry) => void
}

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center gap-3 py-16 text-center">
    <Calendar size={36} className="text-zinc-300 dark:text-zinc-600" />
    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
      No leave entries yet
    </p>
    <button
      type="button"
      onClick={onAdd}
      className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
    >
      Add your first entry
    </button>
  </div>
)

interface EntryRowProps {
  entry: LeaveEntry
  onEdit: (entry: LeaveEntry) => void
}

const EntryRow = ({ entry, onEdit }: EntryRowProps) => {
  const { tag, title, startDate, endDate, days } = entry
  const tagConfig = TAG_CONFIG[tag]
  const Icon = TAG_ICONS[tag]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <span
        className={`flex w-[4.5rem] shrink-0 items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium sm:w-[5.5rem] sm:px-2 ${tagConfig.bgClass} ${tagConfig.textClass}`}
      >
        <Icon size={11} />
        {tagConfig.label}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {title}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {startDate === endDate
            ? formatDate(startDate)
            : `${formatDate(startDate)} – ${formatDate(endDate)}`}
        </p>
      </div>

      <span className="font-mono text-sm text-zinc-600 tabular-nums dark:text-zinc-400">
        {days.toString()}d
      </span>

      <button
        type="button"
        onClick={() => {
          onEdit(entry)
        }}
        aria-label={`Edit ${title}`}
        className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <Pencil size={13} />
      </button>
    </div>
  )
}

interface SectionProps {
  title: string
  entries: LeaveEntry[]
  onEdit: (entry: LeaveEntry) => void
}

const Section = ({ title, entries, onEdit }: SectionProps) => (
  <div>
    <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
      {title}
    </p>
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <EntryRow key={entry.id} entry={entry} onEdit={onEdit} />
      ))}
    </div>
  </div>
)

const LeaveList = ({ entries, onAdd, onEdit }: LeaveListProps) => {
  const today = new Date().toISOString().slice(0, 10)

  const upcoming = entries
    .filter((e) => e.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  const past = entries
    .filter((e) => e.startDate < today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Leave Entries
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-blue-400 dark:hover:bg-blue-950/40"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="p-4">
        {entries.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <div className="flex flex-col gap-6">
            {upcoming.length > 0 && (
              <Section title="Upcoming" entries={upcoming} onEdit={onEdit} />
            )}
            {past.length > 0 && (
              <Section title="Past" entries={past} onEdit={onEdit} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveList
