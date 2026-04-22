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

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const isOverdue = date < now && task.status !== 'done'
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { formatted, isOverdue }
  }

  const dueInfo = formatDueDate(task.due_date)
  const shortId = task.id?.slice(0, 5)?.toUpperCase()

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      data-priority={task.priority}
      onClick={onClick}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
    >
      {/* Header row: ID + Priority badge */}
      <div className="task-card-header">
        <span className="task-card-id">VN-{shortId}</span>
        <span className={`task-card-priority-badge ${task.priority}`}>
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <div className="task-card-title">{task.title}</div>

      {/* Description */}
      {task.description && (
        <div className="task-card-description">{task.description}</div>
      )}

      {/* Footer */}
      {(task.label || dueInfo) && (
        <div className="task-card-footer">
          <div className="task-card-tags">
            {task.label && <span className="task-tag">{task.label}</span>}
          </div>
          {dueInfo && (
            <span className={`task-due ${dueInfo.isOverdue ? 'overdue' : ''}`}>
              <Calendar size={10} />
              {dueInfo.formatted}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskCard
