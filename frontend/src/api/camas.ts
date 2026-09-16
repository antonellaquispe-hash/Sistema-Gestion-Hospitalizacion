import type { Cama, Habitacion, Piso } from '../types';
import api from './http';

export const camasApi = {
  listar: () => api.get<Array<Cama>>('/camas').then((r) => r.data),
  listarDisponibles: () => api.get<Array<Cama>>('/camas/disponibles').then((r) => r.data),
  crear: (cama: Cama) => api.post<Cama>('/camas', cama).then((r) => r.data),
};

export const habitacionesApi = {
  listar: () => api.get<Array<Habitacion>>('/habitaciones').then((r) => r.data),
  listarPorPiso: (pisoId: number) => api.get<Array<Habitacion>>(`/habitaciones/por-piso/${pisoId}`).then((r) => r.data),
  crear: (habitacion: Habitacion) => api.post<Habitacion>('/habitaciones', habitacion).then((r) => r.data),
};

export const pisosApi = {
  listar: () => api.get<Array<Piso>>('/pisos').then((r) => r.data),
  crear: (piso: Piso) => api.post<Piso>('/pisos', piso).then((r) => r.data),
};