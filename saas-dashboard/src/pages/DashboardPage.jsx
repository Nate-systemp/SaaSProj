import { useState, useCallback, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import Board from '../components/board/Board'
import CalendarView from '../components/board/CalendarView'
import SettingsView from '../components/settings/SettingsView'
import CommandPalette from '../components/ui/CommandPalette'
import TaskModal from '../components/board/TaskModal'
import TaskDetailPanel from '../components/board/TaskDetailPanel'
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

  // Calendar-level modal/panel state (shared across board + calendar views)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [calendarModalDefaultDate, setCalendarModalDefaultDate] = useState(null)
  const [calendarSelectedTask, setCalendarSelectedTask] = useState(null)

  const { tasks, loading } = useTasks()
  const { theme, toggleTheme } = useTheme()

  // Debounce search — 250ms delay
  const debouncedSearch = useDebounce(searchQuery, 250)

  const handleNewTask = useCallback((statusOrDate = 'backlog') => {
    if (activeView === 'calendar') {
      // statusOrDate is a date string like '2026-04-20'
      setCalendarModalDefaultDate(statusOrDate)
      setCalendarModalOpen(true)
    } else if (window.__flowboardNewTask) {
      window.__flowboardNewTask(statusOrDate)
    }
  }, [activeView])

  const handleCalendarEditTask = useCallback((task) => {
    setCalendarSelectedTask(task)
  }, [])

  const handleCalendarNewTask = useCallback((dateStr) => {
    setCalendarModalDefaultDate(dateStr)
    setCalendarModalOpen(true)
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
      case 'view-calendar': setActiveView('calendar'); break;
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
        ) : activeView === 'calendar' ? (
          <>
            <CalendarView
              onEditTask={handleCalendarEditTask}
              onNewTask={handleCalendarNewTask}
            />
            {calendarModalOpen && (
              <TaskModal
                defaultStatus="backlog"
                defaultDueDate={calendarModalDefaultDate}
                onClose={() => {
                  setCalendarModalOpen(false)
                  setCalendarModalDefaultDate(null)
                }}
              />
            )}
            {calendarSelectedTask && (
              <TaskDetailPanel
                task={calendarSelectedTask}
                onClose={() => setCalendarSelectedTask(null)}
              />
            )}
          </>
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