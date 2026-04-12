import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useTasks } from '../../contexts/TaskContext'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Sun,
  Moon,
  Layers,
} from 'lucide-react'
import '../../styles/sidebar.css'

const Sidebar = () => {
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

  const taskCount = tasks?.length || 0

  return (
    <div className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">FlowBoard</span>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Workspace</div>

        <div className="nav-item active" id="nav-dashboard">
          <LayoutDashboard size={16} />
          <span>My Board</span>
          {taskCount > 0 && (
            <span className="nav-item-badge">{taskCount}</span>
          )}
        </div>

        <div className="nav-item" id="nav-all-tasks">
          <Layers size={16} />
          <span>All Tasks</span>
        </div>

        <div className="sidebar-divider" />

        <div className="nav-item" id="nav-settings">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </nav>

      {/* ── Theme Toggle ── */}
      <div className="theme-toggle-container">
        <button className="theme-toggle" onClick={toggleTheme} id="theme-toggle">
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          <span className={`theme-toggle-switch ${theme === 'light' ? 'active' : ''}`} />
        </button>
      </div>

      {/* ── User Footer ── */}
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
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar