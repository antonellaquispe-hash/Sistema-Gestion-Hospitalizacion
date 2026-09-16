export interface Piso {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Habitacion {
  id: number;
  numero: string;
  descripcion: string;
  piso: Piso | null;
}

export interface Paciente {
  id: number;
  nombre: string;
  dni: string;
}

export interface Cama {
  id: number;
  estado: 'DISPONIBLE' | 'OCUPADA' | string;
  habitacion: Habitacion | null;
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
  habitacion?: Habitacion | null;
  piso?: Piso | null;
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