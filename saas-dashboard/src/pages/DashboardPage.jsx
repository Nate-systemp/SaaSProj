import { useState, useCallback } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import Board from '../components/board/Board'
import { TaskProvider, useTasks } from '../contexts/TaskContext'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import '../styles/dashboard.css'

const DashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState(null)
  const [activeView, setActiveView] = useState('board')
  const { tasks } = useTasks()

  const handleNewTask = useCallback(() => {
    if (window.__flowboardNewTask) {
      window.__flowboardNewTask('backlog')
    }
  }, [])

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onSearchFocus: () => {
      window.__flowboardSearchRef?.current?.focus()
    },
    onClearFilters: () => {
      setPriorityFilter(null)
      setSearchQuery('')
    },
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
        />
        <Board
          searchQuery={searchQuery}
          priorityFilter={priorityFilter}
          activeView={activeView}
        />
      </div>
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