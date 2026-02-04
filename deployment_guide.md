# Guía de Despliegue en GitHub Pages

Esta guía te permite publicar tu aplicación en internet para que otros usuarios puedan acceder a ella mediante un enlace.

## 1. Preparar el Repositorio en GitHub

1.  Ve a [https://github.com/settings/tokens](https://github.com/settings/tokens).
2.  En el menú de la izquierda, pulsa **"Tokens (classic)"** (NO uses Fine-grained tokens).
3.  Pulsa **"Generate new token"** -> **"Generate new token (classic)"**.
4.  Ponle un nombre (ej: "Macbook Upload").
5.  En **Expiration**, selecciona "No expiration" o 90 días.
6.  **¡IMPORTANTE!** Marca la casilla **`repo`** (Full control of private repositories).
7.  **¡IMPORTANTE TAMBIÉN!** Marca la casilla **`workflow`** (para poder subir el archivo de automatización).
8.  Baja al final y pulsa **"Generate token"**.
8.  **COPIA ESE CÓDIGO LARGO** (empieza por `ghp_...`). Esa es tu nueva "contraseña".
9.  Sube tu código actual:
    *(Abre tu terminal en la carpeta del proyecto y ejecuta)*:
    ```bash
    git remote add origin https://github.com/TU_USUARIO/sistema-gestion-inexo.git
    git add .
    git commit -m "Versión final para despliegue"
    git push -u origin main
    ```

## 2. Configurar Supabase (¡MUY IMPORTANTE!)

Para que el inicio de sesión funcione en la web publicada, debes autorizar la nueva dirección URL.

1.  Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2.  Ve a **Authentication -> URL Configuration**.
3.  En **Site URL**, cambia `http://localhost:5173` por tu nueva dirección de GitHub Pages.
    *   Normalmente será: `https://TU_USUARIO.github.io/sistema-gestion-inexo/`
4.  En **Redirect URLs**, añade también esta misma dirección.
5.  Haz clic en **Save**.

## 3. Activar el Despliegue Automático

Ya he creado un archivo de automatización (`.github/workflows/deploy.yml`) en tu proyecto. Solo necesitas activar los permisos:

1.  En tu repositorio de GitHub, ve a **Settings** (Pestaña superior).
2.  En la barra lateral izquierda, busca **Actions** -> **General**.
3.  Baja hasta **Workflow permissions**.
4.  Selecciona: **Read and write permissions**.
5.  Haz clic en **Save**.

## 4. Verificar el Despliegue

1.  Cada vez que hagas un `git push`, GitHub construirá tu web automáticamente.
2.  Ve a la pestaña **Actions** en GitHub para ver el progreso.
3.  Cuando termine (círculo verde), ve a **Settings** -> **Pages**.
4.  Allí verás el enlace a tu web publicada (`https://...`).

## 5. Invitar Usuarios

Dado que tu aplicación tiene un sistema de **Login**:

1.  Envía el enlace de la web a tus invitados.
2.  Ellos deberán hacer clic en **"Solicitar Acceso"** y registrarse.
3.  Tú recibirás la solicitud (o verás al usuario en la tabla `Users` de Supabase).
4.  Cambia su campo `Aceptado` a `TRUE` en la base de datos para permitirles entrar.
