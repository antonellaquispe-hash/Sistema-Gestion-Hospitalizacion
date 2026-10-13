# Guia del proyecto

## Stack y estructura

- Backend: Java 21, Spring Boot, Spring MVC, Hibernate/JPA, MySQL.
- Frontend: React 18, TypeScript, Vite, Material UI.
- Paquete base Java: `com.tecsup.Evaluacion`.
- `config/`: configuracion Spring y CORS.
- `controller/`: endpoints REST bajo `/api`.
- `model/`: entidades JPA y enums.
- `repository/`: repositorios Spring Data.
- `service/`: reglas de negocio y operaciones transaccionales.
- `exception/`: excepciones de negocio y manejo HTTP.
- Frontend: `src/api/` para llamadas HTTP, `src/pages/` para pantallas,
  `src/layouts/` para estructura y navegacion, `src/types/` para tipos API.

## Convenciones

- Mantener las funcionalidades actuales de la Evaluacion 01.
- Usar nombres Java en PascalCase para tipos y camelCase para miembros.
- Mantener los controladores delgados; aplicar reglas e integridad en servicios.
- Declarar las relaciones en el lado propietario con `@JoinColumn` y nombres
  de FK explicitos cuando corresponda.
- Evitar serializacion JSON recursiva en relaciones bidireccionales.
- Exponer errores mediante las respuestas ya centralizadas en `exception/`;
  no ocultar fallos ni responder con datos ficticios.
- Mantener tipos TypeScript alineados con las respuestas REST.
- No agregar dependencias sin autorizacion expresa.
- No agregar versionado `/api/v1` ni pruebas nuevas durante la Fase 0.
- No guardar credenciales reales en archivos versionados.

## Base de datos local

- Motor: MySQL local administrado con SQLyog.
- Base: `gestion_hospitalizacion`.
- La configuracion compartida esta en `src/main/resources/application.properties`:
  `DB_URL` (por defecto `jdbc:mysql://localhost:3306/gestion_hospitalizacion`),
  `DB_USER` (por defecto `root`), `DB_PASSWORD` (por defecto vacia),
  `SERVER_PORT` (por defecto `8081`) y `CORS_ORIGINS` (por defecto
  `http://localhost:5173`).
- Credenciales locales y `ddl-auto=update` de desarrollo van en el archivo
  ignorado `src/main/resources/application-local.properties`. Activar con
  `SPRING_PROFILES_ACTIVE=local`.
- Ejecutar `schema.sql` en SQLyog para crear la base y las tablas base. Mantener
  el esquema SQL alineado con las entidades al cerrar cada pregunta.

## Plan de la Evaluacion 02

1. **P1 - Relaciones JPA:** revisar `model/` y las FK existentes; completar
   relaciones y ajustar `repository/`, `service/` y `controller/` donde el CRUD
   lo necesite. Actualizar `schema.sql`.
2. **P3 - Usuarios y roles:** crear `model/Usuario.java` y `model/Rol.java`,
   sus repositorios, servicios y controladores; precargar roles requeridos y
   proteger contrasenas con BCrypt. Sin credenciales predeterminadas reales.
3. **P5 - Seguridad:** configurar Spring Security, autenticacion y permisos por
   rol en backend y login. Spring Security fue autorizado para autenticacion,
   autorizacion y BCrypt.
4. **P2 - Auditoria:** crear entidad, repositorio y servicio de auditoria, y
   registrar operaciones de entidades principales con el usuario autenticado;
   exponer consulta de bitacora.
5. **P4 - Frontend:** agregar APIs, tipos, pantallas y rutas para usuarios y
   roles, login y menu filtrado por rol; verificar permisos siempre en backend.
6. **Cierre:** actualizar `schema.sql` y README, compilar frontend/backend y
   verificar arranque, endpoints y flujo de acceso.
