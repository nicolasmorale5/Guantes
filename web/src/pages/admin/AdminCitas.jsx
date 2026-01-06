import { useState, useEffect } from 'react'
import { citas, oficinas } from '../../services/api'

function AdminCitas() {
  const [listaCitas, setListaCitas] = useState([])
  const [listaOficinas, setListaOficinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const [filtros, setFiltros] = useState({
    fecha: '',
    estado: '',
    oficina_id: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarCitas()
  }, [filtros])

  const cargarDatos = async () => {
    try {
      const oficinasData = await oficinas.obtenerTodas()
      setListaOficinas(oficinasData)
    } catch (error) {
      console.error('Error al cargar oficinas:', error)
    }
  }

  const cargarCitas = async () => {
    setLoading(true)
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, v]) => v !== '')
      )
      const data = await citas.obtenerTodas(filtrosLimpios)
      setListaCitas(data)
    } catch (error) {
      console.error('Error al cargar citas:', error)
    }
    setLoading(false)
  }

  const actualizarEstado = async (id, nuevoEstado) => {
    setError('')
    setMensaje('')

    try {
      await citas.actualizarEstado(id, nuevoEstado)
      setMensaje('Estado actualizado exitosamente')
      cargarCitas()
    } catch (error) {
      setError(error.message || 'Error al actualizar el estado')
    }
  }

  const getEstadoBadge = (estado) => {
    const clases = {
      pendiente: 'badge badge-pending',
      confirmada: 'badge badge-confirmed',
      completada: 'badge badge-completed',
      cancelada: 'badge badge-cancelled'
    }
    const nombres = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada'
    }
    return <span className={clases[estado]}>{nombres[estado]}</span>
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Gestionar Citas</h2>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Fecha</label>
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) => setFiltros(prev => ({ ...prev, fecha: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Oficina</label>
            <select
              value={filtros.oficina_id}
              onChange={(e) => setFiltros(prev => ({ ...prev, oficina_id: e.target.value }))}
            >
              <option value="">Todas</option>
              {listaOficinas.map(o => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => setFiltros({ fecha: '', estado: '', oficina_id: '' })}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de citas */}
      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : listaCitas.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Oficina</th>
                  <th>Fecha/Hora</th>
                  <th>Operación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaCitas.map(cita => (
                  <tr key={cita.id}>
                    <td><strong>{cita.codigo_cita}</strong></td>
                    <td>{cita.nombre_cliente}</td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        📞 {cita.telefono_cliente}
                        {cita.email_cliente && <><br />✉️ {cita.email_cliente}</>}
                      </div>
                    </td>
                    <td>{cita.oficina_nombre}</td>
                    <td>
                      <div>
                        <strong>{formatearFecha(cita.fecha)}</strong>
                        <br />
                        <span style={{ color: 'var(--color-text-light)' }}>{cita.hora}</span>
                      </div>
                    </td>
                    <td>
                      {cita.monto} {cita.divisa_origen} → {cita.divisa_destino}
                    </td>
                    <td>{getEstadoBadge(cita.estado)}</td>
                    <td>
                      {cita.estado !== 'cancelada' && cita.estado !== 'completada' && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              actualizarEstado(cita.id, e.target.value)
                            }
                          }}
                          style={{ padding: '0.25rem', fontSize: '0.875rem' }}
                        >
                          <option value="">Cambiar estado</option>
                          {cita.estado !== 'confirmada' && <option value="confirmada">Confirmar</option>}
                          <option value="completada">Completar</option>
                          <option value="cancelada">Cancelar</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
            No se encontraron citas con los filtros seleccionados
          </p>
        )}
      </div>

      <div style={{ marginTop: '1rem', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
        Total: {listaCitas.length} citas
      </div>
    </div>
  )
}

export default AdminCitas
