/**
 * Goal Management Types
 * Following Scope Rule Pattern - Types local to goal-management feature
 */

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type ContributionType = 'manual' | 'automatic' | 'transaction_linked';
export type AutoContributionFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string; // ISO date string
  priority: GoalPriority;
  status: GoalStatus;
  category?: string;
  icon?: string;
  color?: string;
  notification_milestones: number[]; // Array of percentage milestones [25, 50, 75, 100]
  auto_contribution_enabled: boolean;
  auto_contribution_amount?: number;
  auto_contribution_frequency?: AutoContributionFrequency;
  is_achieved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  transaction_id?: string; // Optional link to transaction
  amount: number;
  contribution_type: ContributionType;
  notes?: string;
  created_at: string;
}

// Create/Update DTOs
export interface CreateGoalInput {
  name: string;
  description?: string;
  target_amount: number;
  target_date?: string;
  priority?: GoalPriority;
  category?: string;
  icon?: string;
  color?: string;
  notification_milestones?: number[];
  auto_contribution_enabled?: boolean;
  auto_contribution_amount?: number;
  auto_contribution_frequency?: AutoContributionFrequency;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  status?: GoalStatus;
  current_amount?: number;
  is_active?: boolean;
}

export interface CreateGoalContributionInput {
  goal_id: string;
  amount: number;
  contribution_type?: ContributionType;
  notes?: string;
  transaction_id?: string;
}

// View DTOs with computed fields
export interface GoalWithProgress extends Goal {
  progress_percentage: number;
  remaining_amount: number;
  days_remaining?: number;
  is_overdue: boolean;
  next_milestone?: number;
  contributions_count: number;
  latest_contribution?: GoalContribution;
}

export interface GoalContributionWithDetails extends GoalContribution {
  goal_name: string;
  transaction_description?: string;
}

// Categories for goals
export const GOAL_CATEGORIES = [
  { id: 'emergency_fund', name: 'Emergency Fund', icon: 'shield', color: '#EF4444' },
  { id: 'vacation', name: 'Vacation', icon: 'plane', color: '#3B82F6' },
  { id: 'car', name: 'Car', icon: 'car', color: '#10B981' },
  { id: 'house', name: 'House', icon: 'home', color: '#F59E0B' },
  { id: 'education', name: 'Education', icon: 'graduation-cap', color: '#8B5CF6' },
  { id: 'retirement', name: 'Retirement', icon: 'piggy-bank', color: '#EC4899' },
  { id: 'wedding', name: 'Wedding', icon: 'heart', color: '#F97316' },
  { id: 'business', name: 'Business', icon: 'briefcase', color: '#06B6D4' },
  { id: 'technology', name: 'Technology', icon: 'smartphone', color: '#84CC16' },
  { id: 'other', name: 'Other', icon: 'target', color: '#6B7280' },
] as const;

export type GoalCategoryId = typeof GOAL_CATEGORIES[number]['id'];