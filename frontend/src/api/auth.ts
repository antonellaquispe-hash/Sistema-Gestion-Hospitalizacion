import api from './http';
import type { Sesion } from '../types/auth';

interface CsrfResponse {
  token: string;
}

export const authApi = {
  async csrf(): Promise<string> {
    const response = await api.get<CsrfResponse>('/auth/csrf');
    return response.data.token;
  },
  login: async (nombreUsuario: string, contrasena: string): Promise<Sesion> => {
    const token = await authApi.csrf();
    return api
      .post<Sesion>(
        '/auth/login',
        { nombreUsuario, contrasena },
        { headers: { 'X-XSRF-TOKEN': token } },
      )
      .then((response) => response.data);
  },
  sesion: () => api.get<Sesion>('/auth/me').then((response) => response.data),
  logout: async (): Promise<void> => {
    const token = await authApi.csrf();
    await api.post('/auth/logout', undefined, {
      headers: { 'X-XSRF-TOKEN': token },
    });
  },
};
