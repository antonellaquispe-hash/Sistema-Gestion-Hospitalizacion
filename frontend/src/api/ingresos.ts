import type { IngresoHospitalario, Movimiento, TrasladarInput } from '../types';
import api from './http';

export const ingresosApi = {
  listar: () => api.get<Array<IngresoHospitalario>>('/ingresos').then((r) => r.data),
  obtener: (id: number) => api.get<IngresoHospitalario>(`/ingresos/${id}`).then((r) => r.data),
  registrar: (pacienteId: number, motivo: string) =>
    api
      .post<IngresoHospitalario>('/ingresos', null, { params: { pacienteId, motivo } })
      .then((r) => r.data),
  asignarCama: (ingresoId: number, camaId: number) =>
    api
      .put<IngresoHospitalario>(`/ingresos/${ingresoId}/asignar-cama/${camaId}`)
      .then((r) => r.data),
  trasladar: (ingresoId: number, camaDestinoId: number, input: TrasladarInput) =>
    api
      .put<Movimiento>(`/ingresos/${ingresoId}/trasladar/${camaDestinoId}`, null, {
        params: {
          motivo: input.motivo,
          medicoResponsable: input.medicoResponsable,
          usuarioTraslado: input.usuarioTraslado,
          observaciones: input.observaciones ?? undefined,
        },
      })
      .then((r) => r.data),
  finalizar: (id: number) =>
    api.put<IngresoHospitalario>(`/ingresos/${id}/finalizar`).then((r) => r.data),
  movimientos: (ingresoId: number) =>
    api.get<Array<Movimiento>>(`/ingresos/${ingresoId}/movimientos`).then((r) => r.data),
};