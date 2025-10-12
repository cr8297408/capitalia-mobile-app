#!/bin/bash

# Script para configurar variables de entorno en EAS
# Lee desde .env.preview o .env.production y las sube como environment variables

PROFILE=$1

if [ -z "$PROFILE" ]; then
  echo "❌ Error: Debes especificar un perfil (preview o production)"
  echo "Uso: ./setup-eas-secrets.sh [preview|production]"
  exit 1
fi

if [ "$PROFILE" != "preview" ] && [ "$PROFILE" != "production" ]; then
  echo "❌ Error: Perfil inválido. Usa 'preview' o 'production'"
  exit 1
fi

ENV_FILE=".env.$PROFILE"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: Archivo $ENV_FILE no encontrado"
  exit 1
fi

echo "🔐 Configurando variables de entorno de EAS para perfil: $PROFILE"
echo "📄 Leyendo desde: $ENV_FILE"
echo ""

# Leer el archivo .env y crear environment variables
while IFS='=' read -r key value; do
  # Ignorar comentarios y líneas vacías
  if [[ $key =~ ^#.*$ ]] || [ -z "$key" ]; then
    continue
  fi
  
  # Remover comillas del valor
  value=$(echo $value | sed 's/^"//;s/"$//')
  
  # Solo procesar variables que empiezan con EXPO_PUBLIC_
  if [[ $key =~ ^EXPO_PUBLIC_.*$ ]]; then
    echo "⬆️  Configurando: $key"
    npx eas env:create --name "$key" --value "$value" --environment "$PROFILE" --visibility plaintext --non-interactive || true
  fi
done < "$ENV_FILE"

echo ""
echo "✅ Variables de entorno configuradas para perfil: $PROFILE"
echo ""
echo "📋 Para ver las variables configuradas:"
echo "   npx eas env:list --environment $PROFILE"
echo ""
echo "🚀 Para hacer el build:"
echo "   npx eas build --platform android --profile $PROFILE"
