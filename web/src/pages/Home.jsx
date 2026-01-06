import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { divisas } from '../services/api'

function Home() {
  const [listaDivisas, setListaDivisas] = useState([])
  const [tasas, setTasas] = useState([])
  const [origen, setOrigen] = useState('USD')
  const [destino, setDestino] = useState('COP')
  const [monto, setMonto] = useState('100')
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [divisasData, tasasData] = await Promise.all([
        divisas.obtenerTodas(),
        divisas.obtenerTasas()
      ])
      setListaDivisas(divisasData)
      setTasas(tasasData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  const convertir = async () => {
    if (!monto || parseFloat(monto) <= 0) return

    setLoading(true)
    try {
      const result = await divisas.convertir(origen, destino, monto, 'venta')
      setResultado(result)
    } catch (error) {
      console.error('Error al convertir:', error)
      setResultado(null)
    }
    setLoading(false)
  }

  const intercambiar = () => {
    setOrigen(destino)
    setDestino(origen)
    setResultado(null)
  }

  useEffect(() => {
    if (monto && parseFloat(monto) > 0) {
      const timer = setTimeout(() => {
        convertir()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [monto, origen, destino])

  const formatearNumero = (num) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  return (
    <div>
      <section className="hero">
        <h1>Bienvenido a Guantes de Oro</h1>
        <p>Tu casa de cambio de confianza en Barranquilla. Las mejores tasas del mercado para tus operaciones de divisas.</p>
      </section>

      <div className="container">
        <div className="converter">
          <h2 className="converter-title">Simulador de Cambio</h2>

          <div className="converter-row">
            <div className="converter-input">
              <label>Tienes</label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Cantidad"
                min="0"
              />
            </div>
            <div className="converter-input">
              <label>Divisa</label>
              <select value={origen} onChange={(e) => setOrigen(e.target.value)}>
                {listaDivisas.map(d => (
                  <option key={d.codigo} value={d.codigo}>
                    {d.codigo} - {d.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="swap-btn" onClick={intercambiar}>
            ⇅
          </button>

          <div className="converter-row">
            <div className="converter-input">
              <label>Recibes</label>
              <input
                type="text"
                value={resultado ? formatearNumero(resultado.monto_convertido) : '---'}
                readOnly
                style={{ background: '#f5f5f5' }}
              />
            </div>
            <div className="converter-input">
              <label>Divisa</label>
              <select value={destino} onChange={(e) => setDestino(e.target.value)}>
                {listaDivisas.map(d => (
                  <option key={d.codigo} value={d.codigo}>
                    {d.codigo} - {d.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {resultado && (
            <div className="result-box">
              <div className="result-amount">
                {formatearNumero(resultado.monto_convertido)} {destino}
              </div>
              <div className="result-rate">
                Tasa: 1 {origen} = {formatearNumero(resultado.tasa_aplicada)} {destino}
              </div>
            </div>
          )}

          <Link to="/agendar" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
            Agendar Cambio en Oficina
          </Link>
        </div>

        {/* Tasas principales */}
        <section style={{ marginTop: '3rem' }}>
          <div className="card-header">
            <h2 className="card-title">Tasas del Día</h2>
            <Link to="/tasas" className="btn btn-outline btn-sm">Ver todas</Link>
          </div>
          <div className="rates-grid">
            {tasas.slice(0, 6).map((tasa, index) => (
              <div key={index} className="rate-card">
                <div className="rate-pair">
                  {tasa.divisa_origen} → {tasa.divisa_destino}
                </div>
                <div className="rate-values">
                  <div className="rate-buy">Compra: <span>{formatearNumero(tasa.tasa_compra)}</span></div>
                  <div className="rate-sell">Venta: <span>{formatearNumero(tasa.tasa_venta)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Servicios */}
        <section style={{ marginTop: '3rem' }}>
          <h2 className="card-title" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Nuestros Servicios</h2>
          <div className="rates-grid">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💱</div>
              <h3>Cambio de Divisas</h3>
              <p style={{ color: 'var(--color-text-light)' }}>Compra y venta de las principales divisas internacionales</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3>Citas Programadas</h3>
              <p style={{ color: 'var(--color-text-light)' }}>Agenda tu visita y evita tiempos de espera</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
              <h3>Ubicaciones Convenientes</h3>
              <p style={{ color: 'var(--color-text-light)' }}>Encuéntranos en Riomar y el Aeropuerto</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
