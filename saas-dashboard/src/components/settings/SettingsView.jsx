import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import '../../styles/settings.css'

const SettingsView = () => {
  const { user, profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success' | 'error', message: string }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    const { error } = await updateProfile({
      full_name: fullName.trim()
    })

    if (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to update profile' })
    } else {
      setFeedback({ type: 'success', message: 'Profile updated successfully' })
      setTimeout(() => setFeedback(null), 3000)
    }
    setSaving(false)
  }

  const avatarLetter = (fullName || user?.email || '?')[0]?.toUpperCase()

  return (
    <div className="settings-view">
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account and workspace preferences.</p>
      </header>

      {/* Profile Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Personal Profile</h2>
          <p className="settings-section-desc">Modify your display information.</p>
        </div>

        <div className="settings-card">
          <form onSubmit={handleSaveProfile}>
            <div className="settings-form-group">
              <label className="settings-label">Avatar</label>
              <div className="settings-avatar-group">
                <div className="settings-avatar-preview">{avatarLetter}</div>
                <div className="settings-avatar-info">
                  <p className="settings-section-desc">Default avatars are generated from your name.</p>
                </div>
              </div>
            </div>

            <div className="settings-form-group">
              <label className="settings-label" htmlFor="full-name">Full Name</label>
              <input
                id="full-name"
                type="text"
                className="settings-input"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="settings-form-group">
              <label className="settings-label">Email Address</label>
              <input
                type="email"
                className="settings-input"
                value={user?.email || ''}
                readOnly
                disabled
              />
              <p className="settings-section-desc" style={{ marginTop: '0.5rem' }}>Email changes are currently restricted.</p>
            </div>

            <div className="settings-save-footer">
              <button 
                type="submit" 
                className="settings-btn settings-btn-primary"
                disabled={saving || fullName.trim() === profile?.full_name}
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="settings-spinner" />
                    Saving...
                  </>
                ) : 'Save Updates'}
              </button>
            </div>

            {feedback && (
              <div className={`settings-feedback ${feedback.type}`}>
                {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{feedback.message}</span>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Workspace Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Workspace Configuration</h2>
          <p className="settings-section-desc">Customize how FlowBoard looks and behaves.</p>
        </div>

        <div className="settings-card">
          <div className="settings-form-group">
            <label className="settings-label">Current Plan</label>
            <div className="settings-plan-row">
              <div className="settings-plan-info">
                <span className="settings-plan-name">Pro Individual</span>
                <span className="settings-plan-price">$0.00 / month (Beta Access)</span>
              </div>
              <span className="settings-plan-badge">Active</span>
            </div>
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Interface Density</label>
            <select className="settings-input" defaultValue="comfort">
              <option value="comfort">Comfort (Default)</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SettingsView
