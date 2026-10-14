import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ApartmentOutlined,
  Add,
  ExpandMore,
  HouseOutlined,
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/ToastProvider';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import type { Habitacion, Piso } from '../types';
import { habitacionesApi, pisosApi } from '../api/camas';

export function PisoPage() {
  const { showToast } = useToast();

  const { data: pisos, loading, error, refetch } = useApi(() => pisosApi.listar(), []);
  const { data: habitaciones, error: habitacionesError, refetch: refetchHabs } = useApi(() => habitacionesApi.listar(), []);
  const [editingPiso, setEditingPiso] = useState<number | null>(null);
  const [editingHab, setEditingHab] = useState<number | null>(null);
  const [changingEstado, setChangingEstado] = useState<number | null>(null);

  const cambiarEstado = async (habitacion: Habitacion) => {
    setChangingEstado(habitacion.id);
    try {
      await habitacionesApi.cambiarEstado(habitacion.id, !habitacion.activo);
      showToast(habitacion.activo ? 'Habitación desactivada.' : 'Habitación activada.', 'success');
      await refetchHabs();
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'No se pudo cambiar el estado.', 'error');
    } finally {
      setChangingEstado(null);
    }
  };

  const [pisoDialogOpen, setPisoDialogOpen] = useState(false);
  const [pisoForm, setPisoForm] = useState<{ nombre: string; descripcion: string }>({ nombre: '', descripcion: '' });
  const [pisoErrors, setPisoErrors] = useState<{ nombre?: string; descripcion?: string }>({});
  const [pisoSaving, setPisoSaving] = useState(false);

  const [habDialogOpen, setHabDialogOpen] = useState(false);
  const [habForm, setHabForm] = useState<{ numero: string; descripcion: string; pisoId: number | '' }>({
    numero: '', descripcion: '', pisoId: '',
  });
  const [habErrors, setHabErrors] = useState<{ numero?: string; pisoId?: string }>({});
  const [habSaving, setHabSaving] = useState(false);

  const [expandedPiso, setExpandedPiso] = useState<number | null>(null);

  const handlePisoSubmit = async () => {
    const errors: { nombre?: string; descripcion?: string } = {};
    if (!pisoForm.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
    else if (pisoForm.nombre.trim().length < 2) errors.nombre = 'Mínimo 2 caracteres.';
    if (!pisoForm.descripcion.trim()) errors.descripcion = 'La descripción es obligatoria.';
    setPisoErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPisoSaving(true);
    try {
      const input = { nombre: pisoForm.nombre.trim(), descripcion: pisoForm.descripcion.trim() };
      if (editingPiso !== null) await pisosApi.editar(editingPiso, input);
      else await pisosApi.crear(input);
      showToast('Piso guardado correctamente.', 'success');
      setPisoDialogOpen(false);
      setPisoForm({ nombre: '', descripcion: '' });
      setPisoErrors({});
      void refetch();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo registrar el piso.', 'error');
    } finally {
      setPisoSaving(false);
    }
  };

  const handleHabSubmit = async () => {
    const errors: { numero?: string; pisoId?: string } = {};
    if (!habForm.numero.trim()) errors.numero = 'El número es obligatorio.';
    if (!habForm.pisoId) errors.pisoId = 'Selecciona un piso.';
    setHabErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setHabSaving(true);
    try {
      const input = {
        numero: habForm.numero.trim(),
        descripcion: habForm.descripcion.trim(),
        piso: { id: habForm.pisoId as number } as Piso,
      };
      if (editingHab !== null) await habitacionesApi.editar(editingHab, input);
      else await habitacionesApi.crear(input);
      showToast('Habitación guardada correctamente.', 'success');
      setHabDialogOpen(false);
      setHabForm({ numero: '', descripcion: '', pisoId: '' });
      setHabErrors({});
      void refetch();
      void refetchHabs();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo registrar la habitación.', 'error');
    } finally {
      setHabSaving(false);
    }
  };

  const pisoMap = useMemo(() => {
    const map = new Map<number, Habitacion[]>();
    for (const h of habitaciones ?? []) {
      if (h.piso) {
        const existing = map.get(h.piso.id) ?? [];
        existing.push(h);
        map.set(h.piso.id, existing);
      }
    }
    return map;
  }, [habitaciones]);

  return (
    <Box>
      <PageHeader
        title="Pisos y Habitaciones"
        subtitle="Gestiona los pisos, habitaciones y camas del hospital."
        breadcrumb="Pisos"
        actionLabel="Registrar piso"
        onAction={() => {
          setEditingPiso(null);
          setPisoForm({ nombre: '', descripcion: '' });
          setPisoErrors({});
          setPisoDialogOpen(true);
        }}
        onRefresh={() => { void refetch(); void refetchHabs(); }}
        loading={loading}
      />

      {habitacionesError && <ErrorState message={habitacionesError} onRetry={() => void refetchHabs()} />}
      {error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 4 }}>
          <Stack sx={{ p: 2 }} spacing={2}>
            {(pisos ?? []).map((piso) => {
              const habs = pisoMap.get(piso.id) ?? [];
              const isExpanded = expandedPiso === piso.id;
              return (
                <Paper
                  key={piso.id}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'rgba(13,148,136,0.04)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' },
                    }}
                    onClick={() => setExpandedPiso(isExpanded ? null : piso.id)}
                  >
                    <ApartmentOutlined sx={{ mr: 1.5, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight={700} fontSize={15}>
                        {piso.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {piso.descripcion} · {habs.length} habitación(es)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {habs.length} hab(s)
                    </Typography>
                    <Button onClick={(event) => {
                      event.stopPropagation();
                      setEditingPiso(piso.id);
                      setPisoForm({ nombre: piso.nombre, descripcion: piso.descripcion ?? '' });
                      setPisoErrors({});
                      setPisoDialogOpen(true);
                    }}>Editar piso</Button>
                    <ExpandMore
                      sx={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform .2s',
                        ml: 1,
                      }}
                    />
                  </Box>
                  {isExpanded && (
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Stack spacing={1}>
                        {habs.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                            Sin habitaciones asignadas
                          </Typography>
                        ) : (
                          habs.map((h) => (
                            <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                              <HouseOutlined sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ flexGrow: 1 }}>{h.numero}</Typography>
                              <Typography variant="body2" color="text.secondary">{h.descripcion}</Typography>
                              <Typography variant="caption" sx={{ mx: 1 }}>{h.activo ? 'Activa' : 'Inactiva'}</Typography>
                              <Button size="small" onClick={() => {
                                setEditingHab(h.id);
                                setHabForm({ numero: h.numero, descripcion: h.descripcion ?? '', pisoId: piso.id });
                                setHabErrors({});
                                setHabDialogOpen(true);
                              }}>Editar habitación</Button>
                              <Button size="small" disabled={changingEstado !== null} onClick={() => void cambiarEstado(h)}>
                                {h.activo ? 'Desactivar' : 'Activar'}
                              </Button>
                            </Box>
                          ))
                        )}
                      </Stack>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        sx={{ mt: 1 }}
                        onClick={() => {
                          setEditingHab(null);
                          setHabErrors({});
                          setHabForm({ numero: '', descripcion: '', pisoId: piso.id });
                          setHabDialogOpen(true);
                        }}
                      >
                        Agregar habitación
                      </Button>
                    </Box>
                  )}
                </Paper>
              );
            })}
            {(pisos ?? []).length === 0 && !loading ? (
              <EmptyState title="No hay pisos registrados" description="Crea tu primer piso para comenzar a gestionar habitaciones." />
            ) : null}
          </Stack>
        </Paper>
      )}

      <Dialog open={pisoDialogOpen} onClose={() => { setPisoDialogOpen(false); setPisoErrors({}); }} maxWidth="xs" fullWidth>
        <DialogTitle>{editingPiso !== null ? 'Editar piso' : 'Registrar piso'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del piso"
              value={pisoForm.nombre}
              onChange={(e) => setPisoForm({ ...pisoForm, nombre: e.target.value })}
              error={Boolean(pisoErrors.nombre)}
              helperText={pisoErrors.nombre}
              fullWidth
              size="small"
              autoFocus
            />
            <TextField
              label="Descripción"
              value={pisoForm.descripcion}
              onChange={(e) => setPisoForm({ ...pisoForm, descripcion: e.target.value })}
              error={Boolean(pisoErrors.descripcion)}
              helperText={pisoErrors.descripcion}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setPisoDialogOpen(false); setPisoErrors({}); }} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handlePisoSubmit} disabled={pisoSaving}>
            {pisoSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={habDialogOpen} onClose={() => { setHabDialogOpen(false); setHabErrors({}); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingHab !== null ? 'Editar habitación' : 'Registrar habitación'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Número de habitación"
              value={habForm.numero}
              onChange={(e) => setHabForm({ ...habForm, numero: e.target.value })}
              error={Boolean(habErrors.numero)}
              helperText={habErrors.numero}
              fullWidth
              size="small"
              autoFocus
            />
            <TextField
              label="Descripción"
              value={habForm.descripcion}
              onChange={(e) => setHabForm({ ...habForm, descripcion: e.target.value })}
              fullWidth
              size="small"
            />
            <Select
              value={habForm.pisoId}
              onChange={(e) => setHabForm({ ...habForm, pisoId: e.target.value as number })}
              displayEmpty
              fullWidth
              size="small"
              renderValue={(v) => v ? `Piso #${v}` : 'Selecciona un piso'}
            >
              {(pisos ?? []).map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombre}
                </MenuItem>
              ))}
            </Select>
            {habErrors.pisoId && (
              <Typography variant="body2" color="error">{habErrors.pisoId}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setHabDialogOpen(false); setHabErrors({}); }} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleHabSubmit} disabled={habSaving}>
            {habSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
