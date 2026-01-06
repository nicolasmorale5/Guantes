import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { oficinas } from '../services/api'

function Oficinas() {
  const [listaOficinas, setListaOficinas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarOficinas()
  }, [])

  const cargarOficinas = async () => {
    try {
      const data = await oficinas.obtenerTodas()
      setListaOficinas(data)
    } catch (error) {
      console.error('Error al cargar oficinas:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-secondary)' }}>Nuestras Oficinas</h1>

      <div className="offices-grid">
        {listaOficinas.map(oficina => (
          <div key={oficina.id} className="office-card">
            <div className="office-header">
              <h2 className="office-name">{oficina.nombre}</h2>
            </div>
            <div className="office-body">
              <div className="office-info">
                <span className="office-icon">📍</span>
                <div>
                  <strong>Dirección</strong>
                  <p>{oficina.direccion}</p>
                </div>
              </div>

              <div className="office-info">
                <span className="office-icon">📞</span>
                <div>
                  <strong>Teléfono</strong>
                  <p>{oficina.telefono}</p>
                </div>
              </div>

              <div className="office-info">
                <span className="office-icon">🕐</span>
                <div>
                  <strong>Horario</strong>
                  <p>{oficina.horario}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Link
                  to={`/agendar?oficina=${oficina.id}`}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Agendar Cita
                </Link>
                {oficina.latitud && oficina.longitud && (
                  <a
                    href={`https://www.google.com/maps?q=${oficina.latitud},${oficina.longitud}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    Ver Mapa
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {listaOficinas.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No hay oficinas disponibles en este momento.</p>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>¿Por qué visitarnos?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--color-primary-dark)' }}>Seguridad</h4>
            <p style={{ color: 'var(--color-text-light)' }}>Instalaciones seguras y personal capacitado.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--color-primary-dark)' }}>Rapidez</h4>
            <p style={{ color: 'var(--color-text-light)' }}>Transacciones ágiles y sin complicaciones.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--color-primary-dark)' }}>Confianza</h4>
            <p style={{ color: 'var(--color-text-light)' }}>Años de experiencia en el mercado de divisas.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Oficinas
