import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { auth } from '../../services/api'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Si ya está autenticado, redirigir al dashboard
  if (auth.isAuthenticated()) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await auth.login(email, password)
      navigate('/admin')
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión')
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon" style={{ width: '60px', height: '60px', fontSize: '1.5rem', margin: '0 auto' }}>
            🥊
          </div>
          <h1>Guantes de Oro</h1>
          <p style={{ color: 'var(--color-text-light)' }}>Panel de Administración</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@guantesdeoro.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
          <a href="/" style={{ color: 'var(--color-primary)' }}>← Volver al sitio</a>
        </p>
      </div>
    </div>
  )
}

export default Login
