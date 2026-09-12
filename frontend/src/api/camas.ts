import type { Cama } from '../types';
import api from './http';

export const camasApi = {
  listar: () => api.get<Array<Cama>>('/camas').then((r) => r.data),
  listarDisponibles: () => api.get<Array<Cama>>('/camas/disponibles').then((r) => r.data),
};