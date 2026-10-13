# Sistema-Gestion-Hospitalizacion

Sistema de gestión de hospitalización: camas, habitaciones, pisos,
pacientes, ingresos hospitalarios, traslados y solicitudes.
Backend Spring Boot + Hibernate/JPA, frontend React/Vite, MySQL.

## Requisitos

- JDK 21 (obligatorio, el proyecto usa `java.version=21`)
- Apache Maven (o usar el wrapper incluido `mvnw.cmd`)
- Node.js 18+ y npm
- MySQL 8 en local (puerto 3306)
- SQLyog para administrar la base de datos

## Configurar JAVA_HOME (Windows)

El wrapper de Maven usa el JDK que indique `JAVA_HOME`.
Debe apuntar a un JDK 21:

```powershell
[System.Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
```

Si no apunta a JDK 21, configúralo (ajusta la ruta a tu instalación):

```powershell
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot" /M
```

Cierra y reabre la terminal, luego verifica:

```powershell
java -version
.\mvnw.cmd -version
```

## Levantar la BD local

1. En SQLyog conéctate a tu MySQL local.
2. Ejecuta el script `schema.sql` de la raíz del repo
   (crea la base `gestion_hospitalizacion` y las 7 tablas base).
3. Configura tus credenciales reales en
   `src/main/resources/application-local.properties`
   (ese archivo NO se commitea). Ejemplo:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/gestion_hospitalizacion
   spring.datasource.username=root
   spring.datasource.password=TU_CLAVE
   spring.jpa.hibernate.ddl-auto=update
   ```
4. Arranca el backend con el perfil local:
   ```powershell
   .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
   ```

Sin perfil `local`, la app usa variables de entorno con valores
por defecto (ver `src/main/resources/application.properties`):

| Variable       | Defecto                                              |
|----------------|------------------------------------------------------|
| `SERVER_PORT`  | `8081`                                               |
| `DB_URL`       | `jdbc:mysql://localhost:3306/gestion_hospitalizacion`|
| `DB_USER`      | `root`                                               |
| `DB_PASSWORD`  | (vacío)                                              |
| `CORS_ORIGINS` | `http://localhost:5173`                              |

## Backend

```powershell
.\mvnw.cmd clean install -DskipTests
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

La API queda en `http://localhost:8081/api`
(puerto configurable con `SERVER_PORT`).

### Usuarios y roles

Al iniciar, la aplicación crea los roles `ADMINISTRADOR`, `MÉDICO` y
`RECEPCIONISTA` si aún no existen. El backend ofrece operaciones de usuarios y
roles bajo `/api/usuarios` y `/api/roles`; las contraseñas se almacenan con
BCrypt y nunca se incluyen en las respuestas. La configuración de acceso y el
inicio de sesión por rol se documentarán junto con la pantalla de autenticación.

## Frontend

```powershell
cd frontend
npm install
npm run build
npm run dev
```

El frontend queda en `http://localhost:5173`.
En desarrollo usa el proxy de `vite.config.ts` hacia el backend.
Para apuntar a otro backend:
```powershell
$env:VITE_PROXY_TARGET="http://localhost:8081"; npm run dev
```
