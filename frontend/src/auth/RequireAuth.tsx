import { CircularProgress, Box } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import type { RolNombre } from '../types/auth';

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}><CircularProgress /></Box>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: RolNombre[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.rol)) return <Navigate to={user.rutaInicial} replace />;
  return <Outlet />;
}
