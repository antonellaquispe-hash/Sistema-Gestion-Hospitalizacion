import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Card, CardContent, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import LocalHospitalOutlined from '@mui/icons-material/LocalHospitalOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to={user.rutaInicial} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const session = await login(nombreUsuario, contrasena);
      const requestedPath = (location.state as { from?: string } | null)?.from;
      navigate(requestedPath || session.rutaInicial, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3} component="form" onSubmit={submit}>
            <Stack alignItems="center" spacing={1}>
              <LocalHospitalOutlined color="primary" sx={{ fontSize: 42 }} />
              <Typography variant="h5">Sistema de Hospitalización</Typography>
              <Typography color="text.secondary">Inicia sesión para continuar</Typography>
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Usuario" value={nombreUsuario} onChange={(event) => setNombreUsuario(event.target.value)} required autoComplete="username" autoFocus />
            <TextField
              label="Contraseña"
              type={mostrarContrasena ? 'text' : 'password'}
              value={contrasena}
              onChange={(event) => setContrasena(event.target.value)}
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setMostrarContrasena((v) => !v)}
                      edge="end"
                      aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {mostrarContrasena ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" size="large" disabled={saving}>
              {saving ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
