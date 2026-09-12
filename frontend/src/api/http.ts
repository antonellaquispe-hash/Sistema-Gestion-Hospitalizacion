import axios, { AxiosError } from 'axios';

export interface ApiErrorBody {
  mensaje?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error?.response?.status;
    const mensaje =
      error?.response?.data?.mensaje ??
      (status === 404
        ? 'El recurso solicitado no existe.'
        : status === 400
          ? 'Los datos enviados no son válidos.'
          : 'No fue posible conectar con el servidor. Inténtalo de nuevo.');
    const normalized = new Error(mensaje) as Error & { status?: number };
    normalized.status = status;
    return Promise.reject(normalized);
  },
);

export default api;