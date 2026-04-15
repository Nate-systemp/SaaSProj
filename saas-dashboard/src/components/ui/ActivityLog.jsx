import { useState, useEffect, useCallback } from 'react'
import { Clock, ArrowRight, Plus, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useTasks } from '../../contexts/TaskContext'
import '../../styles/activity-log.css'

const STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

const ActivityLog = () => {
  const { user } = useAuth()
  const { board } = useTasks()
  const [activities, setActivities] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchActivities = useCallback(async () => {
    if (!user || !board) return

    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('board_id', board.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setActivities(data)
    }
    setLoading(false)
  }, [user, board])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Subscribe to realtime activity updates
  useEffect(() => {
    if (!board) return

    const channel = supabase
      .channel('activity-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `board_id=eq.${board.id}`,
        },
        (payload) => {
          setActivities(prev => [payload.new, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [board])

  const relativeTime = (dateStr) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getIcon = (action) => {
    switch (action) {
      case 'created': return <Plus size={12} />
      case 'moved': return <ArrowRight size={12} />
      case 'updated': return <Pencil size={12} />
      case 'deleted': return <Trash2 size={12} />
      default: return <Clock size={12} />
    }
  }

  const getDescription = (activity) => {
    switch (activity.action) {
      case 'created':
        return <><strong>{activity.task_title}</strong> created in {STATUS_LABELS[activity.to_status] || activity.to_status}</>
      case 'moved':
        return (
          <>
            <strong>{activity.task_title}</strong>
            <span className="activity-move">
              {STATUS_LABELS[activity.from_status]}
              <ArrowRight size={10} />
              {STATUS_LABELS[activity.to_status]}
            </span>
          </>
        )
      case 'updated':
        return <><strong>{activity.task_title}</strong> updated</>
      case 'deleted':
        return <><strong>{activity.task_title}</strong> deleted</>
      default:
        return <><strong>{activity.task_title}</strong> {activity.action}</>
    }
  }

  if (loading || activities.length === 0) return null

  const displayedActivities = isExpanded ? activities : activities.slice(0, 5)

  return (
    <div className="activity-log">
      <button
        className="activity-log-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Clock size={13} />
        <span>Activity</span>
        <span className="activity-log-count">{activities.length}</span>
        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      <div className={`activity-log-list ${isExpanded ? 'expanded' : ''}`}>
        {displayedActivities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className={`activity-icon ${activity.action}`}>
              {getIcon(activity.action)}
            </div>
            <div className="activity-content">
              <div className="activity-description">
                {getDescription(activity)}
              </div>
              <div className="activity-time">
                {relativeTime(activity.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityLog
