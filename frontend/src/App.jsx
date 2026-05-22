import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout         from './components/layout/Layout';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Inventario     from './pages/Inventario';
import Movimientos    from './pages/Movimientos';
import NuevoMovimiento from './pages/NuevoMovimiento';
import Historial      from './pages/Historial';
import Productos      from './pages/Productos';
import Bunkers        from './pages/Bunkers';
import Tiendas        from './pages/Tiendas';
import Usuarios       from './pages/Usuarios';
import Tickets        from './pages/Tickets';
import Alertas        from './pages/Alertas';
import Reportes          from './pages/Reportes';
import Importar          from './pages/Importar';
import InventarioCREARH  from './pages/InventarioCREARH';
import Requisiciones     from './pages/Requisiciones';
import NuevaRequisicion  from './pages/NuevaRequisicion';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/"               element={<Dashboard />} />
                <Route path="/inventario"     element={<Inventario />} />
                <Route path="/movimientos"    element={<Movimientos />} />
                <Route path="/movimientos/nuevo" element={<NuevoMovimiento />} />
                <Route path="/historial"      element={<Historial />} />
                <Route path="/productos"      element={<Productos />} />
                <Route path="/bunkers"        element={<Bunkers />} />
                <Route path="/tiendas"        element={<Tiendas />} />
                <Route path="/usuarios"       element={<Usuarios />} />
                <Route path="/tickets"        element={<Tickets />} />
                <Route path="/alertas"        element={<Alertas />} />
                <Route path="/reportes"            element={<Reportes />} />
                <Route path="/importar"            element={<Importar />} />
                <Route path="/crearh"              element={<InventarioCREARH />} />
                <Route path="/requisiciones"        element={<Requisiciones />} />
                <Route path="/requisiciones/nueva"  element={<NuevaRequisicion />} />
                <Route path="*"               element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
