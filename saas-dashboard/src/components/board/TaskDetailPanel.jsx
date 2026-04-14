import { useState, useEffect, useRef } from 'react'
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
  const { updateTask, deleteTask } = useTasks()
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState(task?.status || 'backlog')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [label, setLabel] = useState(task?.label || '')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Update local state when task changes (switching between cards)
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setStatus(task.status || 'backlog')
      setPriority(task.priority || 'medium')
      setLabel(task.label || '')
      setDueDate(task.due_date || '')
    }
  }, [task])

  const handleSave = async () => {
    if (!title.trim() || !task) return
    setSaving(true)
    await updateTask(task.id, {
      title: title.trim(),
      description,
      status,
      priority,
      label: label.trim() || null,
      due_date: dueDate || null,
    })
    setSaving(false)
  }

  // Auto-save on blur logic can be added here for even more premium feel
  const handleBlur = () => {
    handleSave()
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    onClose()
  }

  if (!task) return null

  const shortId = task.id?.slice(0, 5)?.toUpperCase()

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <div className="panel-container">
        {/* Header */}
        <div className="panel-header">
          <span className="panel-title">Task FB-{shortId}</span>
          <div className="panel-actions">
            <button
              className="panel-action-btn danger"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete task"
            >
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
            <textarea
              className="panel-title-textarea"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              rows={1}
            />
          </div>

          <div className="panel-meta-grid">
            <div className="panel-meta-label">
              <Layers size={12} className="inline mr-2" /> Status
            </div>
            <select
              className="panel-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onBlur={handleBlur}
            >
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <div className="panel-meta-label">
              <CheckCircle size={12} className="inline mr-2" /> Priority
            </div>
            <select
              className="panel-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              onBlur={handleBlur}
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <div className="panel-meta-label">
              <Tag size={12} className="inline mr-2" /> Label
            </div>
            <input
              className="panel-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              placeholder="Add label..."
            />

            <div className="panel-meta-label">
              <Calendar size={12} className="inline mr-2" /> Due Date
            </div>
            <input
              type="date"
              className="panel-date-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={handleBlur}
            />
          </div>

          <div className="panel-section">
            <label className="panel-meta-label mb-2">Description</label>
            <textarea
              className="panel-description-textarea"
              placeholder="Add a detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="panel-footer">
          <div className="panel-status">
            {saving ? 'Saving...' : 'All changes saved'}
          </div>
          <button
            className="panel-save-btn"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            Save
          </button>
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
