import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { MovimientosPage } from '../pages/MovimientosPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PacientesPage } from '../pages/PacientesPage';
import { PisoPage } from '../pages/PisoPage';
import { IngresosPage } from '../pages/IngresosPage';
import { CamasPage } from '../pages/CamasPage';
import { SolicitudesPage } from '../pages/SolicitudesPage';
import { LoginPage } from '../pages/LoginPage';
import { UsuariosPage } from '../pages/UsuariosPage';
import { RolesPage } from '../pages/RolesPage';
import { RequireAuth, RequireRole } from '../auth/RequireAuth';
import { useAuth } from '../auth/AuthProvider';
import type { RolNombre } from '../types/auth';

const admin: RolNombre[] = ['ADMINISTRADOR'];
const medico: RolNombre[] = ['ADMINISTRADOR', 'MÉDICO'];
const pacientes: RolNombre[] = ['ADMINISTRADOR', 'MÉDICO', 'RECEPCIONISTA'];
const solicitudes: RolNombre[] = ['ADMINISTRADOR', 'RECEPCIONISTA'];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<RoleHomeRedirect />} />
          <Route element={<RequireRole roles={admin} />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="camas" element={<CamasPage />} />
            <Route path="pisos" element={<PisoPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="roles" element={<RolesPage />} />
          </Route>
          <Route element={<RequireRole roles={solicitudes} />}>
            <Route path="solicitudes" element={<SolicitudesPage />} />
          </Route>
          <Route element={<RequireRole roles={pacientes} />}>
            <Route path="pacientes" element={<PacientesPage />} />
          </Route>
          <Route element={<RequireRole roles={medico} />}>
            <Route path="ingresos" element={<IngresosPage />} />
            <Route path="movimientos" element={<MovimientosPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.rutaInicial ?? '/login'} replace />;
}