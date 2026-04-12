import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'

const Column = ({ id, title, tasks, emptyIcon, emptyText, onAddTask, onEditTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  const taskIds = tasks.map(t => t.id)

  return (
    <div className="column" id={`column-${id}`}>
      {/* Column Header */}
      <div className="column-header">
        <span className={`column-status-dot ${id}`} />
        <span className="column-title">{title}</span>
        <span className="column-count">{tasks.length}</span>

        <div className="column-actions">
          <button
            className="column-add-btn"
            onClick={onAddTask}
            title={`Add task to ${title}`}
            aria-label={`Add task to ${title}`}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Task List */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`column-tasks ${isOver ? 'drag-over' : ''}`}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onEditTask(task)}
              />
            ))
          ) : (
            <div className="column-empty">
              <span className="column-empty-icon">{emptyIcon}</span>
              <span className="column-empty-text">{emptyText}</span>
              <span className="column-empty-hint">
                Drop tasks here or click +
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default Column
