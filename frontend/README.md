# Frontend Web (Mini Task Manager)

Frontend construido con React + TypeScript, manejo de estado con Redux Toolkit, comunicación HTTP con Axios y estilos usando Tailwind CSS.
Consume la API del backend (Phalcon + JWT) para autenticación y gestión de tareas.

---

Requisitos (Local)
- Node.js 18+ (recomendado LTS)
- npm (incluido con Node)
- Backend levantado y accesible (ver README del backend)

---

1) Variables de entorno del frontend

En la carpeta frontend/, crea un archivo .env:

```bash
cp frontend/.env.example frontend/.env
```

Edita frontend/.env y configura la URL del backend:

```bash
VITE_API_URL=http://localhost:8000
```

Importante:
- Las variables deben comenzar con VITE_ para que Vite las exponga al frontend.
- Si cambias el puerto del backend, actualiza este valor.

---

2) Instalar dependencias

Desde la raíz del proyecto:

```bash
cd frontend
npm install
```

---

3) Ejecutar el servidor de desarrollo

Desde frontend/:

```bash
npm run dev
```

Por defecto, la app se levanta en:

```bash
http://localhost:5173
```

---

4) Flujo de la aplicación
1.	Abre el navegador en:

```bash
http://localhost:5173
```

2.	Regístrate con un email y password.
3.	Inicia sesión.
4.	Al autenticarte correctamente:
  - El JWT se guarda en localStorage.
  - Axios adjunta automáticamente el token en cada request.
5.	Accede al dashboard de tareas:
  - Crear tareas
  - Editar tareas
  - Cambiar estado (pending / in_progress / done)
  - Filtrar por estado
6.	Logout limpia el estado y el token.

---

5) Estructura principal del frontend

```bash
frontend/
├─ src/
│  ├─ app/
│  │  ├─ store.ts        # Redux store
│  │  └─ hooks.ts        # Hooks tipados (useAppDispatch/useAppSelector)
│  │
│  ├─ features/
│  │  ├─ auth/           # Auth slice, API y lógica JWT
│  │  └─ tasks/          # Tasks slice, API y lógica CRUD
│  │
│  ├─ components/
│  │  ├─ TaskForm.tsx
│  │  └─ StatusPill.tsx
│  │
│  ├─ routes/
│  │  ├─ LoginPage.tsx
│  │  ├─ RegisterPage.tsx
│  │  └─ TasksPage.tsx
│  │
│  ├─ services/
│  │  └─ api.ts          # Axios instance + interceptors
│  │
│  ├─ App.tsx            # Routing principal
│  └─ main.tsx           # Entry point
│
├─ index.html
├─ tailwind.config.js
├─ vite.config.ts
└─ package.json
```

---

6) Autenticación y seguridad
- El token JWT:
- Se guarda en localStorage
- Se envía en el header:

```bash
Authorization: Bearer <token>
```

- Rutas protegidas:
  - /tasks requiere sesión activa
- Si no hay token → redirect a /login
- Si el backend responde 401 Unauthorized:
- El usuario es deslogueado automáticamente

---

7) Comunicación con el backend

Axios está configurado en:

```bash
src/services/api.ts
```

- baseURL viene desde VITE_API_URL
- Interceptor de request:
  - Adjunta el JWT si existe
  - Interceptor de response:
  - Maneja errores HTTP (401, 400, etc.)

---

8) Manejo de estado (Redux)
- Redux Toolkit
- createAsyncThunk para llamadas async
- Estados manejados:
  - idle | loading | succeeded | failed
- Errores mostrados en UI de forma clara

---

9) Estilos
- Tailwind CSS
- Clases utilitarias
- Componentes simples y consistentes
- Sin librerías de UI externas (intencional para la prueba técnica)
