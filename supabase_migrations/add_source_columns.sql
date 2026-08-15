-- Migration: Agregar columnas para rastreo de fuente original de publicaciones
-- Ejecutar este script en el Editor SQL de Supabase (SQL Editor)

ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS source_platform text DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS source_name text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS source_url text DEFAULT NULL;

-- Comentarios explicativos
COMMENT ON COLUMN public.listings.source_platform IS 'Origen de la publicación (facebook, instagram, web, direct, etc.)';
COMMENT ON COLUMN public.listings.source_name IS 'Nombre legible de la plataforma fuente (ej. Facebook Marketplace, Instagram, FincaRaíz)';
COMMENT ON COLUMN public.listings.source_url IS 'Enlace completo a la publicación original en la red social o sitio web';
