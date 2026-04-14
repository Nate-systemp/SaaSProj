import { useState, useCallback } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import Board from '../components/board/Board'
import SettingsView from '../components/settings/SettingsView'
import CommandPalette from '../components/ui/CommandPalette'
import { TaskProvider, useTasks } from '../contexts/TaskContext'
import { useTheme } from '../contexts/ThemeContext'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import useDebounce from '../hooks/useDebounce'
import '../styles/dashboard.css'

const DashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState(null)
  const [activeView, setActiveView] = useState('board')
  const [columnFilter, setColumnFilter] = useState(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const { tasks, loading } = useTasks()
  const { theme, toggleTheme } = useTheme()

  // Debounce search — 250ms delay
  const debouncedSearch = useDebounce(searchQuery, 250)

  const handleNewTask = useCallback(() => {
    if (window.__flowboardNewTask) {
      window.__flowboardNewTask('backlog')
    }
  }, [])

  const handleColumnFilter = useCallback((column) => {
    // Toggle: if already filtering this column, clear it
    setColumnFilter(prev => prev === column ? null : column)
    // Switch to board view to show the filtered column
    setActiveView('board')
  }, [])

  const handlePaletteAction = (id) => {
    switch (id) {
      case 'new-task': handleNewTask(); break;
      case 'view-board': setActiveView('board'); break;
      case 'view-active': setActiveView('active'); break;
      case 'view-done': setActiveView('done'); break;
      case 'logout': window.__flowboardSignOut?.(); break;
      default: break;
    }
  }

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onSearchFocus: () => {
      window.__flowboardSearchRef?.current?.focus()
    },
    onClearFilters: () => {
      setPriorityFilter(null)
      setSearchQuery('')
      setColumnFilter(null)
    },
    onColumnFilter: handleColumnFilter,
    onTogglePalette: () => setIsPaletteOpen(prev => !prev),
  })

  // Count for current view
  const viewTaskCount = (() => {
    switch (activeView) {
      case 'active':
        return tasks?.filter(t => t.status === 'todo' || t.status === 'in_progress').length || 0
      case 'done':
        return tasks?.filter(t => t.status === 'done').length || 0
      default:
        return tasks?.length || 0
    }
  })()

  return (
    <div className="dashboard">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="dashboard-main">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onNewTask={handleNewTask}
          taskCount={viewTaskCount}
          activeView={activeView}
          columnFilter={columnFilter}
          onColumnFilterClear={() => setColumnFilter(null)}
        />
        {activeView === 'settings' ? (
          <SettingsView />
        ) : (
          <Board
            searchQuery={debouncedSearch}
            priorityFilter={priorityFilter}
            activeView={activeView}
            columnFilter={columnFilter}
            loading={loading}
          />
        )}
      </div>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onAction={handlePaletteAction}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  )
}

const DashboardPage = () => {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  )
}

export default DashboardPage