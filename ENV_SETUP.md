# 🔐 Gestión de Variables de Entorno en Capitalia

## 📋 Archivos de Entorno

Este proyecto usa diferentes archivos de entorno según el contexto:

- `.env` - Desarrollo local (usado con `npm start`)
- `.env.preview` - Builds de preview/testing
- `.env.production` - Builds de producción

## 🚀 Configuración para EAS Build

### Opción 1: Usar EAS Secrets (Recomendado)

Las variables de entorno se gestionan mediante EAS Secrets para mayor seguridad.

#### Configurar secrets para Preview:
```bash
./setup-eas-secrets.sh preview
```

#### Configurar secrets para Production:
```bash
./setup-eas-secrets.sh production
```

#### Ver secrets configurados:
```bash
npx eas secret:list
```

#### Eliminar un secret:
```bash
npx eas secret:delete --name NOMBRE_VARIABLE
```

### Opción 2: Variables en eas.json

Las variables también pueden definirse directamente en `eas.json`:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_VARIABLE": "valor"
      }
    }
  }
}
```

## 📱 Acceder a Variables en la App

Las variables se acceden de dos formas:

### 1. Usando process.env (Tiempo de compilación):
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
```

### 2. Usando Constants de Expo (Tiempo de ejecución):
```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const environment = Constants.expoConfig?.extra?.environment;
```

## 🔑 Variables Disponibles

### Supabase
- `EXPO_PUBLIC_SUPABASE_URL` - URL del proyecto Supabase
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase

### Stripe
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Clave pública de Stripe

### App
- `EXPO_PUBLIC_APP_NAME` - Nombre de la app
- `EXPO_PUBLIC_APP_VERSION` - Versión de la app
- `EXPO_PUBLIC_ENVIRONMENT` - Entorno (development/preview/production)

## 🛠️ Comandos de Build

### Build de Preview:
```bash
npx eas build --platform android --profile preview
```

### Build de Producción:
```bash
npx eas build --platform android --profile production
```

### Build local (para testing):
```bash
npx eas build --platform android --profile preview --local
```

## ⚠️ Importante

1. **Nunca** subas archivos `.env*` al repositorio (ya están en `.gitignore`)
2. **Usa EAS Secrets** para variables sensibles en builds de producción
3. **Actualiza** las claves de Stripe a producción cuando vayas a lanzar
4. **Verifica** que todas las variables estén configuradas antes de hacer el build

## 📚 Recursos

- [Documentación de EAS Build](https://docs.expo.dev/build/introduction/)
- [Environment Variables en EAS](https://docs.expo.dev/build-reference/variables/)
- [EAS Secrets](https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables)
