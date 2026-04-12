import { useState, useEffect, useRef } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useTasks } from '../../contexts/TaskContext'
import '../../styles/modal.css'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const TaskModal = ({ task, defaultStatus, onClose }) => {
  const { createTask, updateTask, deleteTask } = useTasks()
  const isEditing = !!task

  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState(task?.status || defaultStatus || 'backlog')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [label, setLabel] = useState(task?.label || '')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const titleRef = useRef(null)

  // Auto-focus title on mount
  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)

    if (isEditing) {
      await updateTask(task.id, {
        title: title.trim(),
        description,
        status,
        priority,
        label: label.trim() || null,
        due_date: dueDate || null,
      })
    } else {
      await createTask({
        title: title.trim(),
        description,
        status,
        priority,
        label: label.trim() || null,
        due_date: dueDate || null,
      })
    }

    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    onClose()
  }

  // Click backdrop to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} id="task-modal-backdrop">
      <div className="modal" id="task-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="modal-form-group">
              <label className="modal-form-label" htmlFor="task-title">Title</label>
              <input
                ref={titleRef}
                id="task-title"
                type="text"
                className="modal-form-input"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="modal-form-group">
              <label className="modal-form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="modal-form-input modal-form-textarea"
                placeholder="Add more details... (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Status */}
            {isEditing && (
              <div className="modal-form-group">
                <label className="modal-form-label">Status</label>
                <div className="priority-selector">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      className={`priority-option ${status === s.value ? 'selected medium' : ''}`}
                      onClick={() => setStatus(s.value)}
                    >
                      <span className={`column-status-dot ${s.value}`} style={{ width: 6, height: 6 }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Priority */}
            <div className="modal-form-group">
              <label className="modal-form-label">Priority</label>
              <div className="priority-selector">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-option ${priority === p ? `selected ${p}` : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    <span className={`priority-dot ${p}`} />
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div className="modal-form-group">
              <label className="modal-form-label" htmlFor="task-label">Label</label>
              <input
                id="task-label"
                type="text"
                className="modal-form-input"
                placeholder="e.g., design, frontend, bug"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            {/* Due Date */}
            <div className="modal-form-group">
              <label className="modal-form-label" htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                className="modal-form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            {isEditing && (
              <button
                type="button"
                className="modal-btn modal-btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ marginRight: 'auto' }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
            <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-submit"
              disabled={!title.trim() || saving}
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          className="modal-backdrop"
          onClick={() => setShowDeleteConfirm(false)}
          style={{ zIndex: 1001 }}
        >
          <div
            className="modal confirm-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-body">
              <div className="confirm-icon">
                <Trash2 size={22} />
              </div>
              <h3 className="confirm-title">Delete task?</h3>
              <p className="confirm-message">
                "{task?.title}" will be permanently deleted. You can undo this action for 5 seconds after deletion.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskModal
