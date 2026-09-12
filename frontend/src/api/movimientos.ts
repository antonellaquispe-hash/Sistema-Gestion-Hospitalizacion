import type { Movimiento } from '../types';
import api from './http';

export const movimientosApi = {
  listar: () => api.get<Array<Movimiento>>('/movimientos').then((r) => r.data),
};