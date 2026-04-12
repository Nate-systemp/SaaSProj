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
  const { tasks } = useTasks()

  const handleNewTask = useCallback(() => {
    // The Board component exposes this via window
    if (window.__flowboardNewTask) {
      window.__flowboardNewTask('backlog')
    }
  }, [])

  // Keyboard shortcuts
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

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onNewTask={handleNewTask}
          taskCount={tasks?.length || 0}
        />
        <Board
          searchQuery={searchQuery}
          priorityFilter={priorityFilter}
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