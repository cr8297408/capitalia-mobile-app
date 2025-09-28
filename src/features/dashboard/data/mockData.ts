/**
 * Dashboard Mock Data - Sample data for development and testing
 * Following Scope Rule Pattern - Data local to dashboard feature
 */

export const mockCategoryExpenses = [
  {
    category: 'Comida',
    amount: 2193,
    percentage: 35,
    color: '#EF4444',
  },
  {
    category: 'Transporte',
    amount: 1567,
    percentage: 25,
    color: '#3B82F6',
  },
  {
    category: 'Ocio',
    amount: 1253,
    percentage: 20,
    color: '#8B5CF6',
  },
  {
    category: 'Compras',
    amount: 940,
    percentage: 15,
    color: '#F59E0B',
  },
  {
    category: 'Servicios',
    amount: 313,
    percentage: 5,
    color: '#10B981',
  },
];

export const mockAIInsights = [
  {
    id: '1',
    type: 'savings' as const,
    title: 'Oportunidad de ahorro',
    message: 'Podrías ahorrar hasta 150€ reduciendo gastos en comida este mes',
    actionText: 'Ver sugerencias',
  },
  {
    id: '2',
    type: 'goal' as const,
    title: 'Meta de Vacaciones casi alcanzada',
    message: 'Vas 75% hacia tu objetivo de 5.000€. ¡Solo 1.250€ más!',
    actionText: 'Ver meta',
  },
  {
    id: '3',
    type: 'spending' as const,
    title: 'Alto gasto en Comida',
    message: 'Los gastos en comida han aumentado 15% este mes comparado con el anterior',
    actionText: 'Ver detalles',
  },
];

export const mockGoalProgress = [
  {
    id: '1',
    name: 'Fondo de Emergencia',
    currentAmount: 3750,
    targetAmount: 5000,
    progress: 0.75,
  },
  {
    id: '2',
    name: 'Vacaciones Europa',
    currentAmount: 1200,
    targetAmount: 3000,
    progress: 0.4,
  },
  {
    id: '3',
    name: 'Nuevo Ordenador',
    currentAmount: 800,
    targetAmount: 1500,
    progress: 0.53,
  },
];

export const mockDashboardStats = {
  totalBalance: 12847.50,
  totalBalanceChange: 10.6,
  totalBalanceIsPositive: true,
  monthlyIncome: 8500,
  monthlyIncomeChange: 6.2,
  monthlyIncomeIsPositive: true,
  monthlyExpenses: 6266,
  monthlyExpensesChange: -3.6,
  monthlyExpensesIsPositive: false,
  savingsRate: 26.3,
  savingsRateChange: 12.8,
  savingsRateIsPositive: true,
};