'use client'

import { Calendar, Settings } from 'lucide-react'
import ThemeToggle from './theme-toggle'

interface HeaderProps {
  onOpenConfig: () => void
}

const Header = ({ onOpenConfig }: HeaderProps) => (
  <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
    <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-3 sm:px-4">
      <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
        <Calendar size={20} className="text-blue-500" />
        <span>TakeLeave.sg</span>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button
          type="button"
          onClick={onOpenConfig}
          className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          <Settings size={16} />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </div>
  </header>
)

export default Header
