# Backend API (Mini Task Manager)

Backend construido con PHP + Phalcon (Micro), autenticación JWT y persistencia en PostgreSQL usando Stored Procedures.

---

Requisitos (Local)
- PHP 8.4+
- Composer
- Extensión Phalcon instalada y habilitada
- Docker (solo para PostgreSQL)

---

1) Levantar PostgreSQL con Docker (solo DB)

Desde la raíz del repo:

```bash
docker compose up -d db
```

Verifica que esté healthy:

```bash
docker compose ps
```

Opcional: ver logs de la DB:

```bash
docker logs -f mini_task_db
```

---

2) Variables de entorno del backend

En la carpeta backend/ crea tu .env basado en el ejemplo:

```bash
cp backend/.env.example backend/.env
```

Edita backend/.env y configura:

```bash
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_DRIVER=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tasks
DB_USER=tasks_user
DB_PASS=tasks_pass

JWT_SECRET=pon-una-clave-larga-minimo-32-caracteres
JWT_TTL_MINUTES=60
```

Generar un JWT_SECRET seguro

```bash
php -r 'echo bin2hex(random_bytes(32)) . PHP_EOL;'
```

Copia el valor generado en JWT_SECRET.

Importante: si el secreto es corto, firebase/php-jwt puede fallar con "Provided key is too short".

---

3) Instalar dependencias PHP

Entra a la carpeta backend:

```bash
cd backend
composer install
```

---

4) Ejecutar el servidor local

Desde backend/:

```bash
php -S localhost:8000 -t public
```

---

5) Probar que todo funciona (curls)

Health

```bash
curl -s http://localhost:8000/api/health
```

Debe responder algo como:
```
{"ok":true,"env":"local"}
```

---

Auth

Register

```bash
curl -s -X POST http://localhost:8000/api/register 
-H "Content-Type: application/json" 
-d '{"email":"test@example.com","password":"123456"}'
```

Login

```bash
curl -s -X POST http://localhost:8000/api/login 
-H "Content-Type: application/json" 
-d '{"email":"test@example.com","password":"123456"}'
```

Guarda el token:

```bash
TOKEN="PEGA_EL_TOKEN_AQUI"
```

---

Tasks (protegidas con JWT)

Listar tareas

```bash
curl -s -H "Authorization: Bearer $TOKEN" 
http://localhost:8000/api/tasks
```

Crear tarea

```bash
curl -s -X POST http://localhost:8000/api/tasks 
-H "Content-Type: application/json" 
-H "Authorization: Bearer $TOKEN" 
-d '{"title":"Primera tarea","description":"demo","status":"pending"}'
```

Actualizar tarea (ejemplo id=1)

```bash
curl -s -X PUT http://localhost:8000/api/tasks/1 
-H "Content-Type: application/json" 
-H "Authorization: Bearer $TOKEN" 
-d '{"status":"in_progress"}'
```

---

Base de datos y Stored Procedures

La DB se inicializa automáticamente con los scripts en:
- docker/db/init/001_schema.sql
- docker/db/init/002_triggers.sql
- docker/db/init/003_stored_procedures.sql

Stored Procedures del schema api:
- api.create_user(email, password_hash)
- api.get_user_auth(email)
- api.list_tasks(user_id, status)
- api.create_task(user_id, title, description, status)
- api.update_task(user_id, task_id, title, description, status)

Para listar SPs:

```bash
docker exec -it mini_task_db psql -U tasks_user -d tasks -c "\df api.*"
```

---

Manejo de errores
- Respuestas siempre en JSON.
- En desarrollo (APP_DEBUG=true) se incluye:
- tipo de excepción
- archivo y línea
- stack trace
- En producción (APP_DEBUG=false) se devuelve mensaje genérico.
