import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Plus,
  Moon,
  Sun,
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  LogOut,
  Command,
} from 'lucide-react'
import '../../styles/palette.css'

const CommandPalette = ({
  isOpen,
  onClose,
  onAction,
  theme,
  onToggleTheme,
}) => {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const items = [
    { id: 'new-task', label: 'Create new task', icon: <Plus size={15} />, shortcut: 'C' },
    { id: 'toggle-theme', label: `Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`, icon: theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />, shortcut: 'T' },
    { id: 'view-board', label: 'Go to Board', icon: <LayoutDashboard size={15} />, shortcut: 'G B' },
    { id: 'view-active', label: 'Go to Active', icon: <Inbox size={15} />, shortcut: 'G A' },
    { id: 'view-done', label: 'Go to Done', icon: <CheckCircle2 size={15} />, shortcut: 'G D' },
    { id: 'logout', label: 'Sign out', icon: <LogOut size={15} />, shortcut: '⇧ L' },
  ].filter(item => item.label.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % items.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selectedItem = items[selectedIndex]
        if (selectedItem) {
          handleSelect(selectedItem.id)
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, items, selectedIndex, onClose])

  const handleSelect = (id) => {
    if (id === 'toggle-theme') {
      onToggleTheme()
    } else {
      onAction(id)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette" onClick={e => e.stopPropagation()}>
        <div className="palette-input-wrapper">
          <Command size={16} className="text-tertiary" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Search commands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="palette-list">
          {items.map((item, index) => (
            <button
              key={item.id}
              className={`palette-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(item.id)}
            >
              <div className="palette-item-icon">{item.icon}</div>
              <span className="palette-item-label">{item.label}</span>
              {item.shortcut && <span className="palette-item-shortcut">{item.shortcut}</span>}
            </button>
          ))}
          {items.length === 0 && (
            <div className="p-4 text-center text-tertiary text-sm">
              No commands found
            </div>
          )}
        </div>

        <div className="palette-footer">
          <div className="palette-help-item">
            <span className="palette-key">↑↓</span> to navigate
          </div>
          <div className="palette-help-item">
            <span className="palette-key">Enter</span> to select
          </div>
          <div className="palette-help-item">
            <span className="palette-key">Esc</span> to close
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
