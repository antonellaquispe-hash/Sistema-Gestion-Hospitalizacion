export type RolNombre = 'ADMINISTRADOR' | 'MÉDICO' | 'RECEPCIONISTA';

export interface Sesion {
  nombreUsuario: string;
  nombreCompleto: string;
  rol: string;
  rutaInicial: string;
}

export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  activo: boolean;
  rol: Rol;
}

export interface Rol {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface CrearUsuarioInput {
  nombreUsuario: string;
  nombreCompleto: string;
  contrasena: string;
  rolId: number;
}

export interface EditarUsuarioInput {
  nombreUsuario: string;
  nombreCompleto: string;
  contrasena?: string;
  rolId: number;
}

export interface RolInput {
  nombre: string;
}

export interface Auditoria {
  id: number;
  usuario: string;
  fechaHora: string;
  operacion: string;
  entidadAfectada: string;
  identificadorRegistro: string;
}
