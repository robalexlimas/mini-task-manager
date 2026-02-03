-- ===== USERS =====

-- Crea usuario. Recibe email y password_hash (hash se hace en backend).
-- Devuelve el id del usuario creado.
CREATE OR REPLACE FUNCTION api.create_user(p_email TEXT, p_password_hash TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id BIGINT;
BEGIN
  IF p_email IS NULL OR btrim(p_email) = '' THEN
    RAISE EXCEPTION 'email is required';
  END IF;

  IF p_password_hash IS NULL OR btrim(p_password_hash) = '' THEN
    RAISE EXCEPTION 'password_hash is required';
  END IF;

  INSERT INTO public.users(email, password_hash)
  VALUES (lower(btrim(p_email)), p_password_hash)
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'email already exists';
END;
$$;

-- Obtiene hash por email (para login).
CREATE OR REPLACE FUNCTION api.get_user_auth(p_email TEXT)
RETURNS TABLE(user_id BIGINT, email TEXT, password_hash TEXT)
LANGUAGE sql
AS $$
  SELECT
    id AS user_id,
    email::text,
    password_hash::text
  FROM public.users
  WHERE email = lower(btrim(p_email))
  LIMIT 1;
$$;


-- ===== TASKS =====

-- Lista tareas del usuario (opcional filtra por status)
CREATE OR REPLACE FUNCTION api.list_tasks(p_user_id BIGINT, p_status TEXT DEFAULT NULL)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, status TEXT, created_at TIMESTAMP, updated_at TIMESTAMP)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_status IS NULL OR btrim(p_status) = '' THEN
    RETURN QUERY
      SELECT
        t.id,
        t.title::text,
        t.description::text,
        t.status::text,
        t.created_at,
        t.updated_at
      FROM public.tasks t
      WHERE t.user_id = p_user_id
      ORDER BY t.id DESC;
  ELSE
    -- Validación de status a nivel SP también
    IF p_status NOT IN ('pending','in_progress','done') THEN
      RAISE EXCEPTION 'invalid status';
    END IF;

    RETURN QUERY
      SELECT
        t.id,
        t.title::text,
        t.description::text,
        t.status::text,
        t.created_at,
        t.updated_at
      FROM public.tasks t
      WHERE t.user_id = p_user_id AND t.status = p_status
      ORDER BY t.id DESC;
  END IF;
END;
$$;


-- Crea tarea
CREATE OR REPLACE FUNCTION api.create_task(
  p_user_id BIGINT,
  p_title TEXT,
  p_description TEXT,
  p_status TEXT DEFAULT 'pending'
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, status TEXT, created_at TIMESTAMP, updated_at TIMESTAMP)
LANGUAGE plpgsql
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  IF p_title IS NULL OR btrim(p_title) = '' THEN
    RAISE EXCEPTION 'title is required';
  END IF;

  IF p_status NOT IN ('pending','in_progress','done') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;

  INSERT INTO public.tasks(user_id, title, description, status)
  VALUES (p_user_id, btrim(p_title), p_description, p_status)
  RETURNING public.tasks.id INTO v_id;

  RETURN QUERY
    SELECT
      t.id,
      t.title::text,
      t.description::text,
      t.status::text,
      t.created_at,
      t.updated_at
    FROM public.tasks t
    WHERE t.id = v_id;
END;
$$;


-- Actualiza tarea (solo si pertenece al usuario)
CREATE OR REPLACE FUNCTION api.update_task(
  p_user_id BIGINT,
  p_task_id BIGINT,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, status TEXT, created_at TIMESTAMP, updated_at TIMESTAMP)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_status IS NOT NULL AND p_status NOT IN ('pending','in_progress','done') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;

  UPDATE public.tasks t
  SET
    title = COALESCE(NULLIF(btrim(p_title), ''), t.title),
    description = COALESCE(p_description, t.description),
    status = COALESCE(p_status, t.status)
  WHERE t.id = p_task_id AND t.user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'task not found';
  END IF;

  RETURN QUERY
    SELECT
      t.id,
      t.title::text,
      t.description::text,
      t.status::text,
      t.created_at,
      t.updated_at
    FROM public.tasks t
    WHERE t.id = p_task_id;
END;
$$;
