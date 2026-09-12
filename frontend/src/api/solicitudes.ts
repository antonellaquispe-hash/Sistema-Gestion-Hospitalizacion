import api from './http';
import type { CrearSolicitudInput, SolicitudEstado, SolicitudHospitalizacion } from '../types';

export const solicitudesApi = {
  listar: () => api.get<Array<SolicitudHospitalizacion>>('/solicitudes').then((r) => r.data),
  crear: (input: CrearSolicitudInput) =>
    api.post<SolicitudHospitalizacion>('/solicitudes', input).then((r) => r.data),
  cambiarEstado: (id: number, estado: SolicitudEstado) =>
    api
      .put<SolicitudHospitalizacion>(`/solicitudes/${id}/estado`, null, { params: { estado } })
      .then((r) => r.data),
};