# Sistema-Gestion-Hospitalizacion

Sistema de Gestión de Hospitalización - Evaluación 02 (Desarrollo de Aplicaciones Web)

## 📋 Requisitos previos

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| **JDK** | **21** (Oracle JDK, OpenJDK, Temurin, etc.) | Configurar `JAVA_HOME` |
| **Maven** | 3.9+ | Incluido wrapper (`mvnw`) |
| **Node.js** | 20+ LTS | Para frontend React/Vite |
| **npm** | 10+ | Incluido con Node.js |
| **MySQL** | 8.0+ | Administrado con SQLyog |
| **SQLyog** | 13+ | GUI para MySQL (opcional, puede usar CLI) |

### Configurar `JAVA_HOME` (Windows PowerShell)

```powershell
# Ejemplo para Eclipse Temurin 21 instalado en C:\Program Files\Eclipse Adoptium\jdk-21.x.x.x-hotspot
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-21.x.x.x-hotspot", "User")
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.x.x.x-hotspot"
$env:Path += ";$env:JAVA_HOME\bin"
```

Verificar:
```powershell
java -version
# Debe mostrar: openjdk version "21.x.x" ...
```

---

## 🗄️ Configuración de Base de Datos (MySQL + SQLyog)

### 1. Crear la base de datos

**Opción A: Desde SQLyog**
1. Abre SQLyog y conecta a tu servidor MySQL local
2. Ejecuta el script `schema.sql` de la raíz del repo (botón "Execute" o F9)

**Opción B: Desde línea de comandos**
```bash
mysql -u root -p < schema.sql
```

El script crea:
- Base de datos `gestion_hospitalizacion`
- Tablas: `pisos`, `habitaciones`, `camas`, `pacientes`, `solicitudes_hospitalizacion`, `ingresos_hospitalarios`, `movimientos`
- Tablas de Evaluación 02: `usuarios`, `roles`, `auditorias`. Cada usuario tiene un rol mediante `usuarios.rol_id`.
- Roles precargados: `ADMINISTRADOR`, `MÉDICO`, `RECEPCIONISTA`
- Índices y constraints de integridad

### 2. Configurar credenciales locales

Copia el archivo de plantilla y ajusta tus credenciales:

```bash
# El archivo application-local.properties está en .gitignore (NO se sube al repo)
cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
```

Edita `src/main/resources/application-local.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gestion_hospitalizacion
spring.datasource.username=root
spring.datasource.password=tu_password_aqui

# En desarrollo usamos 'update' para que Hibernate actualice el esquema automáticamente
spring.jpa.hibernate.ddl-auto=update
```

> **Nota:** El archivo `application.properties` principal usa `ddl-auto=validate` (seguro para producción). El profile `local` sobrescribe a `update` solo en desarrollo.

### 3. Variables de entorno (alternativa a application-local.properties)

Puedes sobrescribir la configuración sin tocar archivos:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/gestion_hospitalizacion"
$env:DB_USER = "root"
$env:DB_PASSWORD = "tu_password"
$env:SERVER_PORT = "8081"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
```

---

## 🚀 Levantar el proyecto

### Backend (Spring Boot)

```bash
# Desde la raíz del proyecto
./mvnw clean spring-boot:run
# O en Windows PowerShell:
.\mvnw.cmd clean spring-boot:run
```

- Puerto por defecto: **8081** (configurable con `SERVER_PORT`)
- API base: `http://localhost:8081/api`
- Comprobación pública de la API: `GET http://localhost:8081/api/auth/csrf` (Actuator no está instalado).

### Perfil de desarrollo (local)

Para activar `application-local.properties`:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Primer administrador

Si `usuarios` está vacía, configura `BOOTSTRAP_ADMIN_USER` y
`BOOTSTRAP_ADMIN_PASSWORD` antes de arrancar el backend. La contraseña debe tener
entre 8 y 72 caracteres. El inicializador crea el administrador con BCrypt;
no existen credenciales predeterminadas. Retira estas variables después del primer arranque.

En macOS/Linux puedes definirlas con `export NOMBRE_VARIABLE=valor`; en PowerShell
con `$env:NOMBRE_VARIABLE = "valor"`. MySQL debe estar iniciado y `schema.sql`
ejecutado antes de arrancar o ejecutar la prueba de contexto.

### Frontend (React + Vite)

```bash
cd frontend
npm ci
npm run dev
```

- Puerto por defecto: **5173**
- Proxy configurado a `http://localhost:8081/api` (ver `vite.config.ts`)
- Abre `http://localhost:5173` en el navegador

---

## 📦 Estructura del proyecto

```
Sistema-Gestion-Hospitalizacion/
├── src/main/java/com/tecsup/Evaluacion/
│   ├── config/           # WebConfig (CORS), SecurityConfig, PasswordConfig, RoleInitializer
│   ├── controller/       # REST Controllers
│   ├── exception/        # Excepciones personalizadas + GlobalExceptionHandler
│   ├── model/            # Entidades JPA
│   ├── repository/       # Spring Data JPA Repositories
│   └── service/          # Lógica de negocio
├── src/main/resources/
│   ├── application.properties        # Config base (validate, vars de entorno)
│   ├── application-local.properties  # Config local (update, credenciales reales) - .gitignore
│   └── application-local.properties.example # Plantilla de configuración local
├── frontend/
│   ├── src/
│   │   ├── api/          # Clientes Axios por módulo
│   │   ├── components/   # Componentes UI reutilizables (MUI)
│   │   ├── hooks/        # Custom hooks (useApi, useToast)
│   │   ├── layouts/      # Layouts de página
│   │   ├── pages/        # Páginas principales
│   │   ├── routes/       # Configuración de rutas (React Router)
│   │   ├── types/        # Interfaces TypeScript
│   │   └── utils/        # Utilidades (formato de fechas, etc.)
│   ├── package.json
│   └── vite.config.ts
├── pom.xml
├── mvnw / mvnw.cmd
├── schema.sql
└── README.md
```

---

## 🔧 Endpoints principales (API REST)

| Módulo | Endpoints |
|--------|-----------|
| **Auth** | `GET /api/auth/csrf` · `POST /api/auth/login` · `GET /api/auth/me` · `POST /api/auth/logout` |
| **Pacientes** | `GET/POST /api/pacientes` · `GET /api/pacientes/{id}` |
| **Pisos** | `GET/POST /api/pisos` |
| **Habitaciones** | `GET/POST /api/habitaciones` · `GET /api/habitaciones/por-piso/{pisoId}` |
| **Camas** | `GET/POST /api/camas` · `GET /api/camas/disponibles` |
| **Solicitudes** | `GET/POST /api/solicitudes` · `PUT /api/solicitudes/{id}/estado` |
| **Ingresos** | `GET/POST /api/ingresos` · `GET /api/ingresos/{id}` · `PUT /api/ingresos/{id}/finalizar` · `PUT /api/ingresos/{ingresoId}/asignar-cama/{camaId}` · `PUT /api/ingresos/{ingresoId}/trasladar/{camaDestinoId}` |
| **Movimientos** | `GET /api/movimientos` · `GET /api/ingresos/{ingresoId}/movimientos` |
| **Usuarios** | `GET/POST /api/usuarios` · `PUT /api/usuarios/{id}` · `PATCH /api/usuarios/{id}/estado` (ADMINISTRADOR) |
| **Roles** | `GET/POST /api/roles` · `PUT /api/roles/{id}` · `PATCH /api/roles/{id}/estado` (ADMINISTRADOR) |
| **Auditoría** | `GET /api/auditorias` (ADMIN) |

---

## 🔐 Roles y permisos

| Rol | Permisos |
|-----|----------|
| **ADMINISTRADOR** | Usuarios, Roles, Auditoría, Pacientes, Ingresos, Solicitudes, Camas, Habitaciones, Pisos |
| **MÉDICO** | Pacientes, Ingresos, Movimientos y consulta de camas disponibles |
| **RECEPCIONISTA** | Pacientes, Solicitudes |

La autenticación usa **Spring Security + BCrypt + Sesión (Cookie) + CSRF**. El login es `POST /api/auth/login` precedido de `GET /api/auth/csrf`.

---

## 🧪 Testing

```bash
# Backend tests (requieren MySQL y el esquema configurado)
./mvnw test

# Frontend type-check + build (lint ejecuta únicamente TypeScript)
cd frontend
npm run build   # incluye tsc --noEmit + vite build
```

---

## 📝 Notas de desarrollo

- **Java 21**: El proyecto usa `maven.compiler.release=21` (requiere JDK 21+)
- **Spring Boot 3.3.3**: Compatible con Java 21
- **ddl-auto**: `validate` en `application.properties` (producción), `update` en `application-local.properties` (desarrollo)
- **CORS**: Configurable vía `CORS_ALLOWED_ORIGINS` (por defecto `http://localhost:5173`)
- **Puerto**: Configurable vía `SERVER_PORT` (por defecto `8081`)

---

## 🐛 Problemas conocidos y arreglos

### Errores arreglados

1. **Bug de serialización Jackson (ByteBuddyInterceptor)** - Los endpoints `PUT /api/ingresos/{id}/asignar-cama/{camaId}` y `PUT /api/ingresos/{id}/trasladar/{camaDestinoId}` devolvían 500 a pesar de guardar los datos en BD, debido a que Jackson intentaba serializar asociaciones lazy de Hibernate (`HibernateProxy` → `ByteBuddyInterceptor`).  
   - **Raíz**: entidades devueltas con proxies lazy fuera de la transacción.  
   - **Solución**: 
     * `MovimientoRepository`: queries `listarConTodo()`, `findByIngresoIdConTodo()`, `buscarConTodoPorId` ahora usan `JOIN FETCH` en `cama.habitacion → piso`, `ingreso.cama → habitacion → piso`, y `ingreso.paciente`.
     * `IngresoHospitalarioService`: `asignarCama()` y `trasladarPaciente()` re-consultan con `buscarConTodoPorId()` después del `save()` para devolver entidades totalmente inicializadas (sin proxies).

2. **Nueva funcionalidad: "Registrar cama" en `CamasPage`**  
   - Botón **+ Registrar cama** en el encabezado y en el estado vacío.  
   - Diálogo MUI con selector de habitación (muestra `Hab. B1 · Quirofano`; si no hay habitaciones, avisa para crearlas en "Pisos y Habitaciones").  
   - Toast de éxito y refresco automático de la lista.  
   - **Backend asociado**: `CamaResponse` DTO que materializa `cama → habitación → piso` dentro de la transacción, por lo que `POST /api/camas` ahora responde **200** con JSON completo (antes daba 500).  
   - El tipo `Cama` de TypeScript es compatible con la respuesta DTO, sin cambios en el frontend.

3. **Corrección de tipos TypeScript**  
   - `frontend/src/types/auth.ts`: `rol: string` → `rol: RolNombre`. Arreglaba 2 errores `TS2345` que bloqueaban `npm run build`.

### Correcciones de revisión local

- Corregidos los endpoints de usuarios/roles y el flag del perfil local.
- Wrapper ejecutable en macOS/Linux; CORS admite `PATCH` y la variable alternativa `CORS_ORIGINS`.
- El médico puede consultar camas disponibles para asignar y trasladar.
- Se rechazan asignaciones duplicadas y asignaciones/traslados de ingresos finalizados.
- Se valida la longitud de los datos de ingresos y traslados; solicitudes mal formadas responden 400 y conflictos de integridad 409.
- Se renueva el identificador de sesión al autenticar una sesión existente.
- El selector de camas se refresca al asignar y el detalle refleja el ingreso actualizado tras un traslado.

---
## 👥 Equipo

Evaluación 02 - Desarrollo de Aplicaciones Web - Equipo de 4 personas
