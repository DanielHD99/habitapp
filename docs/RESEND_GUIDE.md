# Guía de Configuración de Resend (Servidor de Correos)

Cuando la aplicación comience a recibir más tráfico, necesitarás quitar el límite de 3 correos por hora de Supabase. La mejor y más barata alternativa (hasta 3.000 correos gratis al mes) es **Resend**.

Sigue estos pasos para configurarlo:

## 1. Crear la cuenta en Resend
1. Ve a [resend.com](https://resend.com/) y crea una cuenta gratuita.
2. Una vez dentro, ve al menú **API Keys**.
3. Haz clic en **Create API Key**. Ponle un nombre (ej: "HabitApp Supabase") y dale el permiso de "Sending access".
4. **Copia la clave secreta** que empieza por `re_...` (guárdala bien, solo se muestra una vez).

## 2. Verificar tu dominio (Opcional pero recomendado)
Si ya tienes un dominio propio (ej: `habitapp.com`):
1. En Resend, ve a **Domains** > **Add Domain**.
2. Escribe tu dominio y elige tu proveedor de DNS.
3. Resend te dará unos registros TXT y MX. Debes ir a tu proveedor de dominio (Godaddy, Hostinger, Vercel) y copiarlos en los ajustes de DNS.
4. Espera a que se verifiquen. Si no tienes dominio, puedes usar el dominio de pruebas de Resend, pero solo podrás enviar correos a tu propia dirección de email de prueba.

## 3. Conectar Resend a Supabase
1. Ve a tu panel de **Supabase**.
2. Entra en **Project Settings** (el ícono del engranaje abajo a la izquierda).
3. Ve a la sección **Authentication** > **SMTP**.
4. Enciende el interruptor **Enable Custom SMTP**.
5. Llena los datos con la información de Resend:
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (Prueba con el puerto 465 que es el seguro por SSL)
   - **User:** `resend` (Literalmente escribe la palabra "resend")
   - **Password:** Pega aquí tu API Key de Resend (la que copiaste en el paso 1 que empieza por `re_...`)
   - **Sender Email:** Si verificaste tu dominio, pon `info@tudominio.com`. Si no, pon el correo por defecto de Resend (`onboarding@resend.dev`).
   - **Sender Name:** `HabitApp`
6. Haz clic en **Save** en Supabase.

## 4. Volver a activar las confirmaciones
Una vez guardado:
1. En Supabase, ve a **Authentication** > **Providers** > **Email**.
2. Vuelve a encender el interruptor de **Confirm email**.
3. Haz clic en **Save**.

¡Listo! A partir de ese momento, todos los correos de confirmación, recuperación de contraseña y bienvenida saldrán desde el servidor de Resend sin los límites del plan gratuito de Supabase.
