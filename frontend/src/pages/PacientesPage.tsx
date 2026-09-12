import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { GroupAddOutlined, PersonOutlined, Search, Visibility } from '@mui/icons-material';
import type { IngresoHospitalario, Paciente } from '../types';
import { pacientesApi } from '../api/pacientes';
import { ingresosApi } from '../api/ingresos';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/ToastProvider';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { EstadoIngresoBadge } from '../components/EstadoIngresoBadge';
import { formatDateTime } from '../utils/format';

interface PacienteForm {
  nombre: string;
  dni: string;
}

interface FormErrors {
  nombre?: string;
  dni?: string;
}

function validateForm(form: PacienteForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio.';
  } else if (form.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
  }
  if (!form.dni.trim()) {
    errors.dni = 'El DNI es obligatorio.';
  } else if (!/^\d{8}$/.test(form.dni.trim())) {
    errors.dni = 'El DNI debe tener 8 dígitos numéricos.';
  }
  return errors;
}

export function PacientesPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PacienteForm>({ nombre: '', dni: '' });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [detalle, setDetalle] = useState<Paciente | null>(null);

  const { data, loading, error, refetch } = useApi(() => pacientesApi.listar(), []);
  const ingresos = useApi(() => ingresosApi.listar(), []);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(
      (p) => p.nombre.toLowerCase().includes(term) || p.dni.includes(term),
    );
  }, [data, search]);

  const ingresosDelPaciente = useMemo(
    () =>
      detalle
        ? (ingresos.data ?? []).filter((i) => i.paciente?.id === detalle.id)
        : [],
    [detalle, ingresos.data],
  );

  const handleSubmit = async () => {
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      await pacientesApi.crear({ nombre: form.nombre.trim(), dni: form.dni.trim() });
      showToast('Paciente registrado correctamente.', 'success');
      setFormOpen(false);
      setForm({ nombre: '', dni: '' });
      void refetch();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo registrar el paciente.';
      if (message.toLowerCase().includes('dni')) {
        setFieldErrors({ dni: message });
      }
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Pacientes"
        subtitle="Consulta y registra los pacientes del hospital."
        breadcrumb="Pacientes"
        actionLabel="Registrar paciente"
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
              placeholder="Buscar por nombre o DNI…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', sm: 320 } }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>DNI</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#e0f2fe', color: '#0369a1', fontSize: 14, fontWeight: 700 }}>
                          {p.nombre.charAt(0)}
                        </Avatar>
                        <Typography fontWeight={600}>{p.nombre}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={p.dni} variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => setDetalle(p)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && filtered.length === 0 && (
            <EmptyState
              title={search ? 'Sin coincidencias' : 'Aún no hay pacientes registrados'}
              description={
                search
                  ? 'Prueba con otro término de búsqueda.'
                  : 'Registra el primer paciente para comenzar.'
              }
              action={
                search
                  ? undefined
                  : { label: 'Registrar paciente', onClick: () => setFormOpen(true) }
              }
            />
          )}
        </Paper>
      )}

      <Dialog open={formOpen} onClose={saving ? undefined : () => setFormOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <GroupAddOutlined sx={{ color: 'primary.main' }} />
          Registrar paciente
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Nombre completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              error={Boolean(fieldErrors.nombre)}
              helperText={fieldErrors.nombre ?? 'Nombres y apellidos del paciente.'}
              fullWidth
            />
            <TextField
              label="DNI"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
              error={Boolean(fieldErrors.dni)}
              helperText={fieldErrors.dni ?? 'Documento nacional de identidad, 8 dígitos.'}
              inputProps={{ inputMode: 'numeric' }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActionsSpacer
          onClose={() => setFormOpen(false)}
          saving={saving}
          onSubmit={() => void handleSubmit()}
        />
      </Dialog>

      <Dialog
        open={Boolean(detalle)}
        onClose={() => setDetalle(null)}
        fullWidth
        maxWidth="sm"
      >
        {detalle && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PersonOutlined sx={{ color: 'primary.main' }} />
              Detalle del paciente
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 56, height: 56, bgcolor: '#ccfbf1', color: '#0f766e', fontSize: 24, fontWeight: 700 }}>
                    {detalle.nombre.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{detalle.nombre}</Typography>
                    <Chip label={`DNI ${detalle.dni}`} variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                  </Box>
                </Stack>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Historial de ingresos ({ingresosDelPaciente.length})
                  </Typography>
                  {ingresosDelPaciente.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Este paciente no tiene ingresos registrados.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {ingresosDelPaciente.map((i: IngresoHospitalario) => (
                        <Box
                          key={i.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            px: 2,
                            py: 1.5,
                          }}
                        >
                          <Box>
                            <Typography fontWeight={600}>
                              Ingreso #{i.id} · {i.motivoIngreso}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDateTime(i.fechaIngreso)} · Cama {i.cama ? `#${i.cama.id}` : '—'}
                            </Typography>
                          </Box>
                          <EstadoIngresoBadge estado={i.estado} />
                        </Box>
                      ))}
                    </Stack>
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

function DialogActionsSpacer({
  onClose,
  saving,
  onSubmit,
}: {
  onClose: () => void;
  saving: boolean;
  onSubmit: () => void;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 3, pb: 2.5 }}>
      <Button onClick={onClose} disabled={saving} color="inherit">
        Cancelar
      </Button>
      <Button variant="contained" onClick={onSubmit} disabled={saving}>
        {saving ? 'Registrando…' : 'Registrar'}
      </Button>
    </Box>
  );
}