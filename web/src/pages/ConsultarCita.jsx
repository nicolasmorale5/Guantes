import { useState } from 'react'
import { citas } from '../services/api'

function ConsultarCita() {
  const [codigo, setCodigo] = useState('')
  const [cita, setCita] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const buscarCita = async (e) => {
    e.preventDefault()
    if (!codigo.trim()) return

    setLoading(true)
    setError('')
    setCita(null)

    try {
      const data = await citas.consultar(codigo.trim())
      setCita(data)
    } catch (error) {
      setError(error.message || 'No se encontró la cita')
    }
    setLoading(false)
  }

  const cancelarCita = async () => {
    if (!confirm('¿Está seguro de cancelar esta cita?')) return

    setLoading(true)
    setError('')
    setMensaje('')

    try {
      await citas.cancelar(codigo)
      setMensaje('Cita cancelada exitosamente')
      setCita(prev => ({ ...prev, estado: 'cancelada' }))
    } catch (error) {
      setError(error.message || 'Error al cancelar la cita')
    }
    setLoading(false)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-secondary)' }}>
          Consultar Cita
        </h1>

        <div className="card">
          <form onSubmit={buscarCita}>
            <div className="form-group">
              <label>Código de Confirmación</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: GO2401-ABCD"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || !codigo.trim()}
            >
              {loading ? 'Buscando...' : 'Buscar Cita'}
            </button>
          </form>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {mensaje && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            {mensaje}
          </div>
        )}

        {cita && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Detalles de la Cita</h3>
              {getEstadoBadge(cita.estado)}
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Código</label>
                  <p style={{ fontSize: '1.125rem' }}>{cita.codigo_cita}</p>
                </div>
                <div>
                  <label style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Cliente</label>
                  <p style={{ fontSize: '1.125rem' }}>{cita.nombre_cliente}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Fecha</label>
                  <p>{formatearFecha(cita.fecha)}</p>
                </div>
                <div>
                  <label style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Hora</label>
                  <p>{cita.hora}</p>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Oficina</label>
                <p>{cita.oficina_nombre}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                  {cita.oficina_direccion}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Operación</label>
                  <p>{cita.monto} {cita.divisa_origen} → {cita.divisa_destino}</p>
                </div>
                <div>
                  <label style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Teléfono Oficina</label>
                  <p>{cita.oficina_telefono}</p>
                </div>
              </div>

              {cita.notas && (
                <div>
                  <label style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Notas</label>
                  <p>{cita.notas}</p>
                </div>
              )}
            </div>

            {cita.estado === 'pendiente' && (
              <button
                onClick={cancelarCita}
                className="btn btn-outline btn-block"
                style={{ marginTop: '1.5rem', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                disabled={loading}
              >
                Cancelar Cita
              </button>
            )}
          </div>
        )}

        <div className="card" style={{ marginTop: '1.5rem', background: 'var(--color-background)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>¿Necesita ayuda?</h4>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
            Si tiene alguna pregunta sobre su cita, contáctenos:
          </p>
          <p>📞 +57 605 123 4567</p>
          <p>📧 info@guantesdeoro.com</p>
        </div>
      </div>
    </div>
  )
}

export default ConsultarCita
