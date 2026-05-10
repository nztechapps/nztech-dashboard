create table if not exists app_postmortems (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade unique,
  dificultad text,
  exito text,
  diferente text,
  tiempos jsonb,
  puntaje integer check (puntaje between 1 and 10),
  insight_claude text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
