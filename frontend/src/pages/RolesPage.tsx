import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField,
} from '@mui/material';
import { Add, EditOutlined } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { rolesApi } from '../api/roles';
import { useToast } from '../components/ToastProvider';
import type { Rol } from '../types/auth';

export function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Rol | null>(null);
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRoles(await rolesApi.listar());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setOpen(true);
  };

  const openEdit = (rol: Rol) => {
    setEditing(rol);
    setNombre(rol.nombre);
    setOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await rolesApi.editar(editing.id, nombre.trim());
        showToast('Rol actualizado correctamente.', 'success');
      } else {
        await rolesApi.crear(nombre.trim());
        showToast('Rol registrado correctamente.', 'success');
      }
      setOpen(false);
      await load();
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'No se pudo guardar el rol.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (rol: Rol) => {
    try {
      await rolesApi.cambiarEstado(rol.id, !rol.activo);
      showToast(rol.activo ? 'Rol desactivado.' : 'Rol activado.', 'success');
      await load();
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'No se pudo actualizar el rol.', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Roles" breadcrumb="Roles" subtitle="Administra los perfiles de acceso del sistema." actionLabel="Registrar rol" actionIcon={<Add />} onAction={openCreate} onRefresh={() => void load()} loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => void load()}>Reintentar</Button>}>{error}</Alert>}
      <Paper elevation={0} sx={{ borderRadius: 4 }}>
        {roles.length === 0 && !loading && !error ? (
          <EmptyState title="No hay roles registrados" description="Los roles iniciales se crean al iniciar el backend." action={{ label: 'Registrar rol', onClick: openCreate }} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead><TableRow><TableCell>Rol</TableCell><TableCell>Estado</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
              <TableBody>
                {roles.map((rol) => (
                  <TableRow key={rol.id} hover>
                    <TableCell>{rol.nombre}</TableCell>
                    <TableCell><Chip size="small" label={rol.activo ? 'Activo' : 'Inactivo'} color={rol.activo ? 'success' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditOutlined />} onClick={() => openEdit(rol)}>Editar</Button>
                      <Switch checked={rol.activo} onChange={() => void toggleActive(rol)} inputProps={{ 'aria-label': `${rol.activo ? 'Desactivar' : 'Activar'} ${rol.nombre}` }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && <Alert severity="info">Cargando roles…</Alert>}
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={saving ? undefined : () => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Editar rol' : 'Registrar rol'}</DialogTitle>
        <Stack component="form" onSubmit={(event) => void submit(event)}>
          <DialogContent>
            <TextField autoFocus fullWidth required label="Nombre del rol" value={nombre} onChange={(event) => setNombre(event.target.value)} inputProps={{ maxLength: 40 }} sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </>
  );
}
