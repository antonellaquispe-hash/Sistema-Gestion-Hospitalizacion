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
-- TABLA: usuarios (para Evaluación 02 - P3)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nombre_completo` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100),
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `fecha_creacion` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_usuario_username` UNIQUE (`username`),
  CONSTRAINT `uk_usuario_email` UNIQUE (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: roles (para Evaluación 02 - P3)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(255),
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_rol_nombre` UNIQUE (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: usuario_roles (relación ManyToMany)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `usuario_roles` (
  `usuario_id` BIGINT NOT NULL,
  `rol_id` BIGINT NOT NULL,
  PRIMARY KEY (`usuario_id`, `rol_id`),
  CONSTRAINT `fk_usuario_rol_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usuario_rol_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLA: auditoria (para Evaluación 02 - P2)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `auditoria` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `usuario` VARCHAR(100) NOT NULL,
  `fecha_hora` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `operacion` VARCHAR(20) NOT NULL,
  `entidad` VARCHAR(100) NOT NULL,
  `entidad_id` BIGINT NOT NULL,
  `detalle` JSON,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_auditoria_operacion` CHECK (`operacion` IN ('CREAR','ACTUALIZAR','ELIMINAR'))
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
CREATE INDEX `idx_auditoria_entidad` ON `auditoria` (`entidad`, `entidad_id`);
CREATE INDEX `idx_auditoria_fecha` ON `auditoria` (`fecha_hora`);
CREATE INDEX `idx_auditoria_usuario` ON `auditoria` (`usuario`);

-- =====================================================================
-- DATOS INICIALES: Roles base (para Evaluación 02 - P3)
-- =====================================================================
INSERT IGNORE INTO `roles` (`id`, `nombre`, `descripcion`, `activo`) VALUES
  (1, 'ADMINISTRADOR', 'Acceso total al sistema: usuarios, roles y todos los módulos', TRUE),
  (2, 'MEDICO', 'Acceso a pacientes e historias clínicas', TRUE),
  (3, 'RECEPCIONISTA', 'Acceso a pacientes y citas/solicitudes', TRUE);

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================