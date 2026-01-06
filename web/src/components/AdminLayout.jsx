import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { auth } from '../services/api'

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // Verificar autenticación
  if (!auth.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  const usuario = auth.getUsuario()

  const handleLogout = () => {
    auth.logout()
    navigate('/admin/login')
  }

  const isActive = (path) => {
    return location.pathname === path ? 'admin-nav-item active' : 'admin-nav-item'
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="logo">
            <div className="logo-icon">🥊</div>
            <span>Admin</span>
          </div>
        </div>
        <nav>
          <ul className="admin-nav">
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
              <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
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
