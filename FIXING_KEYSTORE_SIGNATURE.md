# Solución: Error de Firma Incorrecta en Android App Bundle

## 🔴 Problema

Tu Android App Bundle está firmado con la clave incorrecta. Google Play Console espera:

**Huella digital esperada (SHA1):**
```
73:88:66:56:97:3D:48:0D:13:5F:71:80:A0:F8:A3:9D:DD:AE:EF:26
```

**Huella digital actual (SHA1):**
```
4A:0B:60:6B:74:25:27:AE:79:0C:BD:B9:9F:41:6E:FC:85:47:03:EA
```

**Información de tu keystore actual:**
- **Alias:** `45b46bedd5292ae0eed067db9800aae3`
- **SHA1:** `4A:0B:60:6B:74:25:27:AE:79:0C:BD:B9:9F:41:6E:FC:85:47:03:EA` ❌ (Incorrecto)
- **Creado:** Oct 11, 2025

---

## 🎯 INICIO RÁPIDO: Dónde Encontrar PEPK

**Para descargar `pepk.jar`:**

1. Ve a: https://play.google.com/console
2. Selecciona tu app: **Capitalia**
3. En el menú lateral izquierdo: **Configuración** → **Firma de apps**
4. Desplázate hacia abajo hasta la sección **"Clave de carga"** o **"Upload key"**
5. Busca el enlace que dice:
   - **"Cambiar clave de carga"** o
   - **"Request upload key reset"** o
   - **"Instrucciones para exportar y subir una clave"**
6. Al hacer clic, verás las instrucciones con un enlace directo para descargar `pepk.jar`
7. El archivo debe ser un JAR válido (~10KB o más)

**Archivos que necesitas:**
- ✅ `encryption_public_key.pem` (ya lo tienes en la raíz del proyecto)
- ❌ `pepk.jar` (descárgalo desde Play Console, NO funciona por curl)
- ✅ `@cr8297408__capitalia.jks` (tu keystore actual)

---

## 📋 Solución: Cambiar Clave de Firma usando PEPK

Como no tienes el keystore original, necesitas usar la opción **"Cambiar clave de firma"** en Google Play Console con la herramienta PEPK.

### **Paso 1: Descargar la Herramienta PEPK y Clave Pública**

⚠️ **IMPORTANTE:** Google cambió la forma de descargar PEPK. Ya NO está disponible directamente por URL.

**Opción 1: Descargar desde Google Play Console (RECOMENDADO)**

1. **Ve a Google Play Console:**
   - Abre tu app en https://play.google.com/console
   - Ve a **Configuración** → **Firma de apps** (en el menú lateral izquierdo)

2. **En la sección "Cambiar clave de carga" o "Upload key":**
   - Busca el botón o enlace "Cambiar clave de firma" o "Request upload key reset"
   - Haz clic en "Descargar PEPK" o verás instrucciones con enlaces para descargar:
     - `pepk.jar` 
     - `encryption_public_key.pem` (archivo que ya tienes ✅)

3. **Descarga ambos archivos:**
   - Guárdalos en la raíz de tu proyecto
   - Ya tienes: `encryption_public_key.pem` ✅
   - Te falta: `pepk.jar`

**Opción 2: Usar la herramienta de línea de comandos alternativa**

Si no encuentras el enlace en Play Console, puedes usar `bundletool` como alternativa:

```bash
# Instalar bundletool (si no lo tienes)
brew install bundletool

# O descargar manualmente
curl -L -o bundletool.jar https://github.com/google/bundletool/releases/latest/download/bundletool-all.jar
```

**Opción 3: Contactar a Google Play Support**

Si ninguna opción funciona, contacta al soporte de Play Console y solicita el archivo `pepk.jar` actualizado.

---

### **Paso 2: Verificar Información de tu Keystore**

Ya sabemos que tu keystore tiene el alias: `45b46bedd5292ae0eed067db9800aae3`

Para confirmar, ejecuta:
```bash
keytool -list -v -keystore @cr8297408__capitalia.jks
```

Anota:
- **Alias:** `45b46bedd5292ae0eed067db9800aae3` ✅
- **Contraseña del keystore:** (la que usas actualmente)

---

### **Paso 3: Generar el Archivo ZIP Encriptado con PEPK**

Ejecuta el comando PEPK con tu información:

```bash
java -jar pepk.jar \
  --keystore=@cr8297408__capitalia.jks \
  --alias=45b46bedd5292ae0eed067db9800aae3 \
  --output=encrypted-private-key.zip \
  --include-cert \
  --rsa-aes-encryption \
  --encryption-key-path=encryption_public_key.pem
```

**Desglose del comando:**
- `--keystore`: Ruta a tu archivo JKS actual
- `--alias`: El alias de tu clave (`45b46bedd5292ae0eed067db9800aae3`)
- `--output`: Nombre del archivo ZIP de salida
- `--include-cert`: Incluye el certificado público
- `--rsa-aes-encryption`: Tipo de encriptación
- `--encryption-key-path`: Ruta a la clave pública de Google

**Cuando ejecutes el comando:**
1. Te pedirá la contraseña del keystore → Ingresa tu contraseña actual
2. Te pedirá la contraseña de la clave (key password) → Ingresa la contraseña (normalmente es la misma)
3. Generará el archivo `encrypted-private-key.zip`


Si el password se olvidó podemos recuperar con eas credentials

---

### **Paso 4: Subir el ZIP a Google Play Console**

1. **Ve a Google Play Console:**
   - Abre tu app
   - Ve a **Configuración** → **Firma de apps**

2. **Busca la opción "Cambiar clave de firma" o "Upload key":**
   - Puede aparecer como botón o enlace
   - También puede estar en la sección de configuración de versión

3. **Sube el archivo ZIP:**
   - Haz clic en "Cambiar clave de firma" o "Request upload key reset"
   - Selecciona el archivo `encrypted-private-key.zip`
   - Sigue las instrucciones en pantalla

4. **Confirma el cambio:**
   - Google procesará el archivo
   - Actualizará la clave de firma en su sistema
   - Te confirmará cuando esté listo

---

### **Paso 5: Actualizar Configuración en EAS (Opcional)**

Si quieres seguir usando este keystore con EAS Build:

1. **Actualiza las credenciales en EAS:**
   ```bash
   # Borra credenciales anteriores
   eas credentials --platform android --clear
   
   # Configura nuevas credenciales
   eas credentials --platform android
   ```

2. **Cuando te lo pida, ingresa:**
   - **Keystore path:** `@cr8297408__capitalia.jks`
   - **Keystore password:** Tu contraseña actual
   - **Key alias:** `45b46bedd5292ae0eed067db9800aae3`
   - **Key password:** Tu contraseña de clave

   - **Key password:** Tu contraseña de clave

---

### **Paso 6: Generar Nuevo Build y Subir a Play Console**

1. **Genera un nuevo build con EAS:**
   ```bash
   eas build --platform android --profile production
   ```

2. **O si prefieres, genera el AAB localmente:**
   ```bash
   # Con Expo
   expo prebuild
   cd android
   ./gradlew bundleRelease
   ```

3. **Sube el nuevo .aab a Play Console:**
   - El AAB estará firmado con el keystore actualizado
   - Google Play ahora lo aceptará porque ya actualizaste la clave de firma

---

## 🔍 Troubleshooting

### Error: "Cannot find Java runtime"
```bash
# Verifica que tienes Java instalado
java -version

# Si no está instalado (macOS):
brew install openjdk@11
```

### Error: "File not found: encryption_public_key.pem"
Asegúrate de descargar la clave pública desde Play Console o usar:
```bash
curl -o encryption_public_key.pem https://www.gstatic.com/play-console/encryption/encryptionkey.pem
```

### Error: "Invalid keystore format"
Si ves el warning sobre JKS, puedes convertirlo a PKCS12 (opcional):
```bash
keytool -importkeystore \
  -srckeystore @cr8297408__capitalia.jks \
  -destkeystore capitalia.p12 \
  -deststoretype PKCS12 \
  -srcalias 45b46bedd5292ae0eed067db9800aae3 \
  -destalias capitalia
```

Luego usa `capitalia.p12` en el comando PEPK.

---

### **Error: Unable to export or encrypt the private key**

Este error ocurre cuando la contraseña del keystore o de la clave (key alias) es incorrecta. Aquí tienes los pasos para solucionarlo:

---

#### **Paso 1: Verificar la Contraseña del Keystore**
1. Asegúrate de estar usando la contraseña correcta para el archivo `@cr8297408__capitalia.jks`.
2. Si no recuerdas la contraseña, intenta buscarla en:
   - Archivos de configuración (`eas.json`, `.env`, `gradle.properties`).
   - Historial de comandos (`history | grep keytool`).
   - Gestores de contraseñas (1Password, Keychain, etc.).

---

#### **Paso 2: Verificar el Alias y la Contraseña de la Clave**
1. Lista los alias disponibles en el keystore:
   ```bash
   keytool -list -v -keystore @cr8297408__capitalia.jks
   ```
2. Verifica que el alias usado (`5f284a1b32ade7aa5cc56924bf657d63`) exista en la lista.
3. Si el alias es correcto, asegúrate de usar la contraseña correcta para la clave.

---

#### **Paso 3: Convertir el Keystore a PKCS12 (Opcional)**
Si sospechas que el formato del keystore está causando problemas, conviértelo a PKCS12:
```bash
keytool -importkeystore \
  -srckeystore @cr8297408__capitalia.jks \
  -destkeystore capitalia.p12 \
  -deststoretype PKCS12 \
  -srcalias 5f284a1b32ade7aa5cc56924bf657d63 \
  -destalias capitalia
```
Luego usa `capitalia.p12` en lugar de `@cr8297408__capitalia.jks`.

---

#### **Paso 4: Solicitar un Reset de la Clave de Carga**
Si no puedes recuperar la contraseña o el alias correcto:
1. Ve a Google Play Console → **Configuración** → **Firma de apps**.
2. Busca la opción **"Cambiar clave de carga"** o **"Request upload key reset"**.
3. Genera un nuevo keystore:
   ```bash
   keytool -genkey -v -keystore new-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
4. Genera el archivo `encrypted-private-key.zip` con el nuevo keystore:
   ```bash
   java -jar pepk.jar \
     --keystore=new-upload-key.jks \
     --alias=upload \
     --output=encrypted-private-key.zip \
     --include-cert \
     --rsa-aes-encryption \
     --encryption-key-path=encryption_public_key.pem
   ```
5. Sube el archivo `encrypted-private-key.zip` a Google Play Console.

---

#### **Paso 5: Verificar el Proceso**
1. Genera un nuevo AAB firmado con el keystore correcto.
2. Sube el AAB a Google Play Console.
3. Verifica que la huella digital coincida con la esperada.

---

## 📝 Checklist Completo

- [ ] Ir a Google Play Console → Tu app → Configuración → Firma de apps
- [ ] Buscar sección "Cambiar clave de firma" o "Upload key"
- [ ] Descargar `pepk.jar` desde el enlace proporcionado en Play Console
- [ ] Descargar `encryption_public_key.pem` (o ya lo tienes ✅)
- [ ] Verificar alias del keystore: `45b46bedd5292ae0eed067db9800aae3`
- [ ] Ejecutar comando PEPK con el alias correcto
- [ ] Generar archivo `encrypted-private-key.zip`
- [ ] Subir ZIP a Play Console en "Cambiar clave de firma"
- [ ] Esperar confirmación de Google Play
- [ ] Actualizar credenciales en EAS (opcional)
- [ ] Generar nuevo build
- [ ] Subir AAB a Play Console
- [ ] Verificar que no haya errores de firma

---

## 🎯 Resumen del Comando PEPK para tu Caso

**Comando exacto que debes ejecutar:**

```bash
java -jar pepk.jar \
  --keystore=@cr8297408__capitalia.jks \
  --alias=45b46bedd5292ae0eed067db9800aae3 \
  --output=encrypted-private-key.zip \
  --include-cert \
  --rsa-aes-encryption \
  --encryption-key-path=encryption_public_key.pem
```

**Tu información:**
- **Keystore:** `@cr8297408__capitalia.jks`
- **Alias:** `45b46bedd5292ae0eed067db9800aae3`
- **SHA1 actual:** `4A:0B:60:6B:74:25:27:AE:79:0C:BD:B9:9F:41:6E:FC:85:47:03:EA`

---

## ⚠️ Notas Importantes

1. **Este proceso es irreversible** - Una vez que cambies la clave de firma, no podrás volver atrás
2. **Usuarios existentes NO se verán afectados** - Google maneja la firma final con App Signing
3. **Guarda tu keystore actual** - Lo necesitarás para futuras actualizaciones
4. **El alias es largo** - Asegúrate de copiarlo exactamente: `45b46bedd5292ae0eed067db9800aae3`

---

## 📚 Referencias

- [PEPK Tool Documentation](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Google Play App Signing](https://developer.android.com/studio/publish/app-signing)
- [EAS Build Credentials](https://docs.expo.dev/app-signing/app-credentials/)

---

## 🆘 ¿Necesitas Más Ayuda?

Si encuentras problemas:

1. Verifica que el archivo `pepk.jar` se descargó correctamente
2. Confirma que tienes Java instalado (`java -version`)
3. Asegúrate de usar el alias exacto del keystore
4. Verifica que la clave pública de Google sea la correcta
5. Revisa los logs de error si PEPK falla

---

## 🔐 Después de Solucionar

Una vez que subas exitosamente el nuevo AAB:

1. **Respalda tu keystore:**
   ```bash
   cp @cr8297408__capitalia.jks ~/Documents/backups/capitalia-backup-$(date +%Y%m%d).jks
   ```

2. **Documenta las credenciales en un lugar seguro:**
   - Nombre del keystore
   - Alias: `45b46bedd5292ae0eed067db9800aae3`
   - Contraseñas
   - SHA1: `4A:0B:60:6B:74:25:27:AE:79:0C:BD:B9:9F:41:6E:FC:85:47:03:EA`

3. **Agrega al .gitignore:**
   ```bash
   echo "*.jks" >> .gitignore
   echo "*.p12" >> .gitignore
   echo "pepk.jar" >> .gitignore
   echo "encryption_public_key.pem" >> .gitignore
   echo "encrypted-private-key.zip" >> .gitignore
   ```
