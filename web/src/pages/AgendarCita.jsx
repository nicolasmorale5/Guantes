import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { oficinas, divisas, citas } from '../services/api'

function AgendarCita() {
  const [searchParams] = useSearchParams()
  const [paso, setPaso] = useState(1)
  const [listaOficinas, setListaOficinas] = useState([])
  const [listaDivisas, setListaDivisas] = useState([])
  const [horariosDisponibles, setHorariosDisponibles] = useState([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [citaConfirmada, setCitaConfirmada] = useState(null)

  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono_cliente: '',
    email_cliente: '',
    oficina_id: searchParams.get('oficina') || '',
    fecha: '',
    hora: '',
    divisa_origen: 'USD',
    divisa_destino: 'COP',
    monto: '',
    notas: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (formData.oficina_id && formData.fecha) {
      cargarHorarios()
    }
  }, [formData.oficina_id, formData.fecha])

  const cargarDatos = async () => {
    try {
      const [oficinasData, divisasData] = await Promise.all([
        oficinas.obtenerTodas(),
        divisas.obtenerTodas()
      ])
      setListaOficinas(oficinasData)
      setListaDivisas(divisasData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
    setLoading(false)
  }

  const cargarHorarios = async () => {
    try {
      const data = await citas.obtenerDisponibilidad(formData.oficina_id, formData.fecha)
      setHorariosDisponibles(data.horarios)
    } catch (error) {
      console.error('Error al cargar horarios:', error)
      setHorariosDisponibles([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'fecha') {
      setFormData(prev => ({ ...prev, hora: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)

    try {
      const resultado = await citas.crear(formData)
      setCitaConfirmada(resultado)
      setPaso(4)
    } catch (error) {
      setError(error.message || 'Error al agendar la cita')
    }
    setEnviando(false)
  }

  const hoy = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (citaConfirmada) {
    return (
      <div className="container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>¡Cita Agendada Exitosamente!</h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
            Tu cita ha sido registrada. Guarda tu código de confirmación:
          </p>
          <div className="confirmation-code">{citaConfirmada.cita.codigo}</div>
          <div style={{ marginTop: '1.5rem', color: 'var(--color-text-light)' }}>
            <p><strong>Fecha:</strong> {citaConfirmada.cita.fecha}</p>
            <p><strong>Hora:</strong> {citaConfirmada.cita.hora}</p>
            {citaConfirmada.cita.monto_estimado && (
              <p><strong>Monto estimado:</strong> {citaConfirmada.cita.monto_estimado} {formData.divisa_destino}</p>
            )}
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            Puedes consultar o cancelar tu cita usando este código.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <a href="/" className="btn btn-primary">Volver al Inicio</a>
            <a href="/consultar" className="btn btn-outline">Consultar Cita</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="appointment-container">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-secondary)' }}>
          Agendar Cita
        </h1>

        <div className="step-indicator">
          <div className={`step ${paso >= 1 ? 'active' : ''} ${paso > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span>Datos Personales</span>
          </div>
          <div className={`step ${paso >= 2 ? 'active' : ''} ${paso > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span>Fecha y Hora</span>
          </div>
          <div className={`step ${paso >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span>Operación</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Paso 1: Datos Personales */}
            {paso === 1 && (
              <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Datos de Contacto</h3>
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre_cliente"
                    value={formData.nombre_cliente}
                    onChange={handleChange}
                    required
                    placeholder="Ingrese su nombre"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      name="telefono_cliente"
                      value={formData.telefono_cliente}
                      onChange={handleChange}
                      required
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email_cliente"
                      value={formData.email_cliente}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => setPaso(2)}
                  disabled={!formData.nombre_cliente || !formData.telefono_cliente}
                >
                  Continuar
                </button>
              </div>
            )}

            {/* Paso 2: Fecha y Hora */}
            {paso === 2 && (
              <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Selecciona Fecha y Hora</h3>
                <div className="form-group">
                  <label>Oficina *</label>
                  <select
                    name="oficina_id"
                    value={formData.oficina_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una oficina</option>
                    {listaOficinas.map(o => (
                      <option key={o.id} value={o.id}>{o.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    min={hoy}
                    required
                  />
                </div>
                {formData.fecha && formData.oficina_id && (
                  <div className="form-group">
                    <label>Hora Disponible *</label>
                    {horariosDisponibles.length > 0 ? (
                      <div className="time-slots">
                        {horariosDisponibles.map(hora => (
                          <div
                            key={hora}
                            className={`time-slot ${formData.hora === hora ? 'selected' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, hora }))}
                          >
                            {hora}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-text-light)' }}>No hay horarios disponibles para esta fecha.</p>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setPaso(1)}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => setPaso(3)}
                    disabled={!formData.oficina_id || !formData.fecha || !formData.hora}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3: Operación */}
            {paso === 3 && (
              <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Detalles de la Operación</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Divisa que Entrega *</label>
                    <select
                      name="divisa_origen"
                      value={formData.divisa_origen}
                      onChange={handleChange}
                      required
                    >
                      {listaDivisas.map(d => (
                        <option key={d.codigo} value={d.codigo}>{d.codigo} - {d.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Divisa que Recibe *</label>
                    <select
                      name="divisa_destino"
                      value={formData.divisa_destino}
                      onChange={handleChange}
                      required
                    >
                      {listaDivisas.map(d => (
                        <option key={d.codigo} value={d.codigo}>{d.codigo} - {d.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Monto Aproximado *</label>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="Ingrese el monto"
                  />
                </div>
                <div className="form-group">
                  <label>Notas Adicionales</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Cualquier información adicional..."
                  />
                </div>

                <div className="card" style={{ background: 'var(--color-background)', marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Resumen de la Cita</h4>
                  <p><strong>Nombre:</strong> {formData.nombre_cliente}</p>
                  <p><strong>Teléfono:</strong> {formData.telefono_cliente}</p>
                  <p><strong>Oficina:</strong> {listaOficinas.find(o => o.id == formData.oficina_id)?.nombre}</p>
                  <p><strong>Fecha:</strong> {formData.fecha}</p>
                  <p><strong>Hora:</strong> {formData.hora}</p>
                  <p><strong>Operación:</strong> {formData.monto} {formData.divisa_origen} → {formData.divisa_destino}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setPaso(2)}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={enviando || !formData.monto}
                  >
                    {enviando ? 'Agendando...' : 'Confirmar Cita'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default AgendarCita
