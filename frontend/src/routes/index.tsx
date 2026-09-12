import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { SolicitudesPage } from '../pages/SolicitudesPage';
import { PacientesPage } from '../pages/PacientesPage';
import { IngresosPage } from '../pages/IngresosPage';
import { CamasPage } from '../pages/CamasPage';
import { MovimientosPage } from '../pages/MovimientosPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="solicitudes" element={<SolicitudesPage />} />
        <Route path="pacientes" element={<PacientesPage />} />
        <Route path="ingresos" element={<IngresosPage />} />
        <Route path="camas" element={<CamasPage />} />
        <Route path="movimientos" element={<MovimientosPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}