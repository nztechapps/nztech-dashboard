-- Agregar columnas de checklists a la tabla ideas

-- Checklist de calidad (6 items)
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS checklist_calidad jsonb DEFAULT '{}';

-- Checklist de publicación (10 items)
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS checklist_publicacion jsonb DEFAULT '{}';

-- Screenshots array
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS screenshots jsonb DEFAULT '[]';

-- Feature graphic spec (para almacenar el resultado de la generación con Claude)
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS feature_graphic_spec jsonb DEFAULT NULL;

-- Notas:
-- Ejecuta estas queries en la consola SQL de Supabase (Project > SQL Editor > New Query)
-- Después de ejecutarlas, los tabs de Calidad, Publicación y Screenshots estarán disponibles
