import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar } from 'lucide-react'

const TaskCard = ({ task, onClick, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = isOverlay ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Format due date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const isOverdue = date < now && task.status !== 'done'
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { formatted, isOverdue }
  }

  const dueInfo = formatDueDate(task.due_date)

  // Short task ID for display
  const shortId = task.id?.slice(0, 6)?.toUpperCase()

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
    >
      {/* Priority Indicator */}
      <div className="task-card-priority">
        <span className={`priority-dot ${task.priority}`} />
        <span className={`priority-label ${task.priority}`}>
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <div className="task-card-title">{task.title}</div>

      {/* Description preview */}
      {task.description && (
        <div className="task-card-description">{task.description}</div>
      )}

      {/* Footer: Tags + Due Date */}
      <div className="task-card-footer">
        <div className="task-card-tags">
          {task.label && (
            <span className="task-tag">{task.label}</span>
          )}
        </div>
        {dueInfo && (
          <span className={`task-due ${dueInfo.isOverdue ? 'overdue' : ''}`}>
            <Calendar size={11} />
            {dueInfo.formatted}
          </span>
        )}
      </div>
    </div>
  )
}

export default TaskCard
