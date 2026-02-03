# Mini Task Manager

Aplicación full-stack para gestión de tareas, construida con:
- Backend: PHP 8 + Phalcon (Micro) + PostgreSQL + JWT
- Frontend: React + TypeScript + Redux Toolkit + Tailwind CSS
- Infraestructura: Docker + Docker Compose + Nginx (producción)

El proyecto está preparado para ejecutarse completamente en Docker, incluyendo base de datos, API y frontend productivo.

---

Requisitos
- Docker 24+
- Docker Compose v2+
- Puertos disponibles:
- 8080 (frontend / nginx)
- 5432 (PostgreSQL, opcional si necesitas acceso externo)

No es necesario instalar:
- PHP
- Node.js
- PostgreSQL
- Composer
- npm

Todo corre dentro de contenedores.

---

Estructura del proyecto

```bash
.
├─ backend/                # API PHP (Phalcon)
├─ frontend/               # App React (Vite)
├─ docker/
│  ├─ backend/             # Dockerfile backend
│  ├─ frontend/            # Dockerfile frontend + nginx.conf
│  └─ db/                  # Init scripts PostgreSQL (schema + SPs)
├─ docker-compose.yml
├─ .dockerignore
└─ README.md
```

---

Arquitectura en Docker (Producción)

```bash
Browser
  ↓ http://localhost:8080
[Nginx - Frontend]
  ├─ sirve React (build estático)
  └─ proxy /api/* → API
              ↓
        [Backend API - Phalcon]
              ↓
          [PostgreSQL]
```

- El frontend y backend comparten el mismo origen (localhost:8080)
- No se requieren configuraciones CORS en producción
- El backend no se expone directamente al host

---

Variables de entorno (Docker)

Las variables ya están definidas en docker-compose.yml.

Backend (API)
```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8080

DB_DRIVER=pgsql
DB_HOST=db
DB_PORT=5432
DB_NAME=tasks
DB_USER=tasks_user
DB_PASS=tasks_pass

JWT_SECRET=change-me-in-prod-use-long-secret
JWT_TTL_MINUTES=60
```

⚠️ Importante:
Para un entorno real, cambia JWT_SECRET por un valor seguro (mínimo 32 caracteres).

---

Levantar el proyecto (Docker)

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

Esto hará:
1.	Construir la imagen del backend
2.	Construir el frontend (Vite build)
3.	Inicializar PostgreSQL
4.	Ejecutar scripts SQL (schema + triggers + stored procedures)
5.	Levantar Nginx sirviendo el frontend

---

Verificar que todo está corriendo

Ver estado de los contenedores

```bash
docker compose ps
```

Debes ver:
- mini_task_db → healthy
- mini_task_api → running
- mini_task_web → running

Ver logs (opcional)

```bash
docker logs -f mini_task_web
docker logs -f mini_task_api
docker logs -f mini_task_db
```

---

Acceso a la aplicación
- Frontend (React + Nginx)
👉 http://localhost:8080
- Backend vía Nginx (proxy)
👉 http://localhost:8080/api/health

Ejemplo:

```bash
curl http://localhost:8080/api/health
```

Respuesta esperada:

```bash
{"ok":true,"env":"production"}
```

---

Flujos principales

Autenticación
- Registro de usuario
- Login con JWT
- Token almacenado en localStorage
- Enviado automáticamente en cada request protegida

Gestión de tareas
- Crear tareas
- Editar tareas
- Cambiar estado (pending, in_progress, done)
- Filtrar por estado
- Todas las operaciones protegidas por JWT

---

Base de datos

PostgreSQL se inicializa automáticamente usando los scripts en:

```bash
docker/db/init/
├─ 001_schema.sql
├─ 002_triggers.sql
└─ 003_stored_procedures.sql
```

Stored Procedures (schema api):
- api.create_user
- api.get_user_auth
- api.list_tasks
- api.create_task
- api.update_task

Para listar SPs:

```bash
docker exec -it mini_task_db \
  psql -U tasks_user -d tasks -c "\df api.*"
```

---

Detener el proyecto

```bash
docker compose down
```

Para eliminar también los volúmenes (⚠️ borra datos):

```bash
docker compose down -v
```

---

Notas finales
- El proyecto está configurado en modo producción
- El frontend se sirve con Nginx (no Vite dev server)
- El backend queda protegido detrás del reverse proxy
- Ideal para evaluación técnica y despliegue local controlado

---

Comando rápido (TL;DR)

```bash
docker compose up -d --build
open http://localhost:8080
```
