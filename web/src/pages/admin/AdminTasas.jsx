import { useState, useEffect } from 'react'
import { divisas } from '../../services/api'

function AdminTasas() {
  const [tasas, setTasas] = useState([])
  const [listaDivisas, setListaDivisas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [mostrarNueva, setMostrarNueva] = useState(false)

  const [nuevaTasa, setNuevaTasa] = useState({
    divisa_origen: '',
    divisa_destino: '',
    tasa_compra: '',
    tasa_venta: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [tasasData, divisasData] = await Promise.all([
        divisas.obtenerTasas(),
        divisas.obtenerTodas()
      ])
      setTasas(tasasData)
      setListaDivisas(divisasData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
    setLoading(false)
  }

  const actualizarTasa = async (id, tasa_compra, tasa_venta) => {
    setError('')
    setMensaje('')

    try {
      await divisas.actualizarTasa(id, parseFloat(tasa_compra), parseFloat(tasa_venta))
      setMensaje('Tasa actualizada exitosamente')
      setEditando(null)
      cargarDatos()
    } catch (error) {
      setError(error.message || 'Error al actualizar la tasa')
    }
  }

  const crearTasa = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    try {
      await divisas.crearTasa(
        nuevaTasa.divisa_origen,
        nuevaTasa.divisa_destino,
        parseFloat(nuevaTasa.tasa_compra),
        parseFloat(nuevaTasa.tasa_venta)
      )
      setMensaje('Tasa creada exitosamente')
      setMostrarNueva(false)
      setNuevaTasa({ divisa_origen: '', divisa_destino: '', tasa_compra: '', tasa_venta: '' })
      cargarDatos()
    } catch (error) {
      setError(error.message || 'Error al crear la tasa')
    }
  }

  const eliminarTasa = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta tasa?')) return

    try {
      await divisas.eliminarTasa(id)
      setMensaje('Tasa eliminada exitosamente')
      cargarDatos()
    } catch (error) {
      setError(error.message || 'Error al eliminar la tasa')
    }
  }

  const formatearNumero = (num) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num)
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
        <h2>Administrar Tasas de Cambio</h2>
        <button
          className="btn btn-primary"
          onClick={() => setMostrarNueva(!mostrarNueva)}
        >
          {mostrarNueva ? 'Cancelar' : '+ Nueva Tasa'}
        </button>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Formulario nueva tasa */}
      {mostrarNueva && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Agregar Nueva Tasa</h3>
          <form onSubmit={crearTasa}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label>Divisa Origen</label>
                <select
                  value={nuevaTasa.divisa_origen}
                  onChange={(e) => setNuevaTasa(prev => ({ ...prev, divisa_origen: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar</option>
                  {listaDivisas.map(d => (
                    <option key={d.codigo} value={d.codigo}>{d.codigo}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Divisa Destino</label>
                <select
                  value={nuevaTasa.divisa_destino}
                  onChange={(e) => setNuevaTasa(prev => ({ ...prev, divisa_destino: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar</option>
                  {listaDivisas.map(d => (
                    <option key={d.codigo} value={d.codigo}>{d.codigo}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tasa Compra</label>
                <input
                  type="number"
                  step="0.000001"
                  value={nuevaTasa.tasa_compra}
                  onChange={(e) => setNuevaTasa(prev => ({ ...prev, tasa_compra: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tasa Venta</label>
                <input
                  type="number"
                  step="0.000001"
                  value={nuevaTasa.tasa_venta}
                  onChange={(e) => setNuevaTasa(prev => ({ ...prev, tasa_venta: e.target.value }))}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Guardar Tasa</button>
          </form>
        </div>
      )}

      {/* Tabla de tasas */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Par</th>
                <th>Tasa Compra</th>
                <th>Tasa Venta</th>
                <th>Última Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tasas.map(tasa => (
                <tr key={tasa.id}>
                  <td>
                    <strong>{tasa.divisa_origen}</strong> → <strong>{tasa.divisa_destino}</strong>
                  </td>
                  <td>
                    {editando === tasa.id ? (
                      <input
                        type="number"
                        step="0.000001"
                        defaultValue={tasa.tasa_compra}
                        id={`compra-${tasa.id}`}
                        style={{ width: '120px', padding: '0.25rem' }}
                      />
                    ) : (
                      formatearNumero(tasa.tasa_compra)
                    )}
                  </td>
                  <td>
                    {editando === tasa.id ? (
                      <input
                        type="number"
                        step="0.000001"
                        defaultValue={tasa.tasa_venta}
                        id={`venta-${tasa.id}`}
                        style={{ width: '120px', padding: '0.25rem' }}
                      />
                    ) : (
                      formatearNumero(tasa.tasa_venta)
                    )}
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                    {new Date(tasa.actualizado_en).toLocaleString('es-CO')}
                  </td>
                  <td>
                    {editando === tasa.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const compra = document.getElementById(`compra-${tasa.id}`).value
                            const venta = document.getElementById(`venta-${tasa.id}`).value
                            actualizarTasa(tasa.id, compra, venta)
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditando(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditando(tasa.id)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--color-error)', color: 'white' }}
                          onClick={() => eliminarTasa(tasa.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminTasas
