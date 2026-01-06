import { useState, useEffect } from 'react'
import { divisas } from '../services/api'

function Tasas() {
  const [tasas, setTasas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    cargarTasas()
  }, [])

  const cargarTasas = async () => {
    try {
      const data = await divisas.obtenerTasas()
      setTasas(data)
    } catch (error) {
      console.error('Error al cargar tasas:', error)
    }
    setLoading(false)
  }

  const formatearNumero = (num) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  const tasasFiltradas = tasas.filter(t =>
    t.divisa_origen.toLowerCase().includes(filtro.toLowerCase()) ||
    t.divisa_destino.toLowerCase().includes(filtro.toLowerCase()) ||
    (t.nombre_origen && t.nombre_origen.toLowerCase().includes(filtro.toLowerCase()))
  )

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
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Tasas de Cambio</h1>
          <input
            type="text"
            placeholder="Buscar divisa..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              width: '200px'
            }}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Par de Divisas</th>
                <th>Tasa de Compra</th>
                <th>Tasa de Venta</th>
                <th>Última Actualización</th>
              </tr>
            </thead>
            <tbody>
              {tasasFiltradas.map((tasa, index) => (
                <tr key={index}>
                  <td>
                    <strong>{tasa.divisa_origen}</strong> → <strong>{tasa.divisa_destino}</strong>
                    <br />
                    <small style={{ color: 'var(--color-text-light)' }}>
                      {tasa.nombre_origen || tasa.divisa_origen} a {tasa.nombre_destino || tasa.divisa_destino}
                    </small>
                  </td>
                  <td style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                    {formatearNumero(tasa.tasa_compra)}
                  </td>
                  <td style={{ color: 'var(--color-primary-dark)', fontWeight: '600' }}>
                    {formatearNumero(tasa.tasa_venta)}
                  </td>
                  <td style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                    {formatearFecha(tasa.actualizado_en)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tasasFiltradas.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
            No se encontraron tasas de cambio
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Información Importante</h3>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-light)' }}>
          <li>Las tasas pueden variar durante el día según las condiciones del mercado.</li>
          <li><strong>Tasa de Compra:</strong> Es el precio al que compramos su divisa extranjera.</li>
          <li><strong>Tasa de Venta:</strong> Es el precio al que le vendemos divisa extranjera.</li>
          <li>Para montos grandes, contáctenos para obtener tasas preferenciales.</li>
          <li>Agende su cita para asegurar disponibilidad.</li>
        </ul>
      </div>
    </div>
  )
}

export default Tasas
