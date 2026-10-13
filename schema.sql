-- =====================================================
-- Sistema de Gestion de Hospitalizacion - schema MySQL
-- Compatible con SQLyog. Ejecutar como administrador.
-- NOTA: es un esquema de referencia para crear la BD
-- local. La app usa ddl-auto=update, que crea/actualiza
-- las tablas automaticamente al arrancar.
-- Se actualizara al final con las entidades nuevas (P1-P5).
-- =====================================================

CREATE DATABASE IF NOT EXISTS gestion_hospitalizacion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_hospitalizacion;

-- ---------------- Pisos ----------------
CREATE TABLE IF NOT EXISTS pisos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255),
  descripcion VARCHAR(255),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------- Habitaciones ----------------
CREATE TABLE IF NOT EXISTS habitaciones (
  id BIGINT NOT NULL AUTO_INCREMENT,
  numero VARCHAR(255),
  descripcion VARCHAR(255),
  piso_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_habitaciones_piso FOREIGN KEY (piso_id)
    REFERENCES pisos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------- Camas ----------------
CREATE TABLE IF NOT EXISTS camas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  estado VARCHAR(255),
  habitacion_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_camas_habitacion FOREIGN KEY (habitacion_id)
    REFERENCES habitaciones (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------- Pacientes ----------------
CREATE TABLE IF NOT EXISTS pacientes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255),
  dni VARCHAR(255),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------- Ingresos hospitalarios ----------------
CREATE TABLE IF NOT EXISTS ingresos_hospitalarios (
  id BIGINT NOT NULL AUTO_INCREMENT,
  fecha_ingreso DATETIME,
  motivo_ingreso VARCHAR(255),
  estado VARCHAR(255),
  paciente_id BIGINT NOT NULL,
  cama_id BIGINT,
  PRIMARY KEY (id),
  CONSTRAINT fk_ingresos_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id),
  CONSTRAINT fk_ingresos_cama FOREIGN KEY (cama_id)
    REFERENCES camas (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------- Movimientos ----------------
CREATE TABLE IF NOT EXISTS movimientos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  fecha_traslado DATETIME,
  motivo VARCHAR(255),
  medico_responsable VARCHAR(255),
  usuario_traslado VARCHAR(255),
  observaciones VARCHAR(255),
  ingreso_id BIGINT NOT NULL,
  cama_origen_id BIGINT NOT NULL,
  cama_destino_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_movimientos_ingreso FOREIGN KEY (ingreso_id)
    REFERENCES ingresos_hospitalarios (id),
  CONSTRAINT fk_movimientos_cama_origen FOREIGN KEY (cama_origen_id)
    REFERENCES camas (id),
  CONSTRAINT fk_movimientos_cama_destino FOREIGN KEY (cama_destino_id)
    REFERENCES camas (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------- Solicitudes ----------------
CREATE TABLE IF NOT EXISTS solicitudes_hospitalizacion (
  id BIGINT NOT NULL AUTO_INCREMENT,
  documento_paciente VARCHAR(255) NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  fecha_solicitud DATETIME,
  estado VARCHAR(50),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
