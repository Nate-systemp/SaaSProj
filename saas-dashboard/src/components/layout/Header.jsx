import { useState, useRef, useEffect } from 'react'
import { Search, SlidersHorizontal, Plus, X, Check } from 'lucide-react'
import { useTasks } from '../../contexts/TaskContext'
import '../../styles/header.css'

const PRIORITY_OPTIONS = [
  { value: null, label: 'All', color: 'var(--text-quaternary)' },
  { value: 'urgent', label: 'Urgent', color: 'var(--priority-urgent)' },
  { value: 'high', label: 'High', color: 'var(--priority-high)' },
  { value: 'medium', label: 'Medium', color: 'var(--priority-medium)' },
  { value: 'low', label: 'Low', color: 'var(--priority-low)' },
]

const COLUMN_LABELS = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

const Header = ({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  onNewTask,
  taskCount,
  activeView,
  columnFilter,
  onColumnFilterClear,
}) => {
  const [showFilter, setShowFilter] = useState(false)
  const filterRef = useRef(null)
  const searchRef = useRef(null)
  const { board } = useTasks()

  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    window.__flowboardSearchRef = searchRef
    return () => { delete window.__flowboardSearchRef }
  }, [])

  const viewTitles = {
    board: board?.name || 'Board',
    active: 'Active Tasks',
    done: 'Completed',
    settings: 'Settings',
  }

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="board-title">{viewTitles[activeView] || 'Board'}</h1>
        {taskCount > 0 && activeView !== 'settings' && (
          <span className="board-title-badge">{taskCount}</span>
        )}
        {/* Column filter indicator (1-4 shortcuts) */}
        {columnFilter && (
          <button
            className="column-filter-indicator"
            onClick={onColumnFilterClear}
            title="Press 0 to clear"
          >
            <span>{COLUMN_LABELS[columnFilter]}</span>
            <X size={10} />
          </button>
        )}
      </div>

      <div className="header-right">
        {activeView !== 'settings' && (
          <>
            {/* Search */}
            <div className="search-bar" id="search-bar">
              <Search size={13} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                id="search-input"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  style={{ display: 'flex' }}
                  aria-label="Clear search"
                >
                  <X size={11} />
                </button>
              ) : (
                <span className="search-shortcut">/</span>
              )}
            </div>

            {/* Filter */}
            <div className="filter-dropdown-wrapper" ref={filterRef}>
              <button
                className={`header-icon-btn ${priorityFilter ? 'active' : ''}`}
                onClick={() => setShowFilter(!showFilter)}
                id="filter-btn"
                title="Filter by priority"
              >
                <SlidersHorizontal size={15} />
                {priorityFilter && <span className="badge-dot" />}
              </button>

              {showFilter && (
                <div className="filter-dropdown" id="filter-dropdown">
                  <div className="filter-dropdown-label">Priority</div>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || 'all'}
                      className={`filter-option ${priorityFilter === opt.value ? 'selected' : ''}`}
                      onClick={() => {
                        onPriorityFilterChange(opt.value)
                        setShowFilter(false)
                      }}
                    >
                      <span
                        className="filter-option-dot"
                        style={{ background: opt.color }}
                      />
                      <span>{opt.label}</span>
                      <Check size={12} className="filter-option-check" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New Task */}
            <button className="new-task-btn" onClick={onNewTask} id="new-task-btn">
              <Plus size={14} />
              <span>New</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Header