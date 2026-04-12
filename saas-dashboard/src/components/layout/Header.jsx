import { useState, useRef, useEffect } from 'react'
import { Search, Filter, Plus, X, Check } from 'lucide-react'
import '../../styles/header.css'

const PRIORITY_OPTIONS = [
  { value: null, label: 'All Priorities', color: 'var(--text-tertiary)' },
  { value: 'urgent', label: 'Urgent', color: 'var(--priority-urgent)' },
  { value: 'high', label: 'High', color: 'var(--priority-high)' },
  { value: 'medium', label: 'Medium', color: 'var(--priority-medium)' },
  { value: 'low', label: 'Low', color: 'var(--priority-low)' },
]

const Header = ({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  onNewTask,
  taskCount,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterRef = useRef(null)
  const searchRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Expose search ref for keyboard shortcut focus
  useEffect(() => {
    window.__flowboardSearchRef = searchRef
    return () => { delete window.__flowboardSearchRef }
  }, [])

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="board-title">My Board</h1>
        {taskCount > 0 && (
          <span className="board-title-badge">{taskCount} tasks</span>
        )}
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="search-bar" id="search-bar">
          <Search size={14} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{ display: 'flex', padding: '2px' }}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
          <span className="search-shortcut">/</span>
        </div>

        {/* Filter */}
        <div className="filter-dropdown-wrapper" ref={filterRef}>
          <button
            className={`filter-btn ${priorityFilter ? 'active' : ''}`}
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            id="filter-btn"
          >
            <Filter size={14} />
            <span>Filter</span>
            {priorityFilter && <span className="filter-badge">1</span>}
          </button>

          {showFilterDropdown && (
            <div className="filter-dropdown" id="filter-dropdown">
              <div className="filter-dropdown-label">Priority</div>
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value || 'all'}
                  className={`filter-option ${priorityFilter === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    onPriorityFilterChange(opt.value)
                    setShowFilterDropdown(false)
                  }}
                >
                  <span
                    className="filter-option-dot"
                    style={{ background: opt.color }}
                  />
                  <span>{opt.label}</span>
                  <Check size={14} className="filter-option-check" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Task Button */}
        <button className="new-task-btn" onClick={onNewTask} id="new-task-btn">
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>
    </div>
  )
}

export default Header