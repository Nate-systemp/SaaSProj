import { useEffect } from 'react'

const useKeyboardShortcuts = ({ onNewTask, onSearchFocus, onClearFilters, onColumnFilter, onTogglePalette }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable

      // Escape always works
      if (e.key === 'Escape') {
        const backdrop = document.getElementById('task-modal-backdrop')
        if (backdrop) {
          backdrop.click()
          return
        }
        if (document.activeElement) {
          document.activeElement.blur()
        }
        return
      }

      // Ctrl/Cmd+K — command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onTogglePalette?.()
        return
      }

      // Don't fire remaining shortcuts while typing
      if (isTyping) return

      switch (e.key) {
        case 'c':
        case 'C':
          e.preventDefault()
          onNewTask?.()
          break
        case 't':
        case 'T':
          // Toggle theme shortcut
          break
        case '/':
          e.preventDefault()
          onSearchFocus?.()
          break
        case '0':
          e.preventDefault()
          onClearFilters?.()
          break
        // Column filter shortcuts
        case '1':
          e.preventDefault()
          onColumnFilter?.('backlog')
          break
        case '2':
          e.preventDefault()
          onColumnFilter?.('todo')
          break
        case '3':
          e.preventDefault()
          onColumnFilter?.('in_progress')
          break
        case '4':
          e.preventDefault()
          onColumnFilter?.('done')
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onSearchFocus, onClearFilters, onColumnFilter, onTogglePalette])
}

export default useKeyboardShortcuts
