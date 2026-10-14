import type { Cama, Habitacion, Piso } from '../types';
import api from './http';

export const camasApi = {
  listar: () => api.get<Array<Cama>>('/camas').then((r) => r.data),
  listarDisponibles: () => api.get<Array<Cama>>('/camas/disponibles').then((r) => r.data),
  crear: (cama: Omit<Cama, 'id'>) => api.post<Cama>('/camas', cama).then((r) => r.data),
  editar: (id: number, cama: Omit<Cama, 'id'>) => api.put<Cama>(`/camas/${id}`, cama).then((r) => r.data),
};

export const habitacionesApi = {
  listar: () => api.get<Array<Habitacion>>('/habitaciones').then((r) => r.data),
  listarPorPiso: (pisoId: number) => api.get<Array<Habitacion>>(`/habitaciones/por-piso/${pisoId}`).then((r) => r.data),
  crear: (habitacion: Omit<Habitacion, 'id' | 'activo'>) => api.post<Habitacion>('/habitaciones', habitacion).then((r) => r.data),
  editar: (id: number, habitacion: Omit<Habitacion, 'id' | 'activo'>) => api.put<Habitacion>(`/habitaciones/${id}`, habitacion).then((r) => r.data),
  cambiarEstado: (id: number, activo: boolean) => api.patch<Habitacion>(`/habitaciones/${id}/estado`, null, { params: { activo } }).then((r) => r.data),
};

export const pisosApi = {
  listar: () => api.get<Array<Piso>>('/pisos').then((r) => r.data),
  crear: (piso: Omit<Piso, 'id'>) => api.post<Piso>('/pisos', piso).then((r) => r.data),
  editar: (id: number, piso: Omit<Piso, 'id'>) => api.put<Piso>(`/pisos/${id}`, piso).then((r) => r.data),
};
