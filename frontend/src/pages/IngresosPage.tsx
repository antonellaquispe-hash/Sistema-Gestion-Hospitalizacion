import { useCallback, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  BedOutlined,
  CheckCircle,
  LocalHospitalOutlined,
  Search,
  SwapHorizOutlined,
  Visibility,
} from '@mui/icons-material';
import type { Cama, IngresoHospitalario, Movimiento, Paciente, TrasladarInput } from '../types';
import { ingresosApi } from '../api/ingresos';
import { pacientesApi } from '../api/pacientes';
import { camasApi } from '../api/camas';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/ToastProvider';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EstadoIngresoBadge } from '../components/EstadoIngresoBadge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { formatDateTime } from '../utils/format';

interface RegistrarForm {
  paciente: Paciente | null;
  motivo: string;
}

interface TrasladarForm {
  camaDestino: Cama | null;
  motivo: string;
  medicoResponsable: string;
  usuarioTraslado: string;
  observaciones: string;
}

interface FieldErrors {
  motivo?: string;
  camaDestino?: string;
  medicoResponsable?: string;
  usuarioTraslado?: string;
  paciente?: string;
}

export function IngresosPage() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useApi(() => ingresosApi.listar(), []);
  const { showToast } = useToast();

  const [registrarOpen, setRegistrarOpen] = useState(false);
  const [registrarForm, setRegistrarForm] = useState<RegistrarForm>({ paciente: null, motivo: '' });
  const [registrarErrors, setRegistrarErrors] = useState<FieldErrors>({});
  const [registrarSaving, setRegistrarSaving] = useState(false);

  const [asignar, setAsignar] = useState<{ ingreso: IngresoHospitalario; cama: Cama | null } | null>(null);
  const [asignarSaving, setAsignarSaving] = useState(false);

  const [trasladar, setTrasladar] = useState<IngresoHospitalario | null>(null);
  const [trasladarForm, setTrasladarForm] = useState<TrasladarForm>({
    camaDestino: null,
    motivo: '',
    medicoResponsable: '',
    usuarioTraslado: '',
    observaciones: '',
  });
  const [trasladarErrors, setTrasladarErrors] = useState<FieldErrors>({});
  const [trasladarSaving, setTrasladarSaving] = useState(false);
  const [trasladarConfirm, setTrasladarConfirm] = useState(false);

  const [finalizar, setFinalizar] = useState<IngresoHospitalario | null>(null);
  const [finalizarSaving, setFinalizarSaving] = useState(false);

  const [detalle, setDetalle] = useState<IngresoHospitalario | null>(null);
  const [detalleMovimientos, setDetalleMovimientos] = useState<Movimiento[] | null>(null);

  const pacientes = useApi(() => pacientesApi.listar(), []);
  const camasDisponibles = useApi(() => camasApi.listarDisponibles(), []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(
      (i) =>
        (i.paciente?.nombre.toLowerCase().includes(term) ?? false) ||
        (i.paciente?.dni.includes(term) ?? false) ||
        i.motivoIngreso.toLowerCase().includes(term),
    );
  }, [data, search]);

  const abrirDetalle = useCallback(
    (ingreso: IngresoHospitalario) => {
      setDetalle(ingreso);
      setDetalleMovimientos(null);
      ingresosApi
        .movimientos(ingreso.id)
        .then(setDetalleMovimientos)
        .catch(() => setDetalleMovimientos([]));
    },
    [],
  );

  const handleRegistrar = async () => {
    const errors: FieldErrors = {};
    if (!registrarForm.paciente) errors.paciente = 'Selecciona un paciente.';
    if (!registrarForm.motivo.trim()) errors.motivo = 'El motivo es obligatorio.';
    else if (registrarForm.motivo.trim().length < 5) errors.motivo = 'Describe el motivo (mínimo 5 caracteres).';
    setRegistrarErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setRegistrarSaving(true);
    try {
      await ingresosApi.registrar(registrarForm.paciente!.id, registrarForm.motivo.trim());
      showToast('Ingreso hospitalario registrado.', 'success');
      setRegistrarOpen(false);
      setRegistrarForm({ paciente: null, motivo: '' });
      void refetch();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo registrar el ingreso.', 'error');
    } finally {
      setRegistrarSaving(false);
    }
  };

  const handleAsignar = async () => {
    if (!asignar?.cama) return;
    setAsignarSaving(true);
    try {
      const actualizado = await ingresosApi.asignarCama(asignar.ingreso.id, asignar.cama.id);
      showToast(`Cama #${asignar.cama.id} asignada al ingreso.`, 'success');
      setAsignar(null);
      void refetch();
      if (detalle?.id === actualizado.id) abrirDetalle(actualizado);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo asignar la cama.', 'error');
    } finally {
      setAsignarSaving(false);
    }
  };

  const openTrasladar = (ingreso: IngresoHospitalario) => {
    setTrasladar(ingreso);
    setTrasladarForm({ camaDestino: null, motivo: '', medicoResponsable: '', usuarioTraslado: '', observaciones: '' });
    setTrasladarErrors({});
    void camasDisponibles.refetch();
  };

  const handleTrasladarConfirmar = async () => {
    if (!trasladar) return;
    const errors: FieldErrors = {};
    if (!trasladarForm.camaDestino) errors.camaDestino = 'Selecciona la cama de destino.';
    if (!trasladarForm.motivo.trim()) errors.motivo = 'El motivo es obligatorio.';
    if (!trasladarForm.medicoResponsable.trim()) errors.medicoResponsable = 'Indica el médico responsable.';
    if (!trasladarForm.usuarioTraslado.trim()) errors.usuarioTraslado = 'Indica el usuario que realiza el traslado.';
    setTrasladarErrors(errors);
    if (Object.keys(errors).length > 0) {
      setTrasladarConfirm(false);
      return;
    }
    setTrasladarSaving(true);
    const input: TrasladarInput = {
      motivo: trasladarForm.motivo.trim(),
      medicoResponsable: trasladarForm.medicoResponsable.trim(),
      usuarioTraslado: trasladarForm.usuarioTraslado.trim(),
      observaciones: trasladarForm.observaciones.trim() || undefined,
    };
    try {
      const movimiento = await ingresosApi.trasladar(trasladar.id, trasladarForm.camaDestino!.id, input);
      showToast(`Traslado registrado (cama ${movimiento.camaOrigen.id} → cama ${movimiento.camaDestino.id}).`, 'success');
      setTrasladar(null);
      setTrasladarConfirm(false);
      void refetch();
      if (detalle?.id === trasladar.id) abrirDetalle(trasladar);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo realizar el traslado.', 'error');
    } finally {
      setTrasladarSaving(false);
    }
  };

  const handleFinalizar = async () => {
    if (!finalizar) return;
    setFinalizarSaving(true);
    try {
      const actualizado = await ingresosApi.finalizar(finalizar.id);
      showToast('Ingreso finalizado y cama liberada.', 'success');
      setFinalizar(null);
      void refetch();
      if (detalle?.id === actualizado.id) abrirDetalle(actualizado);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo finalizar el ingreso.', 'error');
    } finally {
      setFinalizarSaving(false);
    }
  };

  const acciones = (i: IngresoHospitalario) => {
    const activo = i.estado === 'ACTIVO';
    return (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <Tooltip title="Ver detalle">
          <IconButton size="small" onClick={() => abrirDetalle(i)}>
            <Visibility />
          </IconButton>
        </Tooltip>
        {activo && !i.cama && (
          <Tooltip title="Asignar cama">
            <IconButton size="small" color="primary" onClick={() => setAsignar({ ingreso: i, cama: null })}>
              <BedOutlined />
            </IconButton>
          </Tooltip>
        )}
        {activo && i.cama && (
          <Tooltip title="Trasladar de cama">
            <IconButton size="small" color="secondary" onClick={() => openTrasladar(i)}>
              <SwapHorizOutlined />
            </IconButton>
          </Tooltip>
        )}
        {activo && (
          <Tooltip title="Finalizar ingreso">
            <IconButton size="small" onClick={() => setFinalizar(i)} sx={{ color: '#dc2626' }}>
              <CheckCircle />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Ingresos hospitalarios"
        subtitle="Registra ingresos, asigna camas y gestiona traslados."
        breadcrumb="Ingresos"
        actionLabel="Registrar ingreso"
        onAction={() => setRegistrarOpen(true)}
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
              placeholder="Buscar por paciente, DNI o motivo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', sm: 340 } }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Fecha de ingreso</TableCell>
                  <TableCell>Cama</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id} hover>
                    <TableCell>{i.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{i.paciente?.nombre ?? '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        DNI {i.paciente?.dni ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography noWrap title={i.motivoIngreso}>
                        {i.motivoIngreso}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(i.fechaIngreso)}</TableCell>
                    <TableCell>
                      {i.cama ? (
                        <Chip label={`Cama #${i.cama.id}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin asignar
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <EstadoIngresoBadge estado={i.estado} />
                    </TableCell>
                    <TableCell align="right">{acciones(i)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && filtered.length === 0 && (
            <EmptyState
              title={search ? 'Sin coincidencias' : 'No hay ingresos registrados'}
              description={
                search
                  ? 'Prueba con otro término de búsqueda.'
                  : 'Registra el primer ingreso hospitalario.'
              }
              action={
                search
                  ? undefined
                  : { label: 'Registrar ingreso', onClick: () => setRegistrarOpen(true) }
              }
            />
          )}
        </Paper>
      )}

      <Dialog open={registrarOpen} onClose={registrarSaving ? undefined : () => setRegistrarOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalHospitalOutlined sx={{ color: 'primary.main' }} />
          Registrar ingreso hospitalario
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Autocomplete<Paciente>
              options={pacientes.data ?? []}
              getOptionLabel={(p) => `${p.nombre} · DNI ${p.dni}`}
              loading={pacientes.loading}
              value={registrarForm.paciente}
              onChange={(_e, value) => setRegistrarForm((f) => ({ ...f, paciente: value }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Paciente"
                  placeholder="Selecciona el paciente"
                  error={Boolean(registrarErrors.paciente)}
                  helperText={registrarErrors.paciente}
                />
              )}
            />
            <TextField
              label="Motivo de ingreso"
              value={registrarForm.motivo}
              onChange={(e) => setRegistrarForm((f) => ({ ...f, motivo: e.target.value }))}
              error={Boolean(registrarErrors.motivo)}
              helperText={registrarErrors.motivo ?? 'Razón médica del ingreso.'}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRegistrarOpen(false)} disabled={registrarSaving} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => void handleRegistrar()} disabled={registrarSaving}>
            {registrarSaving ? 'Registrando…' : 'Registrar ingreso'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(asignar)} onClose={asignarSaving ? undefined : () => setAsignar(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: 18 }}>
          Asignar cama · Ingreso #{asignar?.ingreso.id}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {asignar?.ingreso.paciente?.nombre} — elige una cama disponible.
          </Typography>
          <CamaSelect
            camas={camasDisponibles.data ?? []}
            loading={camasDisponibles.loading}
            onSelect={(c) => setAsignar((a) => (a ? { ...a, cama: c } : a))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAsignar(null)} disabled={asignarSaving} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => void handleAsignar()} disabled={asignarSaving || !asignar?.cama}>
            {asignarSaving ? 'Asignando…' : 'Asignar cama'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(trasladar)} onClose={trasladarSaving ? undefined : () => setTrasladar(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SwapHorizOutlined sx={{ color: 'secondary.main' }} />
          Trasladar paciente · Ingreso #{trasladar?.id}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Paciente: <strong>{trasladar?.paciente?.nombre}</strong> · Cama actual:{' '}
                <strong>#{trasladar?.cama?.id ?? '—'}</strong>
              </Typography>
            </Box>
            <CamaSelect
              camas={camasDisponibles.data ?? []}
              loading={camasDisponibles.loading}
              onSelect={(c) => setTrasladarForm((f) => ({ ...f, camaDestino: c }))}
              error={trasladarErrors.camaDestino}
            />
            <TextField
              label="Motivo del traslado"
              value={trasladarForm.motivo}
              onChange={(e) => setTrasladarForm((f) => ({ ...f, motivo: e.target.value }))}
              error={Boolean(trasladarErrors.motivo)}
              helperText={trasladarErrors.motivo}
              fullWidth
            />
            <TextField
              label="Médico responsable"
              value={trasladarForm.medicoResponsable}
              onChange={(e) => setTrasladarForm((f) => ({ ...f, medicoResponsable: e.target.value }))}
              error={Boolean(trasladarErrors.medicoResponsable)}
              helperText={trasladarErrors.medicoResponsable}
              fullWidth
            />
            <TextField
              label="Usuario que realiza el traslado"
              value={trasladarForm.usuarioTraslado}
              onChange={(e) => setTrasladarForm((f) => ({ ...f, usuarioTraslado: e.target.value }))}
              error={Boolean(trasladarErrors.usuarioTraslado)}
              helperText={trasladarErrors.usuarioTraslado}
              fullWidth
            />
            <TextField
              label="Observaciones (opcional)"
              value={trasladarForm.observaciones}
              onChange={(e) => setTrasladarForm((f) => ({ ...f, observaciones: e.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTrasladar(null)} disabled={trasladarSaving} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => setTrasladarConfirm(true)} disabled={trasladarSaving}>
            {trasladarSaving ? 'Trasladando…' : 'Continuar traslado'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={trasladarConfirm}
        title="Confirmar traslado de cama"
        description={
          <span>
            Se moverá a <strong>{trasladar?.paciente?.nombre}</strong> de la cama{' '}
            <strong>#{trasladar?.cama?.id}</strong> a la cama{' '}
            <strong>#{trasladarForm.camaDestino?.id}</strong>. La cama de origen quedará disponible.
          </span>
        }
        confirmLabel="Confirmar traslado"
        loading={trasladarSaving}
        onConfirm={() => void handleTrasladarConfirmar()}
        onClose={() => setTrasladarConfirm(false)}
      />

      <ConfirmDialog
        open={Boolean(finalizar)}
        title="Finalizar ingreso"
        description={
          <span>
            Se finalizará el ingreso de <strong>{finalizar?.paciente?.nombre}</strong>.
            {finalizar?.cama ? ` La cama #${finalizar.cama.id} quedará disponible.` : ''}
          </span>
        }
        confirmLabel="Finalizar ingreso"
        tone="error"
        loading={finalizarSaving}
        onConfirm={() => void handleFinalizar()}
        onClose={() => setFinalizar(null)}
      />

      <Dialog open={Boolean(detalle)} onClose={() => setDetalle(null)} fullWidth maxWidth="md">
        {detalle && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocalHospitalOutlined sx={{ color: 'primary.main' }} />
                Ingreso #{detalle.id}
              </Box>
              <EstadoIngresoBadge estado={detalle.estado} />
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <DetailBox label="Paciente" value={detalle.paciente?.nombre ?? '—'} />
                  <DetailBox label="DNI" value={detalle.paciente?.dni ?? '—'} />
                  <DetailBox label="Cama asignada" value={detalle.cama ? `#${detalle.cama.id} (${detalle.cama.estado})` : 'Sin asignar'} />
                  <DetailBox label="Fecha de ingreso" value={formatDateTime(detalle.fechaIngreso)} />
                </Stack>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Motivo
                  </Typography>
                  <Typography variant="body2">{detalle.motivoIngreso}</Typography>
                </Box>

                {detalle.estado === 'ACTIVO' && (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {!detalle.cama ? (
                      <Button
                        variant="contained"
                        startIcon={<BedOutlined />}
                        onClick={() => {
                          setAsignar({ ingreso: detalle, cama: null });
                          setDetalle(null);
                        }}
                      >
                        Asignar cama
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<SwapHorizOutlined />}
                        onClick={() => {
                          openTrasladar(detalle);
                          setDetalle(null);
                        }}
                      >
                        Trasladar de cama
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CheckCircle />}
                      onClick={() => {
                        setFinalizar(detalle);
                      }}
                    >
                      Finalizar ingreso
                    </Button>
                  </Stack>
                )}

                <Divider />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Historial de movimientos ({detalleMovimientos?.length ?? 0})
                  </Typography>
                  {detalleMovimientos === null ? (
                    <Typography variant="body2" color="text.secondary">
                      Cargando movimientos…
                    </Typography>
                  ) : detalleMovimientos.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Este ingreso no tiene traslados registrados.
                    </Typography>
                  ) : (
                    <List disablePadding dense>
                      {detalleMovimientos.map((m) => (
                        <ListItem
                          key={m.id}
                          sx={{ borderRadius: 3, px: 1.5, alignItems: 'flex-start' }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: 'secondary.main' }}>
                            <SwapHorizOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography fontWeight={600} fontSize={14}>
                                Cama {m.camaOrigen.id} <ArrowForward sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Cama {m.camaDestino.id}
                              </Typography>
                            }
                            secondary={
                              <span>
                                {formatDateTime(m.fechaTraslado)} · {m.motivo} · {m.medicoResponsable}
                              </span>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ flex: 1, minWidth: 140 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography fontWeight={600} fontSize={14}>
        {value}
      </Typography>
    </Box>
  );
}

function CamaSelect({
  camas,
  loading,
  onSelect,
  error,
}: {
  camas: Cama[];
  loading: boolean;
  onSelect: (cama: Cama | null) => void;
  error?: string;
}) {
  return (
    <Autocomplete<Cama>
      options={camas}
      loading={loading}
      getOptionLabel={(c) => `Cama #${c.id}`}
      onChange={(_e, value) => onSelect(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Cama disponible"
          placeholder="Selecciona una cama"
          error={Boolean(error)}
          helperText={error}
        />
      )}
    />
  );
}