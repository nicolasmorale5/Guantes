import { useState, useEffect } from 'react'
import { oficinas } from '../../services/api'

function AdminOficinas() {
  const [listaOficinas, setListaOficinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [mostrarNueva, setMostrarNueva] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    horario: '',
    latitud: '',
    longitud: ''
  })

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const crearOficina = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    try {
      await oficinas.crear({
        ...formData,
        latitud: formData.latitud ? parseFloat(formData.latitud) : null,
        longitud: formData.longitud ? parseFloat(formData.longitud) : null
      })
      setMensaje('Oficina creada exitosamente')
      setMostrarNueva(false)
      setFormData({ nombre: '', direccion: '', telefono: '', horario: '', latitud: '', longitud: '' })
      cargarOficinas()
    } catch (error) {
      setError(error.message || 'Error al crear la oficina')
    }
  }

  const actualizarOficina = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    try {
      await oficinas.actualizar(editando.id, {
        ...formData,
        latitud: formData.latitud ? parseFloat(formData.latitud) : null,
        longitud: formData.longitud ? parseFloat(formData.longitud) : null
      })
      setMensaje('Oficina actualizada exitosamente')
      setEditando(null)
      setFormData({ nombre: '', direccion: '', telefono: '', horario: '', latitud: '', longitud: '' })
      cargarOficinas()
    } catch (error) {
      setError(error.message || 'Error al actualizar la oficina')
    }
  }

  const eliminarOficina = async (id) => {
    if (!confirm('¿Está seguro de desactivar esta oficina?')) return

    try {
      await oficinas.eliminar(id)
      setMensaje('Oficina desactivada exitosamente')
      cargarOficinas()
    } catch (error) {
      setError(error.message || 'Error al desactivar la oficina')
    }
  }

  const iniciarEdicion = (oficina) => {
    setEditando(oficina)
    setFormData({
      nombre: oficina.nombre,
      direccion: oficina.direccion,
      telefono: oficina.telefono || '',
      horario: oficina.horario || '',
      latitud: oficina.latitud || '',
      longitud: oficina.longitud || ''
    })
    setMostrarNueva(false)
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setMostrarNueva(false)
    setFormData({ nombre: '', direccion: '', telefono: '', horario: '', latitud: '', longitud: '' })
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Administrar Oficinas</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setMostrarNueva(!mostrarNueva)
            setEditando(null)
            if (!mostrarNueva) {
              setFormData({ nombre: '', direccion: '', telefono: '', horario: '', latitud: '', longitud: '' })
            }
          }}
        >
          {mostrarNueva ? 'Cancelar' : '+ Nueva Oficina'}
        </button>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Formulario */}
      {(mostrarNueva || editando) && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>
            {editando ? 'Editar Oficina' : 'Agregar Nueva Oficina'}
          </h3>
          <form onSubmit={editando ? actualizarOficina : crearOficina}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Nombre de la sucursal"
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+57 605 123 4567"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Dirección *</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                placeholder="Dirección completa"
              />
            </div>
            <div className="form-group">
              <label>Horario</label>
              <input
                type="text"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                placeholder="Ej: Lun-Vie: 8:00-18:00, Sáb: 9:00-13:00"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Latitud</label>
                <input
                  type="number"
                  step="0.0001"
                  name="latitud"
                  value={formData.latitud}
                  onChange={handleChange}
                  placeholder="Ej: 11.0041"
                />
              </div>
              <div className="form-group">
                <label>Longitud</label>
                <input
                  type="number"
                  step="0.0001"
                  name="longitud"
                  value={formData.longitud}
                  onChange={handleChange}
                  placeholder="Ej: -74.8141"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editando ? 'Guardar Cambios' : 'Crear Oficina'}
              </button>
              <button type="button" className="btn btn-outline" onClick={cancelarEdicion}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de oficinas */}
      <div className="offices-grid">
        {listaOficinas.map(oficina => (
          <div key={oficina.id} className="office-card">
            <div className="office-header">
              <h3 className="office-name">{oficina.nombre}</h3>
            </div>
            <div className="office-body">
              <div className="office-info">
                <span className="office-icon">📍</span>
                <p>{oficina.direccion}</p>
              </div>
              {oficina.telefono && (
                <div className="office-info">
                  <span className="office-icon">📞</span>
                  <p>{oficina.telefono}</p>
                </div>
              )}
              {oficina.horario && (
                <div className="office-info">
                  <span className="office-icon">🕐</span>
                  <p>{oficina.horario}</p>
                </div>
              )}
              {oficina.latitud && oficina.longitud && (
                <div className="office-info">
                  <span className="office-icon">🗺️</span>
                  <p>Lat: {oficina.latitud}, Lng: {oficina.longitud}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => iniciarEdicion(oficina)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--color-error)', color: 'white' }}
                  onClick={() => eliminarOficina(oficina.id)}
                >
                  Desactivar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {listaOficinas.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No hay oficinas registradas</p>
        </div>
      )}
    </div>
  )
}

export default AdminOficinas
