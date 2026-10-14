import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';import { HotelOutlined, HomeOutlined, RoomOutlined } from '@mui/icons-material';
import type { Cama, Habitacion, IngresoHospitalario } from '../types';
import { camasApi, habitacionesApi } from '../api/camas';
import { ingresosApi } from '../api/ingresos';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/ToastProvider';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';

const ESTADO_COLOR: Record<string, string> = {
  DISPONIBLE: '#0f766e',
  OCUPADA: '#b91c1c',
  LIMPIEZA: '#b45309',
};

const ESTADO_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  LIMPIEZA: 'Limpieza',
};

export function CamasPage() {
  const camas = useApi(() => camasApi.listar(), []);
  const ingresos = useApi(() => ingresosApi.listar(), []);
  const habitaciones = useApi(() => habitacionesApi.listar(), []);
  const { showToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cama | null>(null);
  const [estado, setEstado] = useState('DISPONIBLE');
  const habitacionesActivas = (habitaciones.data ?? []).filter((h) => h.activo);
  const [habitacionId, setHabitacionId] = useState<number | ''>('');
  const [formError, setFormError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const abrirDialogo = () => {
    setEditing(null);
    setEstado('DISPONIBLE');
    void habitaciones.refetch();
    setHabitacionId('');
    setFormError(undefined);
    setDialogOpen(true);
  };

  const cerrarDialogo = () => {
    setDialogOpen(false);
    setFormError(undefined);
  };

  const handleCrearCama = async () => {
    if (!habitacionId) {
      setFormError('Selecciona una habitación.');
      return;
    }
    setSaving(true);
    try {
      const input = {
        estado,
        habitacion: { id: habitacionId } as Habitacion,
      };
      if (editing) await camasApi.editar(editing.id, input);
      else await camasApi.crear(input);
      showToast(editing ? 'Cama actualizada correctamente.' : 'Cama registrada correctamente.', 'success');
      cerrarDialogo();
      void camas.refetch();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo registrar la cama.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const ocupantes = useMemo(() => {
    const map = new Map<number, IngresoHospitalario>();
    for (const i of ingresos.data ?? []) {
      if (i.cama && i.estado === 'ACTIVO') map.set(i.cama.id, i);
    }
    return map;
  }, [ingresos.data]);

  const disponibles = (camas.data ?? []).filter((c) => c.estado === 'DISPONIBLE' && c.habitacion?.activo).length;

  return (
    <Box>
      <PageHeader
        title="Camas hospitalarias"
        subtitle="Vista general del estado de las camas del hospital."
        breadcrumb="Camas"
        actionLabel="Registrar cama"
        onAction={abrirDialogo}
        onRefresh={() => {
          void camas.refetch();
          void ingresos.refetch();
        }}
        loading={camas.loading || ingresos.loading}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {['DISPONIBLE', 'OCUPADA', 'LIMPIEZA'].map((estado) => (
          <Grid item xs={12} sm={4} key={estado}>
            <Paper elevation={0} sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: ESTADO_COLOR[estado] }} />
                <Typography fontWeight={700}>{ESTADO_LABEL[estado]}</Typography>
                <Typography fontWeight={800} color={ESTADO_COLOR[estado]}>
                  {(camas.data ?? []).filter((c) => c.estado === estado).length}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {camas.error ? (
        <ErrorState message={camas.error} onRetry={() => void camas.refetch()} />
      ) : camas.loading ? (
        <Typography color="text.secondary">Cargando camas…</Typography>
      ) : (camas.data ?? []).length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 4, p: 6, textAlign: 'center' }}>
          <HotelOutlined sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            No hay camas registradas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registra camas en el sistema para gestionar la hospitalización.
          </Typography>
          <Button variant="contained" startIcon={<HotelOutlined />} sx={{ mt: 2 }} onClick={abrirDialogo}>
            Registrar cama
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {(camas.data ?? [])
            .slice()
            .sort((a, b) => a.id - b.id)
            .map((cama) => {
              const ocupante = ocupantes.get(cama.id);
              const habitacion = cama.habitacion;
              const piso = habitacion?.piso;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cama.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      p: 2,
                      border: '1px solid',
                      borderColor: cama.estado === 'OCUPADA' ? '#fecaca' : 'divider',
                      transition: 'transform .15s ease, box-shadow .15s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HotelOutlined sx={{ color: 'primary.main' }} />
                        <Typography fontWeight={800}>Cama #{cama.id}</Typography>
                      </Box>
                      <Chip
                        label={cama.estado === 'DISPONIBLE' ? 'Libre' : cama.estado}
                        size="small"
                        sx={{
                          bgcolor: cama.estado === 'DISPONIBLE' ? '#0f766e1a' : '#b91c1c1a',
                          color: cama.estado === 'DISPONIBLE' ? '#0f766e' : '#b91c1c',
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 1.5 }}>
                      {piso && (
                        <Typography variant="caption" color="text.secondary">
                          <RoomOutlined sx={{ fontSize: 12, verticalAlign: 'middle' }} /> {piso.nombre}
                        </Typography>
                      )}
                      {habitacion && (
                        <Typography variant="caption" color="text.secondary">
                          <HomeOutlined sx={{ fontSize: 12, verticalAlign: 'middle' }} /> Hab. {habitacion.numero}
                        </Typography>
                      )}
                      {ocupante ? (
                        <>
                          <Typography fontWeight={600} sx={{ mt: 0.5 }}>{ocupante.paciente?.nombre ?? 'Paciente'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            DNI {ocupante.paciente?.dni ?? '—'} · Ingreso #{ocupante.id}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {!habitacion?.activo ? 'Habitación inactiva: no asignable' : cama.estado === 'DISPONIBLE' ? 'Cama libre para asignar' : 'Sin asignación activa'}
                        </Typography>
                      )}
                    </Box>
                    <Button size="small" disabled={cama.estado === 'OCUPADA'} onClick={() => {
                      setEditing(cama);
                      setHabitacionId(cama.habitacion?.id ?? '');
                      setEstado(cama.estado);
                      setFormError(undefined);
                      void habitaciones.refetch();
                      setDialogOpen(true);
                    }}>Editar cama</Button>
                    {cama.estado === 'OCUPADA' && <Typography variant="caption" display="block">Gestiona el traslado o alta desde Ingresos.</Typography>}
                  </Paper>
                </Grid>
              );
            })}
        </Grid>
      )}

      <Paper elevation={0} sx={{ borderRadius: 3, p: 2, mt: 3, bgcolor: '#f0fdfa' }}>
        <Typography variant="body2" color="#0f766e">
          <strong>{disponibles}</strong> cama{disponibles !== 1 ? 's' : ''} disponible
          {disponibles !== 1 ? 's' : ''} para nuevos ingresos en este momento.
        </Typography>
      </Paper>

      <Dialog open={dialogOpen} onClose={saving ? undefined : cerrarDialogo} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Editar cama' : 'Registrar cama'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {habitaciones.error && <ErrorState message={habitaciones.error} onRetry={() => void habitaciones.refetch()} />}
            {habitacionesActivas.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay habitaciones registradas. Primero crea una habitación en el módulo
                “Pisos y Habitaciones” para poder asignarle camas.
              </Typography>
            ) : (
              <Select
                value={habitacionId}
                onChange={(e) => {
                  setHabitacionId(e.target.value as number);
                  setFormError(undefined);
                }}
                displayEmpty
                fullWidth
                size="small"
                renderValue={(v) => {
                  if (!v) return 'Selecciona una habitación';
                  const hab = (habitaciones.data ?? []).find((h) => h.id === v);
                  return hab
                    ? `Hab. ${hab.numero}${hab.piso ? ` · ${hab.piso.nombre}` : ''}`
                    : `Habitación #${v}`;
                }}
              >
                {habitacionesActivas.map((h) => (
                  <MenuItem key={h.id} value={h.id}>
                    {`Hab. ${h.numero}${h.piso ? ` · ${h.piso.nombre}` : ''}`}
                  </MenuItem>
                ))}
              </Select>
            )}
            {formError && (
              <Typography variant="body2" color="error">{formError}</Typography>
            )}
            <Select value={estado} onChange={(e) => setEstado(e.target.value)} inputProps={{ 'aria-label': 'Estado de cama' }}>
              <MenuItem value="DISPONIBLE">Disponible</MenuItem>
              <MenuItem value="LIMPIEZA">Limpieza</MenuItem>
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialogo} color="inherit" disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCrearCama}
            disabled={saving || habitacionesActivas.length === 0 || Boolean(habitaciones.error)}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
