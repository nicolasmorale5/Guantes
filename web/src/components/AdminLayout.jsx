import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { auth } from '../services/api'

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  // Verificar autenticación
  if (!auth.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  const usuario = auth.getUsuario()

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    auth.logout()
    navigate('/admin/login')
  }

  const isActive = (path) => {
    return location.pathname === path ? 'admin-nav-item active' : 'admin-nav-item'
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/admin" className="logo">
            <div className="logo-icon">🥊</div>
            <span>Admin</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="admin-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle admin menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav>
          <ul className={`admin-nav ${menuOpen ? 'active' : ''}`}>
            <li>
              <Link to="/admin" className={isActive('/admin')}>
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/tasas" className={isActive('/admin/tasas')}>
                💱 Tasas de Cambio
              </Link>
            </li>
            <li>
              <Link to="/admin/citas" className={isActive('/admin/citas')}>
                📅 Citas
              </Link>
            </li>
            <li>
              <Link to="/admin/oficinas" className={isActive('/admin/oficinas')}>
                🏢 Oficinas
              </Link>
            </li>
            <li>
              <Link to="/" className="admin-nav-item">
                🌐 Ver Sitio
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="admin-nav-item">
                🚪 Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="admin-content">
        <div className="admin-header">
          <h1>Panel de Administración</h1>
          <span>Bienvenido, {usuario?.nombre}</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
