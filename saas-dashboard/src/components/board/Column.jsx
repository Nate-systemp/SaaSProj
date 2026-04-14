import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'

const Column = ({ id, title, tasks, onAddTask, onEditTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  const taskIds = tasks.map(t => t.id)

  return (
    <div className="column" id={`column-${id}`}>
      <div className="column-header">
        <span className={`column-status-dot ${id}`} />
        <span className="column-title">{title}</span>
        <span className="column-count">{tasks.length}</span>
        <div className="column-actions">
          <button
            className="column-add-btn"
            onClick={onAddTask}
            title={`Add to ${title}`}
            aria-label={`Add to ${title}`}
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

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
              <div className="column-empty-line" />
              <span className="column-empty-text">No tasks</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default Column
