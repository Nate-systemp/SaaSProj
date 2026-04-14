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
import '../../styles/sidebar.css'

const Sidebar = ({ activeView, onViewChange }) => {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { tasks } = useTasks()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const avatarLetter = displayName[0]?.toUpperCase()

  // Counts by status
  const inProgressCount = tasks?.filter(t => t.status === 'in_progress').length || 0
  const doneCount = tasks?.filter(t => t.status === 'done').length || 0
  const totalCount = tasks?.length || 0

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">F</div>
        <span className="logo-text">FlowBoard</span>
      </div>

      {/* Navigation */}
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

      {/* Theme */}
      <div className="theme-toggle-container">
        <button className="theme-toggle" onClick={toggleTheme} id="theme-toggle">
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          <span className={`theme-toggle-switch ${theme === 'light' ? 'active' : ''}`} />
        </button>
      </div>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{avatarLetter}</div>
          <div className="user-meta">
            <div className="user-name">{displayName}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button
            className="signout-btn"
            onClick={handleSignOut}
            title="Sign out"
            id="signout-btn"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar