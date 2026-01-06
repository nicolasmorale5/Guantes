import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Tasas from './pages/Tasas'
import Oficinas from './pages/Oficinas'
import AgendarCita from './pages/AgendarCita'
import ConsultarCita from './pages/ConsultarCita'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AdminTasas from './pages/admin/AdminTasas'
import AdminCitas from './pages/admin/AdminCitas'
import AdminOficinas from './pages/admin/AdminOficinas'

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tasas" element={<Tasas />} />
        <Route path="oficinas" element={<Oficinas />} />
        <Route path="agendar" element={<AgendarCita />} />
        <Route path="consultar" element={<ConsultarCita />} />
      </Route>

      {/* Login admin */}
      <Route path="/admin/login" element={<Login />} />

      {/* Rutas de administración */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="tasas" element={<AdminTasas />} />
        <Route path="citas" element={<AdminCitas />} />
        <Route path="oficinas" element={<AdminOficinas />} />
      </Route>
    </Routes>
  )
}

export default App
