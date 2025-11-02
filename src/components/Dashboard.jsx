// Página del Dashboard - Solo accesible para usuarios autenticados
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <section className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 className="dashboard-heading">Welcome to Easy Go Dashboard</h1>
          
          <div className="dashboard-user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h2>Hello, {user?.email?.split('@')[0]}!</h2>
              <p className="user-email">{user?.email}</p>
              <p className="user-status">
                Account Status: {user?.email_confirmed_at ? '✓ Verified' : '⚠ Not Verified'}
              </p>
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>AI Websites</h3>
              <p className="stat-number">0</p>
              <span className="stat-label">Created</span>
            </div>
            
            <div className="stat-card">
              <h3>Projects</h3>
              <p className="stat-number">0</p>
              <span className="stat-label">In Progress</span>
            </div>
            
            <div className="stat-card">
              <h3>Templates</h3>
              <p className="stat-number">24</p>
              <span className="stat-label">Available</span>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={() => navigate('/tools/cv-builder')}>
              🎯 Create AI CV
            </button>
            <button className="btn btn-primary">
              Create New Website
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back to Home
            </button>
            <button className="btn btn-danger" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          <div className="dashboard-info">
            <h3>Getting Started</h3>
            <ul>
              <li>✓ Account created successfully</li>
              <li>✓ Email: {user?.email}</li>
              <li>✓ User ID: {user?.id}</li>
              <li>Start creating your first AI-powered website!</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard
