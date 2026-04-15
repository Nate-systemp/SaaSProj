import { useState, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useTasks } from '../../contexts/TaskContext'
import '../../styles/calendar.css'

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_COLORS = {
  backlog: 'var(--text-quaternary)',
  todo: 'var(--priority-medium)',
  in_progress: 'var(--warning)',
  done: 'var(--success)',
}

const PRIORITY_CLASSES = {
  urgent: 'cal-task-urgent',
  high: 'cal-task-high',
  medium: 'cal-task-medium',
  low: 'cal-task-low',
}

const CalendarView = ({ onEditTask, onNewTask }) => {
  const { tasks, updateTask } = useTasks()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverDate, setDragOverDate] = useState(null)

  const today = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }, [])

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek < 0) startDayOfWeek = 6

    const days = []

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(currentYear, currentMonth, d),
        isCurrentMonth: true,
      })
    }

    // Next month padding (fill to 42 for 6 rows)
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, d),
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentYear, currentMonth])

  // Map tasks by date string
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = task.due_date.split('T')[0] // Handle ISO strings
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(task)
      }
    })
    // Sort tasks within each date by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    Object.values(map).forEach(arr =>
      arr.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3))
    )
    return map
  }, [tasks])

  // Tasks with no due date
  const unscheduledTasks = useMemo(() => {
    return tasks.filter(t => !t.due_date && t.status !== 'done')
  }, [tasks])

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0]
    return tasks.filter(t =>
      t.due_date &&
      t.due_date.split('T')[0] < todayStr &&
      t.status !== 'done'
    )
  }, [tasks, today])

  const getDateKey = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const isToday = (date) => {
    return date.getTime() === today.getTime()
  }

  const isSelected = (date) => {
    return selectedDate && date.getTime() === selectedDate.getTime()
  }

  const isPast = (date) => {
    return date < today
  }

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Click on a date
  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  // Double-click to create task on that date
  const handleDateDoubleClick = (date) => {
    const dateKey = getDateKey(date)
    onNewTask?.(dateKey)
  }

  // Drag & drop for rescheduling
  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }

  const handleDragOver = (e, date) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(getDateKey(date))
  }

  const handleDragLeave = () => {
    setDragOverDate(null)
  }

  const handleDrop = async (e, date) => {
    e.preventDefault()
    setDragOverDate(null)

    if (!draggedTask) return

    const newDateKey = getDateKey(date)
    if (draggedTask.due_date?.split('T')[0] === newDateKey) {
      setDraggedTask(null)
      return
    }

    await updateTask(draggedTask.id, { due_date: newDateKey })
    setDraggedTask(null)
  }

  // Schedule unscheduled task
  const handleUnscheduledDrop = async (e, date) => {
    handleDrop(e, date)
  }

  // Selected date tasks
  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null
  const selectedDateTasks = selectedDateKey ? (tasksByDate[selectedDateKey] || []) : []

  const formatSelectedDate = (date) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="calendar-view">
      <div className="calendar-main">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="calendar-header-left">
            <h2 className="calendar-month-title">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button className="calendar-today-btn" onClick={goToToday}>
              Today
            </button>
          </div>
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={goToPrevMonth} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <button className="calendar-nav-btn" onClick={goToNextMonth} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Overdue Banner */}
        {overdueTasks.length > 0 && (
          <div className="calendar-overdue-banner">
            <AlertCircle size={13} />
            <span>{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Day Headers */}
        <div className="calendar-grid calendar-day-headers">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid calendar-days">
          {calendarDays.map((dayObj, i) => {
            const dateKey = getDateKey(dayObj.date)
            const dayTasks = tasksByDate[dateKey] || []
            const isOverdue = dayTasks.some(t => isPast(dayObj.date) && t.status !== 'done')

            return (
              <div
                key={i}
                className={`calendar-cell
                  ${!dayObj.isCurrentMonth ? 'other-month' : ''}
                  ${isToday(dayObj.date) ? 'today' : ''}
                  ${isSelected(dayObj.date) ? 'selected' : ''}
                  ${isPast(dayObj.date) && dayObj.isCurrentMonth ? 'past' : ''}
                  ${dragOverDate === dateKey ? 'drag-over' : ''}
                `}
                onClick={() => handleDateClick(dayObj.date)}
                onDoubleClick={() => handleDateDoubleClick(dayObj.date)}
                onDragOver={(e) => handleDragOver(e, dayObj.date)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleUnscheduledDrop(e, dayObj.date)}
              >
                <div className="calendar-cell-header">
                  <span className={`calendar-day-number ${isToday(dayObj.date) ? 'today-badge' : ''}`}>
                    {dayObj.date.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className={`calendar-task-count ${isOverdue ? 'overdue' : ''}`}>
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                <div className="calendar-cell-tasks">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`calendar-task-chip ${PRIORITY_CLASSES[task.priority] || ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditTask?.(task)
                      }}
                      title={task.title}
                    >
                      <span
                        className="calendar-task-status-dot"
                        style={{ background: STATUS_COLORS[task.status] }}
                      />
                      <span className="calendar-task-chip-title">{task.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="calendar-task-overflow">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side Panel */}
      <div className="calendar-sidebar">
        {/* Selected Date Detail */}
        {selectedDate ? (
          <div className="calendar-sidebar-section">
            <div className="calendar-sidebar-header">
              <CalendarIcon size={13} />
              <span>{formatSelectedDate(selectedDate)}</span>
            </div>

            {selectedDateTasks.length > 0 ? (
              <div className="calendar-sidebar-tasks">
                {selectedDateTasks.map(task => (
                  <button
                    key={task.id}
                    className="calendar-sidebar-task"
                    onClick={() => onEditTask?.(task)}
                  >
                    <span
                      className="calendar-sidebar-task-priority"
                      style={{ background: STATUS_COLORS[task.status] }}
                    />
                    <div className="calendar-sidebar-task-info">
                      <div className="calendar-sidebar-task-title">{task.title}</div>
                      <div className="calendar-sidebar-task-meta">
                        <span className={`calendar-priority-tag ${task.priority}`}>{task.priority}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="calendar-sidebar-empty">
                <p>No tasks on this day</p>
                <button
                  className="calendar-sidebar-add-btn"
                  onClick={() => handleDateDoubleClick(selectedDate)}
                >
                  <Plus size={12} />
                  Add task
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="calendar-sidebar-section">
            <div className="calendar-sidebar-header">
              <CalendarIcon size={13} />
              <span>Select a date</span>
            </div>
            <p className="calendar-sidebar-hint">
              Click a date to view tasks. Double-click to create one. Drag tasks between dates to reschedule.
            </p>
          </div>
        )}

        {/* Unscheduled Tasks */}
        <div className="calendar-sidebar-section">
          <div className="calendar-sidebar-header">
            <Clock size={13} />
            <span>Unscheduled</span>
            <span className="calendar-sidebar-count">{unscheduledTasks.length}</span>
          </div>

          {unscheduledTasks.length > 0 ? (
            <div className="calendar-sidebar-tasks">
              {unscheduledTasks.map(task => (
                <div
                  key={task.id}
                  className="calendar-sidebar-task draggable"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => onEditTask?.(task)}
                >
                  <span
                    className="calendar-sidebar-task-priority"
                    style={{ background: STATUS_COLORS[task.status] }}
                  />
                  <div className="calendar-sidebar-task-info">
                    <div className="calendar-sidebar-task-title">{task.title}</div>
                    <div className="calendar-sidebar-task-meta">
                      <span className={`calendar-priority-tag ${task.priority}`}>{task.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="calendar-sidebar-empty">
              <p>All tasks are scheduled!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarView
