# Guía de Configuración de Ingesta Automatizada Programada (Cron Job)

HabitApp cuenta con una automatización mediante **GitHub Actions** que se ejecuta **2 veces al día (8:00 AM y 6:00 PM hora Colombia)** para rastrear nuevas publicaciones en Armenia de Facebook, Instagram y Web.

---

## 1. Configurar los Secrets en GitHub

Para que la automatización en la nube tenga acceso a tus claves API:

1. Ve a tu repositorio en **GitHub.com**.
2. Entra a **Settings** > **Secrets and variables** > **Actions**.
3. Haz clic en **New repository secret** y crea las siguientes 4 variables:

| Nombre del Secret | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://wctcdwfeibzbrhltcgpr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(Tu anon key de Supabase)* |
| `APIFY_API_TOKEN` | *(Tu Apify API Token)* |
| `GEMINI_API_KEY` | *(Tu Gemini API Key)* |

---

## 2. Horario de Ejecución

* **8:00 AM Colombia** (`13:00 UTC`): Captura los inmuebles publicados durante la noche y temprano en la mañana.
* **6:00 PM Colombia** (`23:00 UTC`): Captura los inmuebles publicados durante la tarde.

---

## 3. Ejecutar Manualmente desde GitHub

Si en cualquier momento quieres forzar una actualización sin esperar la hora programada:
1. Ve a la pestaña **Actions** en tu repositorio de GitHub.
2. Selecciona **Ingesta Automatizada de Viviendas (HabitApp Cron)** a la izquierda.
3. Haz clic en el botón **Run workflow**.
