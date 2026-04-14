import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTasks } from '../../contexts/TaskContext'
import Column from './Column'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import TaskDetailPanel from './TaskDetailPanel'
import '../../styles/board.css'

const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'Todo' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

const Board = ({ searchQuery, priorityFilter, activeView, columnFilter, loading }) => {
  const { tasks, moveTask } = useTasks()
  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null) // For Detail Panel
  const [showModal, setShowModal] = useState(false) // For Creation only
  const [modalDefaultStatus, setModalDefaultStatus] = useState('backlog')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  // Filter tasks globally
  const filteredTasks = useMemo(() => {
    let result = tasks

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.label?.toLowerCase().includes(q)
      )
    }

    if (priorityFilter) {
      result = result.filter(t => t.priority === priorityFilter)
    }

    return result
  }, [tasks, searchQuery, priorityFilter])

  // Determine which columns to show 
  const visibleColumns = useMemo(() => {
    if (columnFilter) {
      return COLUMNS.filter(c => c.id === columnFilter)
    }

    switch (activeView) {
      case 'active':
        return COLUMNS.filter(c => c.id === 'todo' || c.id === 'in_progress')
      case 'done':
        return COLUMNS.filter(c => c.id === 'done')
      default:
        return COLUMNS
    }
  }, [activeView, columnFilter])

  const getFilteredTasksByStatus = useCallback((status) => {
    return filteredTasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position)
  }, [filteredTasks])

  // Drag handlers
  const handleDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = active.id
    const overId = over.id
    const activeTaskData = tasks.find(t => t.id === activeId)
    if (!activeTaskData) return

    let targetStatus
    if (COLUMNS.some(col => col.id === overId)) {
      targetStatus = overId
    } else {
      const overTask = tasks.find(t => t.id === overId)
      if (overTask) {
        targetStatus = overTask.status
      } else {
        return
      }
    }

    const tasksInTarget = tasks
      .filter(t => t.status === targetStatus && t.id !== activeId)
      .sort((a, b) => a.position - b.position)

    let newPosition = 0
    if (over.id !== targetStatus) {
      const overIndex = tasksInTarget.findIndex(t => t.id === overId)
      newPosition = overIndex >= 0 ? overIndex : tasksInTarget.length
    } else {
      newPosition = tasksInTarget.length
    }

    if (activeTaskData.status !== targetStatus || activeTaskData.position !== newPosition) {
      moveTask(activeId, targetStatus, newPosition)
    }
  }

  const handleDragCancel = () => setActiveTask(null)

  // Creation Modal
  const handleNewTask = (status = 'backlog') => {
    setSelectedTask(null)
    setModalDefaultStatus(status)
    setShowModal(true)
  }

  // Editing Side Panel
  const handleEditTask = (task) => {
    setShowModal(false)
    setSelectedTask(task)
  }

  // Expose for keyboard shortcuts
  if (typeof window !== 'undefined') {
    window.__flowboardNewTask = handleNewTask
  }

  // Loading state
  if (loading) {
    return (
      <div className="board" id="kanban-board">
        {COLUMNS.map((col) => (
          <div className="column" key={col.id}>
            <div className="column-header">
              <span className={`column-status-dot ${col.id}`} />
              <span className="column-title">{col.title}</span>
              <span className="column-count">—</span>
            </div>
            <div className="column-tasks">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card" style={{ animationDelay: `${(i - 1) * 80}ms` }}>
                  <div className="skeleton skeleton-line-sm" />
                  <div className="skeleton skeleton-line-lg" />
                  <div className="skeleton skeleton-line-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="board" id="kanban-board">
          {visibleColumns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={getFilteredTasksByStatus(col.id)}
              onAddTask={() => handleNewTask(col.id)}
              onEditTask={handleEditTask}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="task-card-overlay">
              <TaskCard task={activeTask} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Creation focused modal */}
      {showModal && (
        <TaskModal
          defaultStatus={modalDefaultStatus}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Editorial side panel for details/editing */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  )
}

export default Board