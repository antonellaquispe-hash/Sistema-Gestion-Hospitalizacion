import api from './http';
import type { Sesion } from '../types/auth';

export const authApi = {
  async csrf(): Promise<void> {
    await api.get('/auth/csrf');
  },
  login: async (nombreUsuario: string, contrasena: string): Promise<Sesion> => {
    await authApi.csrf();
    return api
      .post<Sesion>('/auth/login', { nombreUsuario, contrasena })
      .then((response) => response.data);
  },
  sesion: () => api.get<Sesion>('/auth/me').then((response) => response.data),
  logout: async (): Promise<void> => {
    await authApi.csrf();
    await api.post('/auth/logout');
  },
};
