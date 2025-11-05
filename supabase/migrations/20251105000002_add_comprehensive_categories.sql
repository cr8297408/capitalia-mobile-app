/*
  # Add Comprehensive Category System

  1. Categories Added
    - Income categories (salary, freelance, investments, etc.)
    - Essential expenses (housing, utilities, groceries, transportation)
    - Personal expenses (health, education, entertainment, shopping)
    - Financial categories (savings, investments, debt payments)
    - Business categories (for freelancers/entrepreneurs)
    - Special categories (gifts, donations, taxes)

  2. Features
    - All categories are system defaults (is_system_default = true)
    - Organized by type (income, expense)
    - Spanish names and descriptions for better UX
    - Color-coded with meaningful icons
*/

-- First, let's clean up any existing default categories to avoid duplicates
-- (We'll keep user-created categories)
DELETE FROM categories WHERE is_system_default = true;

-- ============================================================================
-- INCOME CATEGORIES (Categorías de Ingresos)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
-- Empleo y Nómina
('Salario', 'income', '#10b981', 'briefcase', true),
('Bonificación', 'income', '#059669', 'gift', true),
('Horas Extra', 'income', '#047857', 'clock', true),
('Comisiones', 'income', '#065f46', 'trending-up', true),

-- Trabajo Independiente
('Freelance', 'income', '#3b82f6', 'code', true),
('Consultoría', 'income', '#2563eb', 'users', true),
('Ventas', 'income', '#1d4ed8', 'shopping-bag', true),
('Servicios Profesionales', 'income', '#1e40af', 'award', true),

-- Inversiones y Activos
('Dividendos', 'income', '#8b5cf6', 'trending-up', true),
('Intereses', 'income', '#7c3aed', 'percent', true),
('Rentas', 'income', '#6d28d9', 'home', true),
('Ganancias de Capital', 'income', '#5b21b6', 'bar-chart', true),
('Criptomonedas', 'income', '#4c1d95', 'bitcoin', true),

-- Otros Ingresos
('Reembolsos', 'income', '#14b8a6', 'rotate-ccw', true),
('Regalos Recibidos', 'income', '#0d9488', 'gift', true),
('Premios y Sorteos', 'income', '#0f766e', 'trophy', true),
('Pensión Alimenticia', 'income', '#115e59', 'heart', true),
('Becas y Ayudas', 'income', '#134e4a', 'book', true),
('Otros Ingresos', 'income', '#06b6d4', 'plus-circle', true);

-- ============================================================================
-- EXPENSE CATEGORIES - VIVIENDA (Housing)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Alquiler/Hipoteca', 'expense', '#ef4444', 'home', true),
('Servicios Públicos', 'expense', '#dc2626', 'zap', true),
('Internet y Cable', 'expense', '#b91c1c', 'wifi', true),
('Teléfono', 'expense', '#991b1b', 'phone', true),
('Mantenimiento del Hogar', 'expense', '#7f1d1d', 'tool', true),
('Muebles y Decoración', 'expense', '#450a0a', 'couch', true),
('Seguros de Hogar', 'expense', '#fca5a5', 'shield', true);

-- ============================================================================
-- EXPENSE CATEGORIES - ALIMENTACIÓN (Food & Groceries)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Supermercado', 'expense', '#f97316', 'shopping-cart', true),
('Restaurantes', 'expense', '#ea580c', 'utensils', true),
('Comida Rápida', 'expense', '#c2410c', 'coffee', true),
('Cafeterías', 'expense', '#9a3412', 'coffee', true),
('Delivery', 'expense', '#7c2d12', 'truck', true),
('Despensa', 'expense', '#431407', 'package', true);

-- ============================================================================
-- EXPENSE CATEGORIES - TRANSPORTE (Transportation)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Gasolina', 'expense', '#eab308', 'fuel', true),
('Transporte Público', 'expense', '#ca8a04', 'bus', true),
('Taxi/Uber', 'expense', '#a16207', 'car', true),
('Mantenimiento Vehículo', 'expense', '#854d0e', 'wrench', true),
('Seguro Vehicular', 'expense', '#713f12', 'shield', true),
('Estacionamiento', 'expense', '#422006', 'parking', true),
('Peajes', 'expense', '#fef08a', 'road', true),
('Multas de Tránsito', 'expense', '#fde047', 'alert-triangle', true);

-- ============================================================================
-- EXPENSE CATEGORIES - SALUD Y BIENESTAR (Health & Wellness)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Médico', 'expense', '#ec4899', 'activity', true),
('Medicamentos', 'expense', '#db2777', 'pill', true),
('Dentista', 'expense', '#be185d', 'smile', true),
('Óptica', 'expense', '#9f1239', 'eye', true),
('Gimnasio', 'expense', '#831843', 'dumbbell', true),
('Terapias', 'expense', '#500724', 'heart-pulse', true),
('Seguro Médico', 'expense', '#fda4af', 'shield', true),
('Spa y Masajes', 'expense', '#fb7185', 'sparkles', true);

-- ============================================================================
-- EXPENSE CATEGORIES - EDUCACIÓN (Education)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Colegiatura', 'expense', '#8b5cf6', 'graduation-cap', true),
('Libros y Material', 'expense', '#7c3aed', 'book-open', true),
('Cursos Online', 'expense', '#6d28d9', 'laptop', true),
('Clases Particulares', 'expense', '#5b21b6', 'user', true),
('Idiomas', 'expense', '#4c1d95', 'globe', true),
('Certificaciones', 'expense', '#2e1065', 'award', true);

-- ============================================================================
-- EXPENSE CATEGORIES - ENTRETENIMIENTO (Entertainment)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Streaming', 'expense', '#06b6d4', 'tv', true),
('Cine', 'expense', '#0891b2', 'film', true),
('Conciertos y Eventos', 'expense', '#0e7490', 'music', true),
('Videojuegos', 'expense', '#155e75', 'gamepad', true),
('Libros y Revistas', 'expense', '#164e63', 'book', true),
('Hobbies', 'expense', '#083344', 'palette', true),
('Viajes y Turismo', 'expense', '#67e8f9', 'plane', true),
('Hoteles', 'expense', '#22d3ee', 'building', true);

-- ============================================================================
-- EXPENSE CATEGORIES - COMPRAS PERSONALES (Personal Shopping)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Ropa', 'expense', '#a855f7', 'shirt', true),
('Calzado', 'expense', '#9333ea', 'shoe', true),
('Accesorios', 'expense', '#7e22ce', 'watch', true),
('Productos de Belleza', 'expense', '#6b21a8', 'sparkles', true),
('Peluquería', 'expense', '#581c87', 'scissors', true),
('Electrónicos', 'expense', '#3b0764', 'smartphone', true),
('Mascotas', 'expense', '#d8b4fe', 'paw', true);

-- ============================================================================
-- EXPENSE CATEGORIES - FINANZAS (Financial)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Ahorro', 'expense', '#10b981', 'piggy-bank', true),
('Inversiones', 'expense', '#059669', 'trending-up', true),
('Pago de Deudas', 'expense', '#047857', 'credit-card', true),
('Tarjetas de Crédito', 'expense', '#065f46', 'card', true),
('Comisiones Bancarias', 'expense', '#064e3b', 'dollar-sign', true),
('Seguros', 'expense', '#86efac', 'umbrella', true),
('Impuestos', 'expense', '#4ade80', 'file-text', true);

-- ============================================================================
-- EXPENSE CATEGORIES - NEGOCIO (Business - for entrepreneurs)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Oficina', 'expense', '#3b82f6', 'briefcase', true),
('Marketing', 'expense', '#2563eb', 'megaphone', true),
('Software y Herramientas', 'expense', '#1d4ed8', 'code', true),
('Equipamiento', 'expense', '#1e40af', 'monitor', true),
('Capacitación', 'expense', '#1e3a8a', 'graduation-cap', true),
('Contabilidad', 'expense', '#172554', 'calculator', true),
('Legal', 'expense', '#93c5fd', 'scale', true);

-- ============================================================================
-- EXPENSE CATEGORIES - SOCIAL (Social & Gifts)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Regalos', 'expense', '#f472b6', 'gift', true),
('Donaciones', 'expense', '#ec4899', 'heart', true),
('Celebraciones', 'expense', '#db2777', 'cake', true),
('Membresías', 'expense', '#be185d', 'users', true);

-- ============================================================================
-- EXPENSE CATEGORIES - OTROS (Others)
-- ============================================================================

INSERT INTO categories (name, transaction_type, color, icon, is_system_default) VALUES
('Niños', 'expense', '#fbbf24', 'baby', true),
('Emergencias', 'expense', '#f59e0b', 'alert-circle', true),
('Transferencias', 'expense', '#d97706', 'arrow-right-left', true),
('Ajustes', 'expense', '#b45309', 'settings', true),
('Otros Gastos', 'expense', '#92400e', 'more-horizontal', true);

-- ============================================================================
-- Add comments for documentation
-- ============================================================================

COMMENT ON TABLE categories IS 'Comprehensive category system covering all personal finance scenarios. System categories cannot be deleted, only hidden.';

-- Create index for better performance on category queries
CREATE INDEX IF NOT EXISTS idx_categories_transaction_type_system ON categories(transaction_type, is_system_default) WHERE is_system_default = true;
