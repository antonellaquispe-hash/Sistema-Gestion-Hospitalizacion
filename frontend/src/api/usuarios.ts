import api from './http';
import type { CrearUsuarioInput, EditarUsuarioInput, Usuario } from '../types/auth';

export const usuariosApi = {
  listar: () => api.get<Usuario[]>('/usuarios').then((response) => response.data),
  crear: (input: CrearUsuarioInput) =>
    api.post<Usuario>('/usuarios', input).then((response) => response.data),
  editar: (id: number, input: EditarUsuarioInput) =>
    api.put<Usuario>(`/usuarios/${id}`, input).then((response) => response.data),
  cambiarEstado: (id: number, activo: boolean) =>
    api.patch<Usuario>(`/usuarios/${id}/estado`, null, { params: { activo } })
      .then((response) => response.data),
};
