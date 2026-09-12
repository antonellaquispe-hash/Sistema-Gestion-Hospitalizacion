import api from './http';
import type { CrearPacienteInput, Paciente } from '../types';

export const pacientesApi = {
  listar: () => api.get<Array<Paciente>>('/pacientes').then((r) => r.data),
  obtener: (id: number) => api.get<Paciente>(`/pacientes/${id}`).then((r) => r.data),
  crear: (input: CrearPacienteInput) =>
    api.post<Paciente>('/pacientes', input).then((r) => r.data),
};