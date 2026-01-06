import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { citas, divisas } from '../../services/api'

function Dashboard() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [ultimasCitas, setUltimasCitas] = useState([])
  const [tasas, setTasas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [stats, citasData, tasasData] = await Promise.all([
        citas.obtenerEstadisticas(),
        citas.obtenerTodas({}),
        divisas.obtenerTasas()
      ])
      setEstadisticas(stats)
      setUltimasCitas(citasData.slice(0, 5))
      setTasas(tasasData.slice(0, 4))
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
    setLoading(false)
  }

  const getEstadoBadge = (estado) => {
    const clases = {
      pendiente: 'badge badge-pending',
      confirmada: 'badge badge-confirmed',
      completada: 'badge badge-completed',
      cancelada: 'badge badge-cancelled'
    }
    return <span className={clases[estado]}>{estado}</span>
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{estadisticas?.citas_hoy || 0}</div>
          <div className="stat-label">Citas Hoy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{estadisticas?.citas_pendientes || 0}</div>
          <div className="stat-label">Citas Pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{estadisticas?.citas_completadas || 0}</div>
          <div className="stat-label">Citas Completadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tasas.length}</div>
          <div className="stat-label">Tasas Activas</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Últimas Citas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Últimas Citas</h3>
            <Link to="/admin/citas" className="btn btn-outline btn-sm">Ver todas</Link>
          </div>
          {ultimasCitas.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasCitas.map(cita => (
                    <tr key={cita.id}>
                      <td><strong>{cita.codigo_cita}</strong></td>
                      <td>{cita.nombre_cliente}</td>
                      <td>{cita.fecha} {cita.hora}</td>
                      <td>{getEstadoBadge(cita.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '2rem' }}>
              No hay citas registradas
            </p>
          )}
        </div>

        {/* Citas por Oficina */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Citas por Oficina</h3>
          {estadisticas?.citas_por_oficina?.map((of, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem 0',
              borderBottom: index < estadisticas.citas_por_oficina.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <span>{of.nombre}</span>
              <strong>{of.total}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Acciones Rápidas</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin/tasas" className="btn btn-primary">
            💱 Actualizar Tasas
          </Link>
          <Link to="/admin/citas" className="btn btn-secondary">
            📅 Gestionar Citas
          </Link>
          <Link to="/admin/oficinas" className="btn btn-outline">
            🏢 Administrar Oficinas
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
