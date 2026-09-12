import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
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
  AssignmentOutlined,
  CheckCircle,
  Close,
  MoreVert,
  NoteAddOutlined,
  Search,
} from '@mui/icons-material';
import type { SolicitudEstado, SolicitudHospitalizacion } from '../types';
import { solicitudesApi } from '../api/solicitudes';
import { pacientesApi } from '../api/pacientes';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/ToastProvider';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EstadoSolicitudBadge } from '../components/EstadoSolicitudBadge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { formatDateTime } from '../utils/format';
import type { Paciente } from '../types';

interface SolicitudForm {
  documentoPaciente: string;
  motivo: string;
}

const INITIAL_FORM: SolicitudForm = { documentoPaciente: '', motivo: '' };

interface SolicitudFormFieldErrors {
  documentoPaciente?: string;
  motivo?: string;
}

function validateForm(form: SolicitudForm): SolicitudFormFieldErrors {
  const errors: SolicitudFormFieldErrors = {};
  if (!form.documentoPaciente.trim()) {
    errors.documentoPaciente = 'El documento del paciente es obligatorio.';
  } else if (!/^\d{8}$/.test(form.documentoPaciente.trim())) {
    errors.documentoPaciente = 'El documento debe tener 8 dígitos.';
  }
  if (!form.motivo.trim()) {
    errors.motivo = 'El motivo es obligatorio.';
  } else if (form.motivo.trim().length < 5) {
    errors.motivo = 'Describe el motivo con al menos 5 caracteres.';
  }
  return errors;
}

export function SolicitudesPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<SolicitudForm>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<SolicitudFormFieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{
    solicitud: SolicitudHospitalizacion;
    estado: SolicitudEstado;
  } | null>(null);
  const [ajustando, setAjustando] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuSolicitud, setMenuSolicitud] = useState<SolicitudHospitalizacion | null>(null);

  const { data, loading, error, refetch } = useApi(() => solicitudesApi.listar(), []);
  const pacientes = useApi(() => pacientesApi.listar(), []);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(
      (s) =>
        s.documentoPaciente.toLowerCase().includes(term) ||
        s.motivo.toLowerCase().includes(term),
    );
  }, [data, search]);

  const handleSubmit = async () => {
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      await solicitudesApi.crear({
        documentoPaciente: form.documentoPaciente.trim(),
        motivo: form.motivo.trim(),
      });
      showToast('Solicitud registrada correctamente.', 'success');
      setFormOpen(false);
      setForm(INITIAL_FORM);
      void refetch();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo registrar la solicitud.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmCambiarEstado = async () => {
    if (!confirm) return;
    setAjustando(true);
    try {
      await solicitudesApi.cambiarEstado(confirm.solicitud.id, confirm.estado);
      showToast(`Solicitud ${confirm.estado.toLowerCase()} correctamente.`, 'success');
      setConfirm(null);
      void refetch();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo cambiar el estado.', 'error');
    } finally {
      setAjustando(false);
    }
  };

  const openMenu = (event: MouseEvent<HTMLButtonElement>, solicitud: SolicitudHospitalizacion) => {
    setMenuAnchor(event.currentTarget);
    setMenuSolicitud(solicitud);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuSolicitud(null);
  };

  const aplicarEstado = (estado: SolicitudEstado) => {
    closeMenu();
    if (menuSolicitud) {
      setConfirm({ solicitud: menuSolicitud, estado });
    }
  };

  const breadcrumb = 'Solicitudes';

  return (
    <Box>
      <PageHeader
        title="Solicitudes de hospitalización"
        subtitle="Registra y gestiona el flujo de autorización de hospitalizaciones."
        breadcrumb={breadcrumb}
        actionLabel="Nueva solicitud"
        onAction={() => setFormOpen(true)}
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
              placeholder="Buscar por DNI o motivo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', sm: 320 } }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{s.documentoPaciente}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography noWrap title={s.motivo}>
                        {s.motivo}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(s.fechaSolicitud)}</TableCell>
                    <TableCell>
                      <EstadoSolicitudBadge estado={s.estado} />
                    </TableCell>
                    <TableCell align="right">
                      {s.estado === 'PENDIENTE' ? (
                        <Tooltip title="Cambiar estado">
                          <IconButton onClick={(e) => openMenu(e, s)} size="small">
                            <MoreVert />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Cerrada
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && filtered.length === 0 && (
            <EmptyState
              title={search ? 'Sin coincidencias' : 'No hay solicitudes registradas'}
              description={
                search
                  ? 'Prueba con otro término de búsqueda.'
                  : 'Registra la primera solicitud de hospitalización.'
              }
              action={
                search
                  ? undefined
                  : { label: 'Nueva solicitud', onClick: () => setFormOpen(true) }
              }
            />
          )}
        </Paper>
      )}

      <SectionDialog
        open={formOpen}
        saving={saving}
        form={form}
        fieldErrors={fieldErrors}
        pacientes={pacientes.data ?? []}
        loadingPacientes={pacientes.loading}
        onFormChange={setForm}
        onClose={() => {
          setFormOpen(false);
          setFieldErrors({});
          setForm(INITIAL_FORM);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`${confirm?.estado === 'APROBADA' ? 'Aprobar' : confirm?.estado === 'RECHAZADA' ? 'Rechazar' : 'Cancelar'} solicitud #${confirm?.solicitud.id ?? ''}`}
        description={
          confirm?.estado === 'APROBADA'
            ? 'La solicitud será marcada como aprobada y podrá pasar a ingreso hospitalario.'
            : confirm?.estado === 'RECHAZADA'
              ? 'La solicitud quedará rechazada. Esta acción no podrá revertirse desde el sistema.'
              : 'La solicitud será cancelada. Esta acción no podrá revertirse desde el sistema.'
        }
        tone={confirm?.estado === 'APROBADA' ? 'primary' : confirm?.estado === 'RECHAZADA' ? 'error' : 'warning'}
        confirmLabel={confirm?.estado === 'APROBADA' ? 'Aprobar' : confirm?.estado === 'RECHAZADA' ? 'Rechazar' : 'Cancelar solicitud'}
        loading={ajustando}
        onConfirm={() => void handleConfirmCambiarEstado()}
        onClose={() => setConfirm(null)}
      />

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => aplicarEstado('APROBADA')}>
          <CheckCircle sx={{ mr: 1, color: 'success.main', fontSize: 20 }} /> Aprobar
        </MenuItem>
        <MenuItem onClick={() => aplicarEstado('RECHAZADA')} sx={{ color: 'error.main' }}>
          <Close sx={{ mr: 1, fontSize: 20 }} /> Rechazar
        </MenuItem>
        <MenuItem onClick={() => aplicarEstado('CANCELADA')} sx={{ color: 'text.secondary' }}>
          <Close sx={{ mr: 1, fontSize: 20 }} /> Cancelar
        </MenuItem>
      </Menu>
    </Box>
  );
}

interface SectionDialogProps {
  open: boolean;
  saving: boolean;
  form: SolicitudForm;
  fieldErrors: SolicitudFormFieldErrors;
  pacientes: Paciente[];
  loadingPacientes: boolean;
  onFormChange: (form: SolicitudForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function SectionDialog({
  open,
  saving,
  form,
  fieldErrors,
  pacientes,
  loadingPacientes,
  onFormChange,
  onClose,
  onSubmit,
}: SectionDialogProps) {
  const handlePacienteSelect = (paciente: Paciente | null) => {
    onFormChange({ ...form, documentoPaciente: paciente?.dni ?? '' });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <NoteAddOutlined sx={{ color: 'primary.main' }} />
        Nueva solicitud de hospitalización
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Box>
            <Autocomplete<Paciente>
              options={pacientes}
              getOptionLabel={(p) => `${p.nombre} · DNI ${p.dni}`}
              loading={loadingPacientes}
              onChange={(_e, value) => handlePacienteSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar paciente (opcional)"
                  placeholder="Busca por nombre"
                  size="small"
                />
              )}
            />
            <Typography variant="caption" color="text.secondary">
              Si el paciente ya está registrado, su DNI se completará automáticamente.
            </Typography>
          </Box>
          <TextField
            label="Documento del paciente (DNI)"
            value={form.documentoPaciente}
            onChange={(e) => onFormChange({ ...form, documentoPaciente: e.target.value })}
            error={Boolean(fieldErrors.documentoPaciente)}
            helperText={fieldErrors.documentoPaciente ?? 'Solo números, 8 dígitos.'}
            fullWidth
          />
          <TextField
            label="Motivo de hospitalización"
            value={form.motivo}
            onChange={(e) => onFormChange({ ...form, motivo: e.target.value })}
            error={Boolean(fieldErrors.motivo)}
            helperText={fieldErrors.motivo ?? 'Ejemplo: fractura de fémur, cirugía programada.'}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<AssignmentOutlined />}
          onClick={onSubmit}
          disabled={saving}
        >
          {saving ? 'Registrando…' : 'Registrar solicitud'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}