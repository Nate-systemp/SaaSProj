import { useEffect } from 'react'

const useKeyboardShortcuts = ({ onNewTask, onSearchFocus, onClearFilters }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't fire shortcuts when typing in an input/textarea
      const tag = e.target.tagName.toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable

      // Escape always works
      if (e.key === 'Escape') {
        // Close any open modal by clicking the backdrop
        const backdrop = document.getElementById('task-modal-backdrop')
        if (backdrop) {
          backdrop.click()
          return
        }
        // Blur search
        if (document.activeElement) {
          document.activeElement.blur()
        }
        return
      }

      // Ctrl/Cmd+K — command palette (reserved for future)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // Future: open command palette
        return
      }

      // Don't process remaining shortcuts when typing
      if (isTyping) return

      switch (e.key) {
        case 'c':
        case 'C':
          e.preventDefault()
          onNewTask?.()
          break
        case '/':
          e.preventDefault()
          onSearchFocus?.()
          break
        case '0':
          e.preventDefault()
          onClearFilters?.()
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onSearchFocus, onClearFilters])
}

export default useKeyboardShortcuts
