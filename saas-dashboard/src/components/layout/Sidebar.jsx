import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useTasks } from '../../contexts/TaskContext'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import BoardSwitcher from '../board/BoardSwitcher'
import ActivityLog from '../ui/ActivityLog'
import '../../styles/sidebar.css'
import Logo from '../common/Logo'

const Sidebar = ({ activeView, onViewChange }) => {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { tasks } = useTasks()
  const navigate = useNavigate()
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true)
  }

  const handleConfirmSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Expose for Command Palette
  if (typeof window !== 'undefined') {
    window.__vantageSignOut = handleSignOutClick
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const avatarLetter = displayName[0]?.toUpperCase()

  // Counts by status
  const inProgressCount = tasks?.filter(t => t.status === 'in_progress').length || 0
  const doneCount = tasks?.filter(t => t.status === 'done').length || 0
  const totalCount = tasks?.length || 0

  return (
    <div className="sidebar">
      {/* ... (Logo and Nav sections) */}
      <div className="sidebar-logo">
        <Logo size={22} />
      </div>

      {/* Board Switcher */}
      <div className="sidebar-board-switcher">
        <BoardSwitcher />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Workspace</div>

        <button
          className={`nav-item ${activeView === 'board' ? 'active' : ''}`}
          onClick={() => onViewChange('board')}
          id="nav-board"
        >
          <LayoutDashboard size={15} />
          <span>Board</span>
          {totalCount > 0 && (
            <span className="nav-item-badge">{totalCount}</span>
          )}
        </button>

        <button
          className={`nav-item ${activeView === 'active' ? 'active' : ''}`}
          onClick={() => onViewChange('active')}
          id="nav-active"
        >
          <Inbox size={15} />
          <span>Active</span>
          {inProgressCount > 0 && (
            <span className="nav-item-badge">{inProgressCount}</span>
          )}
        </button>

        <button
          className={`nav-item ${activeView === 'done' ? 'active' : ''}`}
          onClick={() => onViewChange('done')}
          id="nav-done"
        >
          <CheckCircle2 size={15} />
          <span>Done</span>
          {doneCount > 0 && (
            <span className="nav-item-badge">{doneCount}</span>
          )}
        </button>

        <div className="sidebar-divider" />

        <button
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => onViewChange('settings')}
          id="nav-settings"
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Activity Log */}
      <ActivityLog />

      <div className="theme-toggle-container">
        <button className="theme-toggle" onClick={toggleTheme} id="theme-toggle">
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          <span className={`theme-toggle-switch ${theme === 'light' ? 'active' : ''}`} />
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{avatarLetter}</div>
          <div className="user-meta">
            <div className="user-name">{displayName}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button
            className="signout-btn"
            onClick={handleSignOutClick}
            title="Sign out"
            id="signout-btn"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation */}
      {showSignOutConfirm && (
        <div className="modal-backdrop" style={{ zIndex: 3000 }} onClick={() => setShowSignOutConfirm(false)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-icon danger">
                <LogOut size={22} />
              </div>
              <h3 className="confirm-title">Sign out?</h3>
              <p className="confirm-message">
                You will need to sign in again to access your board.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowSignOutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-btn-danger"
                onClick={handleConfirmSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar