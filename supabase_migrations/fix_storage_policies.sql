-- ==============================================================================
-- CONFIGURACIÓN DE POLÍTICAS DE ALMACENAMIENTO (SUPABASE STORAGE: listing-images)
-- Ejecutar este script en el Editor SQL de Supabase (SQL Editor)
-- ==============================================================================

-- 1. Asegurar que el bucket 'listing-images' exista y sea público
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar políticas antiguas conflictivas en storage.objects
DROP POLICY IF EXISTS "Permitir lectura publica de imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida de imagenes a todos (anon y auth)" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizacion/eliminacion de imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Listing images public select" ON storage.objects;
DROP POLICY IF EXISTS "Listing images public insert" ON storage.objects;

-- 3. Crear política de LECTURA PÚBLICA para imágenes de viviendas
CREATE POLICY "Listing images public select"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- 4. Crear política de SUBIDA PÚBLICA (para usuarios anónimos y registrados)
CREATE POLICY "Listing images public insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images');

-- 5. Crear política de ACTUALIZACIÓN Y ELIMINACIÓN
CREATE POLICY "Listing images public update and delete"
ON storage.objects FOR ALL
USING (bucket_id = 'listing-images')
WITH CHECK (bucket_id = 'listing-images');
