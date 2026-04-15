import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Check, Pencil, Trash2, X } from 'lucide-react'
import { useTasks } from '../../contexts/TaskContext'
import '../../styles/board-switcher.css'

const BoardSwitcher = () => {
  const { board, boards, switchBoard, createBoard, renameBoard, deleteBoard } = useTasks()
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setIsCreating(false)
        setEditingId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Auto-focus input when creating
  useEffect(() => {
    if (isCreating) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isCreating])

  const handleCreate = async () => {
    if (!newBoardName.trim()) return
    await createBoard(newBoardName.trim())
    setNewBoardName('')
    setIsCreating(false)
  }

  const handleRename = async (boardId) => {
    if (!editName.trim()) return
    await renameBoard(boardId, editName.trim())
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = async (boardId) => {
    await deleteBoard(boardId)
  }

  const handleSwitch = async (boardId) => {
    if (boardId === board?.id) {
      setIsOpen(false)
      return
    }
    await switchBoard(boardId)
    setIsOpen(false)
  }

  return (
    <div className="board-switcher" ref={dropdownRef}>
      <button
        className="board-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        id="board-switcher-toggle"
      >
        <span className="board-switcher-name">{board?.name || 'My Board'}</span>
        <ChevronDown size={14} className={`board-switcher-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="board-switcher-dropdown">
          <div className="board-switcher-label">Your Boards</div>

          <div className="board-switcher-list">
            {boards.map((b) => (
              <div
                key={b.id}
                className={`board-switcher-item ${b.id === board?.id ? 'active' : ''}`}
              >
                {editingId === b.id ? (
                  <div className="board-switcher-edit-row">
                    <input
                      className="board-switcher-edit-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(b.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                    />
                    <button
                      className="board-switcher-icon-btn"
                      onClick={() => handleRename(b.id)}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      className="board-switcher-icon-btn"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="board-switcher-item-btn"
                      onClick={() => handleSwitch(b.id)}
                    >
                      <span className="board-switcher-dot" />
                      <span>{b.name}</span>
                      {b.id === board?.id && <Check size={12} className="board-switcher-check" />}
                    </button>
                    <div className="board-switcher-item-actions">
                      <button
                        className="board-switcher-icon-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingId(b.id)
                          setEditName(b.name)
                        }}
                        title="Rename"
                      >
                        <Pencil size={11} />
                      </button>
                      {boards.length > 1 && (
                        <button
                          className="board-switcher-icon-btn danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(b.id)
                          }}
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="board-switcher-divider" />

          {isCreating ? (
            <div className="board-switcher-create-form">
              <input
                ref={inputRef}
                className="board-switcher-create-input"
                placeholder="Board name..."
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') {
                    setIsCreating(false)
                    setNewBoardName('')
                  }
                }}
              />
              <button
                className="board-switcher-create-submit"
                onClick={handleCreate}
                disabled={!newBoardName.trim()}
              >
                Create
              </button>
            </div>
          ) : (
            <button
              className="board-switcher-create-btn"
              onClick={() => setIsCreating(true)}
            >
              <Plus size={13} />
              <span>New Board</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BoardSwitcher
