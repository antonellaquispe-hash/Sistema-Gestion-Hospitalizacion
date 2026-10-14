-- =====================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS Y TABLAS
-- Sistema de Gestión de Hospitalización - Evaluación 02
-- Compatible con MySQL 8.0+ / SQLyog
-- =====================================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `gestion_hospitalizacion`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `gestion_hospitalizacion`;

-- =====================================================================
-- TABLA: pisos
-- =====================================================================
CREATE TABLE IF NOT EXISTS `pisos` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: habitaciones
-- =====================================================================
CREATE TABLE IF NOT EXISTS `habitaciones` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `numero` VARCHAR(20) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `descripcion` VARCHAR(255),
  `piso_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_habitacion_piso` FOREIGN KEY (`piso_id`) REFERENCES `pisos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: camas
-- =====================================================================
CREATE TABLE IF NOT EXISTS `camas` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
  `habitacion_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cama_habitacion` FOREIGN KEY (`habitacion_id`) REFERENCES `habitaciones` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_cama_estado` CHECK (`estado` IN ('DISPONIBLE','OCUPADA','LIMPIEZA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: pacientes
-- =====================================================================
CREATE TABLE IF NOT EXISTS `pacientes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `dni` VARCHAR(8) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_paciente_dni` UNIQUE (`dni`),
  CONSTRAINT `chk_paciente_dni_length` CHECK (CHAR_LENGTH(`dni`) = 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: solicitudes_hospitalizacion
-- =====================================================================
CREATE TABLE IF NOT EXISTS `solicitudes_hospitalizacion` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `documento_paciente` VARCHAR(8) NOT NULL,
  `motivo` VARCHAR(500) NOT NULL,
  `fecha_solicitud` DATETIME(6) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_solicitud_estado` CHECK (`estado` IN ('PENDIENTE','APROBADA','RECHAZADA','CANCELADA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: ingresos_hospitalarios
-- =====================================================================
CREATE TABLE IF NOT EXISTS `ingresos_hospitalarios` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `fecha_ingreso` DATETIME(6) NOT NULL,
  `motivo_ingreso` VARCHAR(500) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  `paciente_id` BIGINT NOT NULL,
  `cama_id` BIGINT,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ingreso_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ingreso_cama` FOREIGN KEY (`cama_id`) REFERENCES `camas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_ingreso_estado` CHECK (`estado` IN ('ACTIVO','FINALIZADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: movimientos
-- =====================================================================
CREATE TABLE IF NOT EXISTS `movimientos` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `fecha_traslado` DATETIME(6) NOT NULL,
  `motivo` VARCHAR(500) NOT NULL,
  `medico_responsable` VARCHAR(150) NOT NULL,
  `usuario_traslado` VARCHAR(100) NOT NULL,
  `observaciones` VARCHAR(1000),
  `ingreso_id` BIGINT NOT NULL,
  `cama_origen_id` BIGINT NOT NULL,
  `cama_destino_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_movimiento_ingreso` FOREIGN KEY (`ingreso_id`) REFERENCES `ingresos_hospitalarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_movimiento_cama_origen` FOREIGN KEY (`cama_origen_id`) REFERENCES `camas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_movimiento_cama_destino` FOREIGN KEY (`cama_destino_id`) REFERENCES `camas` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: roles (para Evaluación 02 - P3)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(40) NOT NULL,
  `descripcion` VARCHAR(255),
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_roles_nombre` UNIQUE (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: usuarios (para Evaluación 02 - P3)
-- Alineada con la entidad Usuario (model/Usuario.java)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre_usuario` VARCHAR(80) NOT NULL,
  `nombre_completo` VARCHAR(160) NOT NULL,
  `contrasena_hash` VARCHAR(100) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `rol_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_usuarios_nombre_usuario` UNIQUE (`nombre_usuario`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: auditorias (para Evaluación 02 - P2)
-- Alineada con la entidad Auditoria (model/Auditoria.java)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `auditorias` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `usuario` VARCHAR(80) NOT NULL,
  `fecha_hora` DATETIME(6) NOT NULL,
  `operacion` VARCHAR(20) NOT NULL,
  `entidad_afectada` VARCHAR(100) NOT NULL,
  `identificador_registro` VARCHAR(80) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_auditorias_fecha_hora` (`fecha_hora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =====================================================================
CREATE INDEX `idx_cama_estado` ON `camas` (`estado`);
CREATE INDEX `idx_cama_habitacion` ON `camas` (`habitacion_id`);
CREATE INDEX `idx_habitacion_piso` ON `habitaciones` (`piso_id`);
CREATE INDEX `idx_ingreso_paciente` ON `ingresos_hospitalarios` (`paciente_id`);
CREATE INDEX `idx_ingreso_cama` ON `ingresos_hospitalarios` (`cama_id`);
CREATE INDEX `idx_ingreso_estado` ON `ingresos_hospitalarios` (`estado`);
CREATE INDEX `idx_movimiento_ingreso` ON `movimientos` (`ingreso_id`);
CREATE INDEX `idx_movimiento_fecha` ON `movimientos` (`fecha_traslado`);
CREATE INDEX `idx_solicitud_estado` ON `solicitudes_hospitalizacion` (`estado`);
CREATE INDEX `idx_solicitud_documento` ON `solicitudes_hospitalizacion` (`documento_paciente`);

-- =====================================================================
-- DATOS INICIALES: Roles base (para Evaluación 02 - P3)
-- IMPORTANTE: el código compara con tilde ("MÉDICO") en AuthController,
-- SecurityConfig y el frontend (types/auth.ts)
-- =====================================================================
INSERT IGNORE INTO `roles` (`id`, `nombre`, `descripcion`, `activo`) VALUES
  (1, 'ADMINISTRADOR', 'Acceso total al sistema: usuarios, roles y todos los módulos', TRUE),
  (2, 'MÉDICO', 'Acceso a pacientes e historias clínicas', TRUE),
  (3, 'RECEPCIONISTA', 'Acceso a pacientes y citas/solicitudes', TRUE);

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
