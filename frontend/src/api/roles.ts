import api from './http';
import type { Rol } from '../types/auth';

export const rolesApi = {
  listar: () => api.get<Rol[]>('/roles').then((response) => response.data),
  crear: (nombre: string) =>
    api.post<Rol>('/roles', { nombre }).then((response) => response.data),
  editar: (id: number, nombre: string) =>
    api.put<Rol>(`/roles/${id}`, { nombre }).then((response) => response.data),
  cambiarEstado: (id: number, activo: boolean) =>
    api.patch<Rol>(`/roles/${id}/estado`, null, { params: { activo } })
      .then((response) => response.data),
};
