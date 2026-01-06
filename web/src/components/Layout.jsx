import { Outlet, Link, useLocation } from 'react-router-dom'

function Layout() {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-icon">🥊</div>
            <span>Guantes de Oro</span>
          </Link>
          <nav className="nav">
            <Link to="/" className={isActive('/')}>Inicio</Link>
            <Link to="/tasas" className={isActive('/tasas')}>Tasas</Link>
            <Link to="/oficinas" className={isActive('/oficinas')}>Oficinas</Link>
            <Link to="/agendar" className={isActive('/agendar')}>Agendar Cita</Link>
            <Link to="/consultar" className={isActive('/consultar')}>Consultar Cita</Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Guantes de Oro</h4>
            <p>Casa de cambio de confianza en Barranquilla, Colombia.</p>
            <p>Ofrecemos las mejores tasas del mercado.</p>
          </div>
          <div className="footer-section">
            <h4>Nuestras Oficinas</h4>
            <ul>
              <li>Cl. 93 #46-90 Local 2, Riomar</li>
              <li>Aeropuerto Ernesto Cortissoz</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <ul>
              <li>Tel: +57 605 123 4567</li>
              <li>Email: info@guantesdeoro.com</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Horarios</h4>
            <ul>
              <li>Lun - Vie: 8:00 AM - 6:00 PM</li>
              <li>Sábados: 9:00 AM - 1:00 PM</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Guantes de Oro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
