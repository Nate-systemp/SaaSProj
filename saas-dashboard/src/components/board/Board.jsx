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
import '../../styles/board.css'

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', emptyIcon: '📋', emptyText: 'No backlog items' },
  { id: 'todo', title: 'Todo', emptyIcon: '📝', emptyText: 'Nothing to do yet' },
  { id: 'in_progress', title: 'In Progress', emptyIcon: '⚡', emptyText: 'Nothing in progress' },
  { id: 'done', title: 'Done', emptyIcon: '✅', emptyText: 'No completed tasks' },
]

const Board = ({ searchQuery, priorityFilter }) => {
  const { tasks, moveTask, getTasksByStatus } = useTasks()
  const [activeTask, setActiveTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalDefaultStatus, setModalDefaultStatus] = useState('backlog')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before dragging starts
      },
    })
  )

  // Filter tasks
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

  const getFilteredTasksByStatus = useCallback((status) => {
    return filteredTasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position)
  }, [filteredTasks])

  // ── Drag Handlers ──
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

    // Find the active task
    const activeTaskData = tasks.find(t => t.id === activeId)
    if (!activeTaskData) return

    // Determine the target column
    let targetStatus

    // Check if dropped directly on a column
    if (COLUMNS.some(col => col.id === overId)) {
      targetStatus = overId
    } else {
      // Dropped on another task — find that task's column
      const overTask = tasks.find(t => t.id === overId)
      if (overTask) {
        targetStatus = overTask.status
      } else {
        return
      }
    }

    // Calculate new position
    const tasksInTargetColumn = tasks
      .filter(t => t.status === targetStatus && t.id !== activeId)
      .sort((a, b) => a.position - b.position)

    let newPosition = 0
    if (over.id !== targetStatus) {
      // Dropped on a task — find position relative to it
      const overIndex = tasksInTargetColumn.findIndex(t => t.id === overId)
      newPosition = overIndex >= 0 ? overIndex : tasksInTargetColumn.length
    } else {
      // Dropped on the column itself — put at end
      newPosition = tasksInTargetColumn.length
    }

    // Only update if something changed
    if (activeTaskData.status !== targetStatus || activeTaskData.position !== newPosition) {
      moveTask(activeId, targetStatus, newPosition)
    }
  }

  const handleDragCancel = () => {
    setActiveTask(null)
  }

  // ── Modal Handlers ──
  const handleNewTask = (status = 'backlog') => {
    setEditingTask(null)
    setModalDefaultStatus(status)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
  }

  // Expose handleNewTask globally for Header
  if (typeof window !== 'undefined') {
    window.__flowboardNewTask = handleNewTask
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
          {COLUMNS.map((col) => {
            const columnTasks = getFilteredTasksByStatus(col.id)
            return (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={columnTasks}
                emptyIcon={col.emptyIcon}
                emptyText={col.emptyText}
                onAddTask={() => handleNewTask(col.id)}
                onEditTask={handleEditTask}
              />
            )
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="task-card-overlay">
              <TaskCard task={activeTask} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showModal && (
        <TaskModal
          task={editingTask}
          defaultStatus={modalDefaultStatus}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}

export default Board