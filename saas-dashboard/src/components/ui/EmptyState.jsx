import { Inbox, CheckCircle2, Clock, Archive } from 'lucide-react'
import '../../styles/empty-state.css'

const COLUMN_CONFIG = {
  backlog: {
    icon: Archive,
    title: 'Nothing in the backlog',
    subtitle: 'Ideas and tasks you haven\'t started planning yet will appear here.',
  },
  todo: {
    icon: Clock,
    title: 'No tasks planned',
    subtitle: 'Tasks that are ready to be worked on will show up here.',
  },
  in_progress: {
    icon: Inbox,
    title: 'Nothing in progress',
    subtitle: 'Tasks you\'re actively working on will appear here.',
  },
  done: {
    icon: CheckCircle2,
    title: 'No completed tasks',
    subtitle: 'Finished tasks will be collected here. Ship it!',
  },
}

const EmptyState = ({ status, onAddTask }) => {
  const config = COLUMN_CONFIG[status] || COLUMN_CONFIG.backlog
  const Icon = config.icon

  return (
    <div className="empty-state">
      <div className="empty-state-icon-wrapper">
        <div className="empty-state-icon-ring">
          <Icon size={20} />
        </div>
      </div>
      <div className="empty-state-title">{config.title}</div>
      <div className="empty-state-subtitle">{config.subtitle}</div>
      {onAddTask && (
        <button className="empty-state-action" onClick={onAddTask}>
          + Add a task
        </button>
      )}
    </div>
  )
}

export default EmptyState
