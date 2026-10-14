import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowForward, Search } from '@mui/icons-material';
import { movimientosApi } from '../api/movimientos';
import { ingresosApi } from '../api/ingresos';
import { camasApi } from '../api/camas';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/ToastProvider';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { formatDateTime } from '../utils/format';

interface TrasladarForm {
  ingresoId: number | '';
  camaDestino: number | null;
  motivo: string;
  medicoResponsable: string;
  usuarioTraslado: string;
  observaciones: string;
}

export function MovimientosPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TrasladarForm>({
    ingresoId: '',
    camaDestino: null,
    motivo: '',
    medicoResponsable: '',
    usuarioTraslado: '',
    observaciones: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useApi(() => movimientosApi.listar(), []);
  const ingresos = useApi(() => ingresosApi.listar(), []);
  const camas = useApi(() => camasApi.listarDisponibles(), []);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(
      (m) =>
        (m.ingreso?.paciente?.nombre.toLowerCase().includes(term) ?? false) ||
        (m.ingreso?.paciente?.dni.includes(term) ?? false) ||
        m.motivo.toLowerCase().includes(term) ||
        m.medicoResponsable.toLowerCase().includes(term) ||
        m.usuarioTraslado.toLowerCase().includes(term),
    );
  }, [data, search]);

  const activeIngresos = useMemo(
    () => (ingresos.data ?? []).filter((i) => i.estado === 'ACTIVO' && i.cama),
    [ingresos.data],
  );

  const selectedIngreso = useMemo(
    () => (ingresos.data ?? []).find((i) => i.id === form.ingresoId) ?? null,
    [ingresos.data, form.ingresoId],
  );

  const abrirDialogo = () => {
    setForm({
      ingresoId: '',
      camaDestino: null,
      motivo: '',
      medicoResponsable: '',
      usuarioTraslado: '',
      observaciones: '',
    });
    setErrors({});
    void ingresos.refetch();
    void camas.refetch();
    setDialogOpen(true);
  };

  const cerrarDialogo = () => {
    setDialogOpen(false);
    setErrors({});
  };

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!form.ingresoId) errs.ingresoId = 'Selecciona un ingreso activo.';
    if (!form.camaDestino) errs.camaDestino = 'Selecciona la cama de destino.';
    if (!form.motivo.trim()) errs.motivo = 'El motivo es obligatorio.';
    if (!form.medicoResponsable.trim()) errs.medicoResponsable = 'Indica el médico responsable.';
    if (!form.usuarioTraslado.trim()) errs.usuarioTraslado = 'Indica el usuario que realiza el traslado.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      await ingresosApi.trasladar(form.ingresoId as number, form.camaDestino as number, {
        motivo: form.motivo.trim(),
        medicoResponsable: form.medicoResponsable.trim(),
        usuarioTraslado: form.usuarioTraslado.trim(),
        observaciones: form.observaciones.trim() || undefined,
      });
      showToast('Traslado registrado correctamente.', 'success');
      cerrarDialogo();
      void refetch();
      void camas.refetch();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo registrar el traslado.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Movimientos de traslado"
        subtitle="Historial de todos los traslados de cama del hospital."
        breadcrumb="Movimientos"
        actionLabel="Registrar traslado"
        onAction={abrirDialogo}
        onRefresh={() => void refetch()}
        loading={loading}
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 4 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar por paciente, DNI, motivo, médico o usuario…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', sm: 380 } }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Traslado</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Médico responsable</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{m.ingreso?.paciente?.nombre ?? '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        DNI {m.ingreso?.paciente?.dni ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(m.fechaTraslado)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`#${m.camaOrigen.id}`} size="small" variant="outlined" />
                        <ArrowForward sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Chip
                          label={`#${m.camaDestino.id}`}
                          size="small"
                          sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography noWrap title={m.motivo}>
                        {m.motivo}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.medicoResponsable}</TableCell>
                    <TableCell>{m.usuarioTraslado}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        noWrap
                        variant="body2"
                        color="text.secondary"
                        title={m.observaciones ?? ''}
                      >
                        {m.observaciones ?? '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && filtered.length === 0 && (
            <EmptyState
              title={search ? 'Sin coincidencias' : 'No hay movimientos registrados'}
              description={
                search
                  ? 'Prueba con otro término de búsqueda.'
                  : 'Los traslados de cama aparecerán aquí cuando se realicen.'
              }
            />
          )}
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={saving ? undefined : cerrarDialogo} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar traslado de cama</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {ingresos.error && <ErrorState message={ingresos.error} onRetry={() => void ingresos.refetch()} />}
            {camas.error && <ErrorState message={camas.error} onRetry={() => void camas.refetch()} />}
            <Select
              value={form.ingresoId}
              onChange={(e) => setForm((f) => ({ ...f, ingresoId: e.target.value as number }))}
              displayEmpty
              fullWidth
              size="small"
            >
              <MenuItem value="">Selecciona un ingreso activo</MenuItem>
              {activeIngresos.map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  Ingreso #{i.id} · {i.paciente?.nombre ?? 'Paciente'} · Cama #{i.cama?.id ?? '—'}
                </MenuItem>
              ))}
            </Select>
            {errors.ingresoId && <Typography variant="caption" color="error">{errors.ingresoId}</Typography>}
            {selectedIngreso && (
              <Typography variant="body2" color="text.secondary">
                Cama de origen actual: #{selectedIngreso.cama?.id ?? '—'}
              </Typography>
            )}
            <Select
              value={form.camaDestino ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, camaDestino: e.target.value ? Number(e.target.value) : null }))}
              displayEmpty
              fullWidth
              size="small"
            >
              <MenuItem value="">Selecciona cama de destino</MenuItem>
              {(camas.data ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  Cama #{c.id} · {c.habitacion ? `Hab. ${c.habitacion.numero}${c.habitacion.piso ? ` · ${c.habitacion.piso.nombre}` : ''}` : ''}
                </MenuItem>
              ))}
            </Select>
            {errors.camaDestino && <Typography variant="caption" color="error">{errors.camaDestino}</Typography>}
            <TextField
              label="Motivo"
              value={form.motivo}
              onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
              error={Boolean(errors.motivo)}
              helperText={errors.motivo}
              fullWidth
              size="small"
            />
            <TextField
              label="Médico responsable"
              value={form.medicoResponsable}
              onChange={(e) => setForm((f) => ({ ...f, medicoResponsable: e.target.value }))}
              error={Boolean(errors.medicoResponsable)}
              helperText={errors.medicoResponsable}
              fullWidth
              size="small"
            />
            <TextField
              label="Usuario que realiza el traslado"
              value={form.usuarioTraslado}
              onChange={(e) => setForm((f) => ({ ...f, usuarioTraslado: e.target.value }))}
              error={Boolean(errors.usuarioTraslado)}
              helperText={errors.usuarioTraslado}
              fullWidth
              size="small"
            />
            <TextField
              label="Observaciones (opcional)"
              value={form.observaciones}
              onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialogo} color="inherit" disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? 'Registrando…' : 'Registrar traslado'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}