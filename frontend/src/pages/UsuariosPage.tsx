import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Paper, Select, Stack, Switch, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { EditOutlined, PersonAddOutlined } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { usuariosApi } from '../api/usuarios';
import { rolesApi } from '../api/roles';
import { useToast } from '../components/ToastProvider';
import type { CrearUsuarioInput, EditarUsuarioInput, Rol, Usuario } from '../types/auth';

interface UsuarioForm {
  nombreUsuario: string;
  nombreCompleto: string;
  contrasena: string;
  rolId: number | '';
}

const emptyForm: UsuarioForm = { nombreUsuario: '', nombreCompleto: '', contrasena: '', rolId: '' };

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState<UsuarioForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userRows, roleRows] = await Promise.all([usuariosApi.listar(), rolesApi.listar()]);
      setUsuarios(userRows);
      setRoles(roleRows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (usuario: Usuario) => {
    setEditing(usuario);
    setForm({
      nombreUsuario: usuario.nombreUsuario,
      nombreCompleto: usuario.nombreCompleto,
      contrasena: '',
      rolId: usuario.rol.id,
    });
    setFormOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.rolId) return;
    setSaving(true);
    try {
      if (editing) {
        const input: EditarUsuarioInput = {
          nombreUsuario: form.nombreUsuario.trim(),
          nombreCompleto: form.nombreCompleto.trim(),
          rolId: form.rolId,
          ...(form.contrasena ? { contrasena: form.contrasena } : {}),
        };
        await usuariosApi.editar(editing.id, input);
        showToast('Usuario actualizado correctamente.', 'success');
      } else {
        const input: CrearUsuarioInput = {
          nombreUsuario: form.nombreUsuario.trim(),
          nombreCompleto: form.nombreCompleto.trim(),
          contrasena: form.contrasena,
          rolId: form.rolId,
        };
        await usuariosApi.crear(input);
        showToast('Usuario registrado correctamente.', 'success');
      }
      setFormOpen(false);
      await load();
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'No se pudo guardar el usuario.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (usuario: Usuario) => {
    try {
      await usuariosApi.cambiarEstado(usuario.id, !usuario.activo);
      showToast(usuario.activo ? 'Usuario desactivado.' : 'Usuario activado.', 'success');
      await load();
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'No se pudo actualizar el usuario.', 'error');
    }
  };

  const activeRoles = roles.filter((rol) => rol.activo);

  return (
    <>
      <PageHeader
        title="Usuarios"
        breadcrumb="Usuarios"
        subtitle="Registra usuarios, asigna roles y controla el acceso."
        actionLabel="Registrar usuario"
        actionIcon={<PersonAddOutlined />}
        onAction={openCreate}
        onRefresh={() => void load()}
        loading={loading}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => void load()}>Reintentar</Button>}>{error}</Alert>}
      <Paper elevation={0} sx={{ borderRadius: 4 }}>
        {usuarios.length === 0 && !loading && !error ? (
          <EmptyState title="No hay usuarios registrados" description="Registra el primer usuario para comenzar." action={{ label: 'Registrar usuario', onClick: openCreate }} />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 680 }}>
              <TableHead><TableRow><TableCell>Usuario</TableCell><TableCell>Nombre completo</TableCell><TableCell>Rol</TableCell><TableCell>Estado</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id} hover>
                    <TableCell>{usuario.nombreUsuario}</TableCell>
                    <TableCell>{usuario.nombreCompleto}</TableCell>
                    <TableCell><Chip size="small" label={usuario.rol.nombre} variant="outlined" /></TableCell>
                    <TableCell><Chip size="small" label={usuario.activo ? 'Activo' : 'Inactivo'} color={usuario.activo ? 'success' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditOutlined />} onClick={() => openEdit(usuario)}>Editar</Button>
                      <Switch checked={usuario.activo} onChange={() => void toggleActive(usuario)} inputProps={{ 'aria-label': `${usuario.activo ? 'Desactivar' : 'Activar'} ${usuario.nombreUsuario}` }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && <Typography color="text.secondary" sx={{ p: 2 }}>Cargando usuarios…</Typography>}
          </TableContainer>
        )}
      </Paper>

      <Dialog open={formOpen} onClose={saving ? undefined : () => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar usuario' : 'Registrar usuario'}</DialogTitle>
        <Stack component="form" onSubmit={(event) => void submit(event)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Nombre de usuario" value={form.nombreUsuario} onChange={(event) => setForm({ ...form, nombreUsuario: event.target.value })} required inputProps={{ maxLength: 80 }} autoComplete="username" />
              <TextField label="Nombre completo" value={form.nombreCompleto} onChange={(event) => setForm({ ...form, nombreCompleto: event.target.value })} required inputProps={{ maxLength: 160 }} />
              <TextField label={editing ? 'Nueva contraseña (opcional)' : 'Contraseña'} type="password" value={form.contrasena} onChange={(event) => setForm({ ...form, contrasena: event.target.value })} required={!editing} inputProps={{ minLength: 8, maxLength: 72 }} autoComplete="new-password" helperText="Entre 8 y 72 caracteres." />
              <FormControl required>
                <InputLabel id="usuario-rol-label">Rol</InputLabel>
                <Select labelId="usuario-rol-label" label="Rol" value={form.rolId} onChange={(event) => setForm({ ...form, rolId: Number(event.target.value) })}>
                  {activeRoles.map((rol) => <MenuItem key={rol.id} value={rol.id}>{rol.nombre}</MenuItem>)}
                </Select>
              </FormControl>
              {activeRoles.length === 0 && <Alert severity="warning">Primero registra y activa un rol.</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setFormOpen(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving || activeRoles.length === 0}>{saving ? 'Guardando…' : 'Guardar'}</Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </>
  );
}
