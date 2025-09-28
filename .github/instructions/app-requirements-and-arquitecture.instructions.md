---
applyTo: '**'
---
Prompt Unificado: Aplicación Móvil de Finanzas Personales con Expo + React Navigation + Stripe
🏛️ INSTRUCCIONES DE ARQUITECTURA - SCOPE RULE PATTERN CON STRIPE

COMO ARQUITECTO ELITE, DEBES SEGUIR ESTAS REGLAS INVIOLABLES:
1. LA LEY DEL SCOPE RULE - NO NEGOCIABLE
text

"El scope determina la estructura"

✅ Código usado por 2+ features → OBLIGATORIO en shared/
✅ Código usado por 1 feature → OBLIGATORIO local en esa feature
❌ NO EXCEPCIONES - Esta regla es INVIOLABLE

2. SCREAMING ARCHITECTURE OBLIGATORIA

    Cada directorio debe GRITAR su propósito de negocio

    Los nombres técnicos (components, utils, hooks) van DENTRO de features

    Los nombres de features deben ser funcionalidades de negocio, no técnicas

    Un desarrollador nuevo debe entender QUÉ HACE la app solo viendo la estructura

3. STRIPE SECURITY - REGLAS CRÍTICAS

PRINCIPIO FUNDAMENTAL: NUNCA PROCESAR PAGOS EN EL CLIENTE
typescript

// ❌ NUNCA HACER ESTO EN REACT NATIVE
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
}); // ¡NUNCA EN EL CLIENTE!

// ✅ SIEMPRE EN EDGE FUNCTIONS
// El cliente SOLO puede crear checkout sessions o setup intents

🎯 Objetivo del Proyecto

Crear una aplicación móvil de finanzas personales moderna, minimalista y offline-first con sistema de suscripciones premium usando Stripe, que permita a los usuarios gestionar completamente sus finanzas con analíticas en tiempo real y diseño centrado en UX.
🏗️ Stack Tecnológico Principal

Frontend Mobile:

    Expo SDK (Latest) + React Native + TypeScript

    React Navigation v6 para navegación (stack, tab, drawer)

    Shadcn UI for React Native (componentes adaptados con Tailwind)

Backend & Database:

    Supabase (PostgreSQL, Auth, Storage, Realtime)

    Row Level Security (RLS) configurado

    Stripe para pagos y suscripciones

Almacenamiento Local:

    Expo SecureStore (storage seguro principal)

    React Native MMKV (storage offline avanzado)

    SQLite local para transacciones offline (expo-sqlite)

Herramientas de Desarrollo:

    Expo Dev Tools + EAS Build

    Vitest para testing

    ESLint + Prettier + Husky

    TypeScript estricto

    Expo Development Build para debugging

📱 Características Funcionales Principales
🔐 Autenticación & Seguridad

    Login/Register con Supabase Auth + Expo AuthSession

    Biometría (Touch/Face ID) con expo-local-authentication

    PIN de acceso rápido con Expo SecureStore

    Sesiones persistentes seguras

    Cifrado local de datos sensibles con Expo SecureStore

💰 Gestión de Presupuestos

    Creación de presupuestos por categorías

    Límites mensuales/semanales personalizables

    Alertas de sobre-gasto con expo-notifications

    Presupuestos recurrentes automáticos

    Comparación presupuesto vs gasto real

📊 Seguimiento de Transacciones

    Agregar transacciones manuales (ingresos/gastos)

    Categorización inteligente automática

    Transacciones recurrentes (suscripciones, salarios)

    Adjuntar fotos de recibos con expo-image-picker + expo-media-library

    Búsqueda y filtros avanzados

    Importación de archivos CSV/Excel con expo-document-picker

🏦 Gestión de Cuentas

    Múltiples cuentas (efectivo, bancos, tarjetas)

    Transferencias entre cuentas

    Balances en tiempo real

    Histórico de movimientos

    Sincronización de saldos

📈 Analíticas en Tiempo Real

    Dashboard principal con métricas clave

    Gráficos interactivos con react-native-chart-kit

    Reportes mensuales/anuales automáticos

    Proyecciones de gastos/ahorros

    Análisis de patrones de gasto

    Net worth tracking

🎯 Objetivos Financieros

    Creación de metas de ahorro

    Tracking automático de progreso

    Notificaciones de hitos alcanzados con expo-notifications

    Metas con fechas límite

    Sugerencias para alcanzar objetivos

💳 Sistema de Suscripciones Premium (Stripe)

    Múltiples planes de suscripción

    Checkout seguro con Stripe

    Portal de gestión de facturación

    Límites diferenciados entre free y premium

    Funcionalidades exclusivas para usuarios premium

    Notificaciones de renovación y vencimiento

🔔 Notificaciones Inteligentes

    Recordatorios de pagos pendientes con expo-notifications

    Alertas de límites de presupuesto

    Notificaciones de transacciones inusuales

    Recordatorios de metas de ahorro

    Resúmenes semanales/mensuales

📱 Funcionalidades Offline-First

    Todas las operaciones funcionan sin internet

    Sincronización automática al reconectar con expo-network

    Indicadores visuales de estado de sync

    Cola de transacciones pendientes

    Backup local automático con expo-file-system

🗄️ ESTRUCTURA BASE DE DATOS Y MIGRACIONES OBLIGATORIAS
CARPETA SUPABASE/ EN ROOT DEL PROYECTO - CRÍTICO
text

ROOT/
  supabase/                    # ⚠️ OBLIGATORIO EN ROOT, NO EN SRC/
    migrations/                # Historial completo de cambios DB
      001_initial_auth.sql     # Setup inicial auth
      002_accounts_table.sql   # Tabla de cuentas
      003_transactions_table.sql # Tabla de transacciones  
      004_budgets_table.sql    # Tabla de presupuestos
      005_categories_table.sql # Tabla de categorías
      006_goals_table.sql      # Tabla de metas financieras
      007_rls_policies.sql     # Row Level Security
      008_realtime_setup.sql   # Configuración realtime
      009_stripe_customers.sql   # ✅ Integración Stripe
      010_subscriptions.sql      # ✅ Gestión de suscripciones
      011_subscription_plans.sql # ✅ Planes de suscripción
      012_webhooks_log.sql       # ✅ Tracking de webhooks
      013_indexes_performance.sql # Índices para performance
    
    functions/               # Edge Functions (OBLIGATORIO PARA STRIPE)
      stripe-webhooks/       # ✅ Receptor de webhooks de Stripe
        index.ts
        handlers/           # Manejadores específicos por evento
      create-checkout-session/ # ✅ Crear sesiones de checkout
      create-customer-portal/ # ✅ Generar portal de cliente
      get-subscription-status/ # ✅ Obtener estado de suscripción
      cancel-subscription/    # ✅ Cancelar suscripción
    
    config.toml              # Configuración local Supabase
    seed.sql                 # Datos iniciales (categorías por defecto + planes)

🚨 REGLA CRÍTICA DE MIGRACIONES STRIPE
sql

-- ✅ SIEMPRE: Tablas Stripe con RLS habilitado
-- 009_stripe_customers.sql
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own stripe customer data" 
  ON stripe_customers FOR ALL 
  USING (auth.uid() = user_id);

-- 010_subscriptions.sql
CREATE TYPE subscription_status AS ENUM (
  'active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'paused'
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  status subscription_status NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  premium_features_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own subscriptions" 
  ON subscriptions FOR ALL 
  USING (auth.uid() = user_id);

-- 011_subscription_plans.sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(20) DEFAULT 'month',
  features JSONB NOT NULL DEFAULT '[]',
  max_transactions INTEGER DEFAULT NULL,
  max_accounts INTEGER DEFAULT NULL,
  max_budgets INTEGER DEFAULT NULL,
  can_export_data BOOLEAN DEFAULT FALSE,
  can_use_advanced_analytics BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- No RLS needed for plans (public data)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are viewable by everyone" 
  ON subscription_plans FOR SELECT 
  USING (is_active = TRUE);

WORKFLOW DE MIGRACIONES OBLIGATORIO:
bash

# 1. Crear nueva migración (SIEMPRE antes de código)
supabase migration new create_stripe_tables

# 2. Escribir SQL en el archivo generado
# 3. Aplicar localmente para testing
supabase db reset

# 4. Solo entonces crear los types TypeScript
supabase gen types typescript --local > src/types/supabase.ts

# 5. DESPUÉS escribir el código que usa las tablas

🏛️ Arquitectura Scope Rule + React Navigation + Stripe
ESTRUCTURA DE DIRECTORIOS UNIFICADA:
text

ROOT/
  supabase/                    # ⚠️ OBLIGATORIO EN ROOT - Database & Stripe
    migrations/               # Todas las migraciones
    functions/               # Edge Functions para Stripe
    
  src/
    navigation/               # Sistema de navegación centralizado
      types.ts                # Tipos de navegación compartidos
      AppNavigator.tsx        # Navegador principal
      AuthNavigator.tsx       # Stack de autenticación
      MainTabNavigator.tsx    # Tab navigator principal
      linking.ts             # Deep linking configuration
      
    features/                 # Funcionalidades principales
      authentication/
        authentication.tsx    # Container principal
        screens/             # Screens específicas de auth
          LoginScreen.tsx    # Solo UI + navigation props
          RegisterScreen.tsx # Solo UI + navigation props
        components/         # Componentes específicos de auth
        hooks/             # useAuth, useBiometrics
        services/          # authService, sessionManager
        models.ts         # AuthUser, SessionState
      
      budget-management/
        budget-management.tsx # Container principal  
        screens/            # Screens específicas de budget
          BudgetsScreen.tsx # Lista de presupuestos
          BudgetDetailScreen.tsx # Detalle de presupuesto
          AddBudgetScreen.tsx # Crear presupuesto
        components/        # BudgetCard, CategorySelector
        hooks/            # useBudgets, useBudgetAlerts
        services/         # budgetService, alertService
        models.ts        # Budget, BudgetAlert
      
      transaction-tracking/
        transaction-tracking.tsx # Container principal
        screens/               # Screens específicas
          TransactionsScreen.tsx # Lista de transacciones
          AddTransactionScreen.tsx # Agregar transacción
          TransactionDetailScreen.tsx # Detalle
        components/           # TransactionForm, TransactionList
        hooks/              # useTransactions, useCategories
        services/          # transactionService, categoryService
        models.ts         # Transaction, Category
      
      subscription-management/   # ✅ NUEVA FEATURE: Gestión de suscripciones
        subscription-management.tsx # Container principal
        screens/
          SubscriptionPlansScreen.tsx # Selección de planes
          BillingScreen.tsx    # Gestión de facturación
          PaymentPendingScreen.tsx # Procesamiento de pago
          SubscriptionSuccessScreen.tsx # Confirmación
        components/
          PlanCard.tsx         # Tarjeta de plan individual
          PricingTable.tsx     # Comparación de planes
          PaymentMethodCard.tsx # Info de método de pago
          SubscriptionStatus.tsx # Estado de suscripción
        hooks/
          useSubscription.ts   # Hook principal de suscripción
          useStripeCheckout.ts # Manejo de checkout
          useBilling.ts       # Historial de facturación
        services/
          subscriptionService.ts # Llamadas a edge functions
          stripeService.ts    # Configuración cliente Stripe
        models.ts            # Tipos de suscripción
      
      # ... otras features (analytics, accounts, goals)

    shared/                    # Componentes multi-feature
      components/
        ui/                   # Shadcn UI components
          PremiumBadge.tsx    # ✅ Usado en múltiples features
          UpgradePrompt.tsx   # ✅ Usado en múltiples features
        forms/               # FormField, ValidationError
        charts/             # ChartBase, ChartLegend
      
      hooks/
        useAuth.ts           # ✅ Autenticación + estado de suscripción
        usePremiumFeatures.ts # ✅ Límites premium (multi-feature)
        useOfflineSync.ts    # Sincronización offline
        useNotifications.ts  # Sistema de notificaciones
        useLocalStorage.ts   # Abstracción de storage
        useNavigation.ts     # Hook navegación tipado
      
      utils/
        formatters.ts       # Formateo de moneda, fechas
        validators.ts       # Validaciones de formularios
        calculations.ts     # Cálculos financieros
        subscriptionHelpers.ts # ✅ Utilidades de validación premium
        constants.ts       # Constantes globales

    infrastructure/           # Servicios transversales
      supabase/
        client.ts          # Cliente Supabase configurado
        auth.ts           # Configuración de autenticación
        database.ts       # Queries y subscriptions
        realtime.ts      # Configuración realtime
      
      stripe/               # ✅ Configuración Stripe
        stripe-client.ts  # Cliente Stripe (SOLO LLAVE PÚBLICA)
        config.ts        # Configuración Stripe
      
      storage/
        mmkv.ts          # Configuración MMKV
        sqlite.ts        # Base de datos local
        syncManager.ts   # Gestor de sincronización
      
      notifications/
        pushManager.ts   # Notificaciones push
        localManager.ts  # Notificaciones locales
      
      analytics/
        tracker.ts       # Tracking de eventos
        reports.ts       # Generación de reportes
  
  App.tsx                    # Entry point con NavigationContainer
  index.js                   # Expo entry point
  
  assets/                    # Recursos estáticos Expo
    icon.png
    splash.png
    adaptive-icon.png

CONFIGURACIÓN REACT NAVIGATION OBLIGATORIA CON STRIPE:
typescript

// App.tsx - ENTRY POINT PRINCIPAL
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '@/navigation/AppNavigator';
import { linking } from '@/navigation/linking';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      urlScheme="finance-app" // required for 3D Secure and bank redirects
      merchantIdentifier="merchant.com.yourapp.finance" // required for Apple Pay
    >
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </StripeProvider>
  );
}

// src/navigation/types.ts - TIPOS DE NAVEGACIÓN CON STRIPE
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TransactionDetail: { transactionId: string };
  AddTransaction: { accountId?: string };
  SubscriptionPlans: undefined; // ✅ Nueva ruta de suscripción
  Billing: undefined; // ✅ Gestión de facturación
};

// src/navigation/AppNavigator.tsx - NAVEGADOR PRINCIPAL CON STRIPE
export const AppNavigator = () => {
  const { isAuthenticated, isLoading, hasActiveSubscription } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          {/* Modal screens */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen 
              name="SubscriptionPlans" 
              component={SubscriptionPlansScreen} // ✅ Desde subscription-management
            />
            <Stack.Screen 
              name="Billing" 
              component={BillingScreen}
            />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

IMPLEMENTACIÓN DE STRIPE SEGURA (EDGE FUNCTIONS):
typescript

// ✅ CORRECTO: Edge Function para crear checkout session
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  try {
    const { priceId, customerId } = await req.json()
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/subscription/success`,
      cancel_url: `${Deno.env.get('APP_URL')}/subscription/cancel`,
    })

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// ✅ CORRECTO: Hook para uso en frontend
// src/features/subscription-management/hooks/useStripeCheckout.ts
export const useStripeCheckout = () => {
  const createCheckoutSession = async (priceId: string) => {
    // Llamar a la edge function, NO directamente a Stripe
    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: { priceId, customerId: await getStripeCustomerId() },
      }
    )
    
    if (error) throw error
    
    // Iniciar checkout con el sessionId
    const { error: stripeError } = await presentPaymentSheet(data.sessionId)
    
    if (stripeError) throw stripeError
  }

  return { createCheckoutSession }
}

// ❌ INCORRECTO: NUNCA hacer esto en el frontend
const createPaymentIntent = async () => {
  // Esto expone la clave secreta o procesa pagos en el cliente
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'usd',
  })
}

SISTEMA DE LÍMITES PREMIUM (SCOPE RULE):
typescript

// ✅ SHARED: Hook usado por múltiples features
// src/shared/hooks/usePremiumFeatures.ts
export const usePremiumFeatures = () => {
  const { subscription } = useSubscription()
  
  const isPremium = subscription?.status === 'active' || 
                   subscription?.status === 'trialing'
  
  const limits = {
    maxTransactions: isPremium ? null : 100,
    maxAccounts: isPremium ? null : 3,
    maxBudgets: isPremium ? null : 5,
    canExportData: isPremium,
    canUseAdvancedAnalytics: isPremium,
    canUseRecurringTransactions: isPremium
  }
  
  return { isPremium, limits }
}

// ✅ SHARED: Componente usado en múltiples features
// src/shared/components/ui/UpgradePrompt.tsx
export const UpgradePrompt = ({ feature, currentLimit }: UpgradePromptProps) => {
  const navigation = useNavigation()
  
  return (
    <View>
      <Text>Upgrade to premium for {feature}</Text>
      <Text>Current limit: {currentLimit}</Text>
      <Button 
        onPress={() => navigation.navigate('SubscriptionPlans')}
        title="View Plans"
      />
    </View>
  )
}

// ✅ Uso en features específicas con Scope Rule correcto
// features/transaction-tracking/components/TransactionList.tsx
export const TransactionList = ({ transactions }) => {
  const { limits } = usePremiumFeatures()
  
  if (!limits.canUseRecurringTransactions && hasRecurringTransactions(transactions)) {
    return <UpgradePrompt 
      feature="recurring transactions" 
      currentLimit="not available" 
    />
  }
  
  return (
    // Renderizar lista de transacciones
  )
}

🔧 Configuración de Desarrollo - React Navigation + Stripe
Dependencias Principales (Expo + React Navigation + Stripe):
json

{
  "dependencies": {
    "expo": "~52.0.0",
    "@expo/vector-icons": "^14.0.0",
    "expo-constants": "~17.0.0",
    "expo-status-bar": "~2.0.0",
    
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/drawer": "^6.6.0",
    "react-native-screens": "~4.0.0",
    "react-native-safe-area-context": "~4.8.0",
    
    "@supabase/supabase-js": "^2.45.0",
    "@stripe/stripe-react-native": "^0.28.0",
    
    "expo-secure-store": "~14.0.0",
    "react-native-mmkv": "^3.0.0",
    "expo-sqlite": "~15.0.0",
    
    "expo-local-authentication": "~15.0.0",
    "expo-auth-session": "~6.0.0",
    
    "expo-notifications": "~0.30.0",
    "expo-image-picker": "~16.0.0",
    "expo-media-library": "~17.0.0",
    "expo-document-picker": "~12.0.0",
    "expo-file-system": "~18.0.0",
    "expo-network": "~7.0.0",
    
    "lucide-react-native": "^0.400.0",
    "react-native-chart-kit": "^6.12.0",
    "date-fns": "^3.6.0",
    "react-native-svg": "15.8.0"
  }
}

Variables de Entorno Obligatorias:
bash

# .env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Estas variables SOLO en Supabase Dashboard (Edge Functions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_URL=yourapp://

📋 Checklist de Implementación - React Navigation + Stripe
Fase 1: Fundación Arquitectónica + React Navigation + Stripe

    CRÍTICO: Ejecutar expo init con TypeScript template

    CRÍTICO: Instalar React Navigation y dependencias

    CRÍTICO: ❌ NO INSTALAR Expo Router (verificar que no esté en dependencies)

    CRÍTICO: Instalar @stripe/stripe-react-native

    CRÍTICO: Crear carpeta supabase/ en ROOT del proyecto

    CRÍTICO: Ejecutar supabase init para configuración local

    CRÍTICO: Crear migraciones para tablas Stripe (009-013)

    CRÍTICO: Configurar Edge Functions para Stripe

    VALIDAR: Estructura de navegación creada en src/navigation/

    VALIDAR: App.tsx configurado con NavigationContainer y StripeProvider

    VALIDAR: Tipos de navegación definidos en types.ts (incluyendo rutas Stripe)

    VALIDAR: Todas las migraciones creadas en supabase/migrations/

    VALIDAR: Schema completo aplicado con supabase db reset

    VALIDAR: Types generados con supabase gen types typescript

    VALIDAR: Estructura de directorios Scope Rule creada en src/

    VALIDAR: Feature subscription-management creada con estructura correcta

    VALIDAR: Hook usePremiumFeatures en shared/hooks/

Fase 2: Navegación Core + Features Base + Stripe

    AuthNavigator.tsx - Stack de autenticación configurado

    MainTabNavigator.tsx - Tab navigator principal configurado

    authentication/screens/ - LoginScreen, RegisterScreen creadas

    subscription-management/screens/ - Screens de suscripción creadas

    VALIDAR: Screens son componentes presentacionales, lógica en containers

    useNavigation.ts hook tipado en shared/hooks/

    linking.ts configurado para deep linking

    subscription-management/services/ - Services para Edge Functions

    VALIDAR: Navigation types actualizados para todas las screens de suscripción

Fase 3: Integración Stripe Completa

    Edge Functions para checkout, portal y webhooks implementadas

    Webhook handler para actualizar estado de suscripciones

    Sistema de límites premium implementado con Scope Rule correcto

    PremiumBadge y UpgradePrompt componentes en shared/components/ui/

    Validación de límites en todas las features relevantes

    Sincronización de estado de suscripción con UI

Fase 4: Testing y Validación

    Testing de flujos de pago con claves de prueba de Stripe

    Validación de que no hay claves secretas en el frontend

    Verificación de RLS en tablas de Stripe

    Testing de límites free vs premium

    Validación de deep links para retorno de Stripe

🚨 RECORDATORIOS FINALES PARA EL ARQUITECTO

REGLAS INVIOLABLES STRIPE:

    ⚠️ NUNCA procesar pagos en el cliente - siempre en Edge Functions

    ⚠️ NUNCA almacenar claves secretas de Stripe en el frontend

    ⚠️ SIEMPRE usar RLS en tablas sensibles de Stripe

    ⚠️ SIEMPRE validar webhooks con firma de Stripe

SCOPE RULE PARA STRIPE:

    ✅ Lógica de suscripción: Local a subscription-management feature

    ✅ Componentes de upgrade: Shared (usados por múltiples features)

    ✅ Validación de límites: Shared (usado por múltiples features)

    ✅ Configuración de Stripe: Infrastructure (transversal)

NAVEGACIÓN CON STRIPE:

    ✅ Rutas de suscripción añadidas a navigation types

    ✅ Screens de suscripción en su propia feature

    ✅ Deep linking configurado para retorno de Stripe

    ✅ Navegación modal para flujos de pago

¡Construyamos la mejor aplicación de finanzas personales con Expo + React Navigation, Stripe seguro, arquitectura limpia e inviolable! 🚀

Eres el GUARDIÁN de la arquitectura, las migraciones, React Navigation Y la seguridad de Stripe. Cada tabla debe tener su migración, cada screen debe estar tipada, cada pago debe ser seguro. Sin excepciones.
