import { useState, useEffect, useCallback } from 'react'
import { X, Trash2, Calendar, Tag, Layers, CheckCircle } from 'lucide-react'
import { useTasks } from '../../contexts/TaskContext'
import '../../styles/panel.css'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const TaskDetailPanel = ({ task, onClose }) => {
  const { updateTask, deleteTask, tasks } = useTasks()
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState(task?.status || 'backlog')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [label, setLabel] = useState(task?.label || '')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Live task from context — stays in sync after saves/realtime
  const liveTask = tasks.find(t => t.id === task?.id) || task

  // Sync local state when live task updates (only if not actively editing)
  useEffect(() => {
    if (liveTask && !dirty) {
      setTitle(liveTask.title || '')
      setDescription(liveTask.description || '')
      setStatus(liveTask.status || 'backlog')
      setPriority(liveTask.priority || 'medium')
      setLabel(liveTask.label || '')
      setDueDate(liveTask.due_date || '')
    }
  }, [liveTask?.id, liveTask?.updated_at])

  // Reset dirty flag when switching tasks
  useEffect(() => {
    setDirty(false)
  }, [task?.id])

  const hasChanges = useCallback(() => {
    if (!liveTask) return false
    return (
      title.trim() !== (liveTask.title || '') ||
      description !== (liveTask.description || '') ||
      status !== (liveTask.status || 'backlog') ||
      priority !== (liveTask.priority || 'medium') ||
      (label.trim() || '') !== (liveTask.label || '') ||
      (dueDate || '') !== (liveTask.due_date || '')
    )
  }, [title, description, status, priority, label, dueDate, liveTask])

  const doSave = useCallback(async (overrides = {}) => {
    const t = overrides.title ?? title
    const d = overrides.description ?? description
    const s = overrides.status ?? status
    const p = overrides.priority ?? priority
    const l = overrides.label ?? label
    const dd = overrides.dueDate ?? dueDate
    if (!t.trim() || !liveTask) return
    setSaving(true)
    await updateTask(liveTask.id, {
      title: t.trim(), description: d, status: s,
      priority: p, label: l.trim() || null, due_date: dd || null,
    })
    setDirty(false)
    setSaving(false)
  }, [title, description, status, priority, label, dueDate, liveTask, updateTask])

  const handleSave = useCallback(async () => {
    if (!hasChanges()) { setDirty(false); return }
    await doSave()
  }, [hasChanges, doSave])

  // Only auto-save on blur if dirty
  const handleBlur = useCallback(() => {
    if (dirty) handleSave()
  }, [dirty, handleSave])

  const markDirty = useCallback((setter) => (e) => {
    setter(e.target.value)
    setDirty(true)
  }, [])

  // Selects & date: save immediately on change
  const handleStatusChange = useCallback((e) => {
    const v = e.target.value
    setStatus(v); setDirty(true)
    doSave({ status: v })
  }, [doSave])

  const handlePriorityChange = useCallback((e) => {
    const v = e.target.value
    setPriority(v); setDirty(true)
    doSave({ priority: v })
  }, [doSave])

  const handleDateChange = useCallback((e) => {
    const v = e.target.value
    setDueDate(v); setDirty(true)
    doSave({ dueDate: v })
  }, [doSave])

  const handleDelete = async () => {
    await deleteTask(liveTask.id)
    onClose()
  }

  if (!task) return null

  const shortId = liveTask.id?.slice(0, 5)?.toUpperCase()
  const statusText = saving ? 'Saving...' : dirty ? 'Unsaved changes' : 'All changes saved'

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <div className="panel-container">
        {/* Header */}
        <div className="panel-header">
          <span className="panel-title">Task VN-{shortId}</span>
          <div className="panel-actions">
            <button className="panel-action-btn danger" onClick={() => setShowDeleteConfirm(true)} title="Delete task">
              <Trash2 size={15} />
            </button>
            <button className="panel-action-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="panel-content">
          <div className="panel-section">
            <textarea className="panel-title-textarea" placeholder="Task title"
              value={title} onChange={markDirty(setTitle)} onBlur={handleBlur} rows={1} />
          </div>

          <div className="panel-meta-grid">
            <div className="panel-meta-label"><Layers size={12} className="inline mr-2" /> Status</div>
            <select className="panel-select" value={status} onChange={handleStatusChange}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <div className="panel-meta-label"><CheckCircle size={12} className="inline mr-2" /> Priority</div>
            <select className="panel-select" value={priority} onChange={handlePriorityChange}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <div className="panel-meta-label"><Tag size={12} className="inline mr-2" /> Label</div>
            <input className="panel-input" value={label} onChange={markDirty(setLabel)} onBlur={handleBlur} placeholder="Add label..." />

            <div className="panel-meta-label"><Calendar size={12} className="inline mr-2" /> Due Date</div>
            <input type="date" className="panel-date-input" value={dueDate} onChange={handleDateChange} />
          </div>

          <div className="panel-section">
            <label className="panel-meta-label mb-2">Description</label>
            <textarea className="panel-description-textarea" placeholder="Add a detailed description..."
              value={description} onChange={markDirty(setDescription)} onBlur={handleBlur} />
          </div>
        </div>

        {/* Footer */}
        <div className="panel-footer">
          <div className={`panel-status ${dirty ? 'unsaved' : ''}`}>{statusText}</div>
          <button className="panel-save-btn" onClick={handleSave} disabled={saving || !title.trim() || !dirty}>Save</button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="modal-backdrop" style={{ zIndex: 1001 }}>
            <div className="modal confirm-dialog">
              <div className="modal-body">
                <div className="confirm-icon"><Trash2 size={22} /></div>
                <h3 className="confirm-title">Delete task?</h3>
                <p className="confirm-message">This action cannot be undone (except for the 5s undo window).</p>
              </div>
              <div className="modal-footer">
                <button className="modal-btn modal-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="modal-btn modal-btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default TaskDetailPanel
