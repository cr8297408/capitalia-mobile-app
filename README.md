# 💰 Finance Tracker - Personal Finance Management App

Una aplicación móvil moderna de finanzas personales construida con **Expo + React Navigation + Stripe**, siguiendo el **Scope Rule Pattern** para una arquitectura limpia y escalable.

## 🏛️ Arquitectura

### Scope Rule Pattern (Inviolable)
- **Código usado por 2+ features** → `shared/`
- **Código usado por 1 feature** → Local en esa feature
- **Sin excepciones** - Esta regla es fundamental

### Estructura de Directorios
```
src/
├── navigation/           # Sistema de navegación centralizado
├── features/            # Funcionalidades principales
│   ├── authentication/
│   ├── budget-management/
│   ├── transaction-tracking/
│   ├── subscription-management/  # 🔥 Gestión de suscripciones Stripe
│   ├── account-management/
│   ├── goal-tracking/
│   └── more/
├── shared/              # Componentes multi-feature
│   ├── components/ui/   # PremiumBadge, UpgradePrompt
│   ├── hooks/          # useAuth, usePremiumFeatures
│   └── utils/
└── infrastructure/      # Servicios transversales
    ├── supabase/
    └── stripe/         # 🔒 Configuración segura de Stripe
```

## 🚀 Características Principales

### 💳 Sistema de Suscripciones Premium (Stripe)
- ✅ **Procesamiento seguro** - Pagos procesados en Edge Functions
- ✅ **Múltiples planes** - Free, Premium Monthly, Premium Yearly
- ✅ **Portal de facturación** - Gestión completa de suscripciones
- ✅ **Límites diferenciados** - Free vs Premium features
- ✅ **Webhooks seguros** - Sincronización automática de estado

### 📱 Funcionalidades Core
- 🔐 **Autenticación completa** con Supabase Auth
- 💰 **Gestión de presupuestos** por categorías
- 📊 **Seguimiento de transacciones** con categorización
- 🏦 **Múltiples cuentas** bancarias y transferencias
- 🎯 **Objetivos financieros** con tracking de progreso
- 📈 **Dashboard analítico** con métricas en tiempo real
- 🔔 **Notificaciones inteligentes** de límites y alertas

### 🎨 Diseño Premium
- **Minimalista y moderno** inspirado en apps financieras líderes
- **Sistema de colores consistente** con primary blue (#2563EB)
- **Componentes Shadcn UI** adaptados para React Native
- **Navegación intuitiva** con tabs y stack navigation
- **Animaciones suaves** con react-native-reanimated

## 🛠️ Stack Tecnológico

### Frontend
- **Expo SDK** (Latest) + React Native + TypeScript
- **React Navigation v6** (Stack, Tab, Modal navigation)
- **Lucide React Native** para iconografía
- **React Native Reanimated** para animaciones

### Backend & Database
- **Supabase** (PostgreSQL, Auth, Storage, Realtime)
- **Row Level Security (RLS)** configurado
- **Edge Functions** para procesamiento seguro de Stripe

### Pagos & Suscripciones
- **Stripe** para pagos y suscripciones
- **@stripe/stripe-react-native** para integración móvil
- **Procesamiento seguro** en Edge Functions (nunca en cliente)

## 🔧 Configuración de Desarrollo

### 1. Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de Supabase y Stripe
```

### 2. Base de Datos (Supabase)
```bash
# Inicializar Supabase localmente
supabase init

# Aplicar migraciones
supabase db reset

# Generar tipos TypeScript
supabase gen types typescript --local > src/types/supabase.ts
```

### 3. Stripe Configuration
```bash
# En Supabase Dashboard, configurar Edge Functions con:
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# APP_URL=yourapp://
```

### 4. Ejecutar la App
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build:web
```

## 🔒 Seguridad Stripe (CRÍTICO)

### ✅ Implementación Correcta
- **Edge Functions** procesan todos los pagos
- **Claves públicas** únicamente en el cliente
- **Webhooks firmados** para validación
- **RLS habilitado** en todas las tablas sensibles

### ❌ NUNCA Hacer
```typescript
// ❌ NUNCA procesar pagos en el cliente
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
}); // ¡PELIGROSO!
```

### ✅ Implementación Segura
```typescript
// ✅ Llamar a Edge Function
const { data } = await supabase.functions.invoke('create-checkout-session', {
  body: { priceId, userId }
});
```

## 📋 Migraciones de Base de Datos

Las migraciones están organizadas secuencialmente:

1. `001_initial_auth.sql` - Setup inicial de autenticación
2. `002_accounts_table.sql` - Tabla de cuentas bancarias
3. `003_transactions_table.sql` - Tabla de transacciones
4. `004_budgets_table.sql` - Tabla de presupuestos
5. `005_categories_table.sql` - Categorías de transacciones
6. `006_goals_table.sql` - Objetivos financieros
7. `007_rls_policies.sql` - Políticas de seguridad
8. `008_realtime_setup.sql` - Configuración realtime
9. `009_stripe_customers.sql` - 🔥 Integración Stripe
10. `010_subscriptions.sql` - 🔥 Gestión de suscripciones
11. `011_subscription_plans.sql` - 🔥 Planes de suscripción
12. `012_webhooks_log.sql` - 🔥 Tracking de webhooks
13. `013_indexes_performance.sql` - Índices para performance

## 🎯 Funcionalidades Premium

### Plan Free
- ✅ Hasta 100 transacciones/mes
- ✅ Hasta 3 cuentas bancarias
- ✅ Hasta 5 presupuestos
- ❌ Sin exportación de datos
- ❌ Sin analíticas avanzadas

### Plan Premium
- ✅ **Transacciones ilimitadas**
- ✅ **Cuentas ilimitadas**
- ✅ **Presupuestos ilimitados**
- ✅ **Exportación de datos**
- ✅ **Analíticas avanzadas**
- ✅ **Transacciones recurrentes**
- ✅ **Adjuntar recibos**
- ✅ **Categorías personalizadas**

## 🚀 Deployment

### Supabase Edge Functions
```bash
# Deploy Edge Functions
supabase functions deploy stripe-webhooks
supabase functions deploy create-checkout-session
supabase functions deploy create-customer-portal
```

### Expo Build
```bash
# Build para App Stores
eas build --platform all

# Preview build
eas build --platform all --profile preview
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests de integración Stripe (usar claves de prueba)
npm run test:stripe
```

## 📱 Deep Linking

La app soporta deep linking para:
- Retorno de Stripe checkout: `finance-app://subscription/success`
- Navegación directa: `finance-app://transactions/123`
- Autenticación: `finance-app://auth/reset-password`

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### Reglas de Contribución
- ✅ **Seguir Scope Rule Pattern** sin excepciones
- ✅ **Crear migración** antes de modificar esquema DB
- ✅ **Nunca procesar pagos** en el cliente
- ✅ **Mantener RLS** en todas las tablas sensibles

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- 📧 Email: support@financetracker.com
- 💬 Discord: [Finance Tracker Community](https://discord.gg/financetracker)
- 📖 Docs: [docs.financetracker.com](https://docs.financetracker.com)

---

**Construido con ❤️ usando Expo + React Navigation + Stripe**

*Siguiendo el Scope Rule Pattern para una arquitectura limpia e inviolable* 🏛️