# Guía de Configuración e Ingesta Automatizada Multi-Fuente (Facebook, Instagram y Web)

HabitApp cuenta con un motor modular de scraping e ingesta automatizada que rastrea viviendas en arriendo en Armenia desde **Facebook Marketplace, Grupos de Facebook, Instagram, Búsquedas Web y Portales Inmobiliarios**, utilizando **Gemini Flash (IA)** para estandarizar la información y publicarla automáticamente con su enlace fuente.

---

## 1. Obtener API Keys Gratuitas

### A. Apify API Key (Para Facebook, Instagram y Scraper Web)
1. Registrate gratis en [apify.com](https://apify.com/).
2. Ve a **Settings** > **Integrations** > **API Tokens**.
3. Copia tu **Personal API token** (empieza por `apify_api_...`).

### B. Gemini API Key (Para estructuración con Inteligencia Artificial)
1. Ve a [aistudio.google.com](https://aistudio.google.com/).
2. Haz clic en **Get API Key** y genera una clave gratuita de **Gemini Flash**.
3. Copia tu clave API (empieza por `AIza...`).

---

## 2. Configurar las Variables de Entorno

Añade las siguientes líneas a tu archivo `habitapp/.env.local`:

```env
# Scraping e IA Multi-Fuente
APIFY_API_TOKEN="apify_api_..."
GEMINI_API_KEY="AIzaSy..."
```

---

## 3. Preparación de Base de Datos en Supabase

Antes de ejecutar la ingesta por primera vez, ejecuta el script SQL contenido en [add_source_columns.sql](file:///e:/Programaci%C3%B3n/arrendamiento/habitapp/supabase_migrations/add_source_columns.sql) en el **SQL Editor** de tu panel de Supabase.

```sql
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS source_platform text DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS source_name text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS source_url text DEFAULT NULL;
```

---

## 4. Cómo Ejecutar la Ingesta Automatizada

Desde la consola dentro de la carpeta `habitapp`, ejecuta:

```bash
npm run import-listings
```

### Opciones y Parámetros del comando:
* `npm run import-listings -- --city=Armenia` (Ciudad destino, por defecto Armenia).
* `npm run import-listings -- --limit=10` (Cantidad máxima de anuncios a procesar por ejecución).
* `npm run import-listings -- --source=facebook` (Filtrar solo por Facebook, Instagram o Web).

---

## 5. Reglas de Funcionamiento
* 🟢 **Estado**: Se crean directamente con `status: 'published'`.
* 🟢 **Teléfonos**: Se permiten teléfonos duplicados (agentes inmobiliarios).
* 🔴 **Direcciones**: Se bloquean direcciones duplicadas en la misma ciudad.
* 🔗 **UI**: En la tarjeta y en la vista de detalle se mostrará un badge con el ícono de la plataforma de origen (Facebook 🟦, Instagram 🟪, Web 🌐) enlazando al anuncio fuente.
* 🧹 **Administración**: Cualquier publicación puede ser ocultada o borrada desde `/admin/listings`.
