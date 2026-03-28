# Guía para subir Capitalia a Google Play Console (Pruebas Cerradas)

Esta guía detalla los pasos para generar el archivo de aplicación (`.aab`) y subirlo a Google Play Console para una versión de **Prueba cerrada**.

## 1. Requisitos Previos

*   **Cuenta de Desarrollador de Google Play**: Debes tener acceso a [Google Play Console](https://play.google.com/console).
*   **EAS CLI instalado**: Asegúrate de tener las herramientas de Expo Application Services:
    ```bash
    npm install -g eas-cli
    ```
*   **Login en Expo**: Debes estar logueado en tu cuenta de Expo:
    ```bash
    eas login
    ```

## 2. Configuración del Proyecto

Verifica que en tu archivo `app.json` los siguientes campos sean correctos:
*   `android.package`: `com.cr8297408.capitaliaapp`
*   `version`: La versión visible para el usuario (ej. `2.1.0`).
*   `android.versionCode`: (EAS lo incrementará automáticamente gracias a `autoIncrement: true` en `eas.json`).

## 3. Generar el archivo de producción (.aab)

Para generar el archivo que Google Play requiere, ejecuta el siguiente comando:

```bash
eas build --platform android --profile production
```

### ¿Qué hace este comando?
1.  Sube tu código a los servidores de Expo para compilarlo.
2.  Si es la primera vez, EAS te pedirá generar un **Keystore** (la llave de firma). Elige "Generar uno nuevo" y deja que EAS lo gestione por ti.
3.  Al finalizar (puede tardar 10-15 min), te dará un enlace para descargar el archivo `.aab`.

## 4. Subir a Google Play Console

1.  Entra a [Google Play Console](https://play.google.com/console) y selecciona tu aplicación **capitaliaapp**.
2.  En el menú de la izquierda, ve a **Pruebas** > **Prueba cerrada**.
3.  Selecciona una de las pistas (usualmente "Alpha") o crea una nueva.
4.  Haz clic en **Crear nueva versión** (botón arriba a la derecha).
5.  **Subir App Bundle**: Sube el archivo `.aab` que descargaste de Expo.
6.  **Nombre de la versión**: Se autocompletará con el número de versión (ej. 2.1.0).
7.  **Notas de la versión**: Escribe qué cambios incluye esta versión:
    ```text
    - Sincronización con Wompi para suscripciones.
    - Nuevos insights financieros generados por IA.
    - Mejoras en la navegación y carga de transacciones.
    ```
8.  Haz clic en **Siguiente** (o Guardar) en la esquina inferior derecha.

## 5. Configurar los Probadores (Testers)

Para que alguien pueda descargar la app, debes añadir su correo:
1.  Dentro de la **Prueba cerrada**, ve a la pestaña **Probadores**.
2.  Crea o selecciona una **Lista de correos**.
3.  Añade los correos de las personas que probarán la app.
4.  **Copia el enlace de invitación** (al final de la página) y envíaselo a los probadores. Ellos deben aceptar la invitación desde su teléfono Android.

## 6. Revisión y Publicación

1.  Una vez subido el archivo y configurados los testers, ve a la pestaña **Revisión de la versión**.
2.  Haz clic en **Iniciar lanzamiento en prueba cerrada**.
3.  ¡Listo! Google tardará unas horas (a veces un par de días en la primera versión) en procesar la app. Una vez aprobada, tus testers recibirán una notificación para descargarla desde la Play Store.

---

> [!TIP]
> Si quieres probar la app internamente antes de pasar por la revisión de Google, puedes usar `eas build --platform android --profile preview` para generar un APK que puedes instalar directamente en tu teléfono.
