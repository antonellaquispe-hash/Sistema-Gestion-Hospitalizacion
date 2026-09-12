export interface Paciente {
  id: number;
  nombre: string;
  dni: string;
}

export interface Cama {
  id: number;
  estado: 'DISPONIBLE' | 'OCUPADA' | string;
}

export type SolicitudEstado = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

export interface SolicitudHospitalizacion {
  id: number;
  documentoPaciente: string;
  motivo: string;
  fechaSolicitud: string | null;
  estado: SolicitudEstado;
}

export interface IngresoHospitalario {
  id: number;
  fechaIngreso: string;
  motivoIngreso: string;
  estado: 'ACTIVO' | 'FINALIZADO' | string;
  paciente: Paciente | null;
  cama: Cama | null;
}

export interface Movimiento {
  id: number;
  fechaTraslado: string;
  motivo: string;
  medicoResponsable: string;
  usuarioTraslado: string;
  observaciones: string | null;
  ingreso: IngresoHospitalario;
  camaOrigen: Cama;
  camaDestino: Cama;
}

export interface ApiError {
  mensaje: string;
}

export interface CrearSolicitudInput {
  documentoPaciente: string;
  motivo: string;
}

export interface CrearPacienteInput {
  nombre: string;
  dni: string;
}

export interface TrasladarInput {
  motivo: string;
  medicoResponsable: string;
  usuarioTraslado: string;
  observaciones?: string;
}