/**
 * Goal Service - Backend operations for goals
 * Following Scope Rule Pattern - Service local to goal-management feature
 */

import { supabase } from '../../../infrastructure/supabase/client';
import type { 
  Goal, 
  GoalWithProgress,
  CreateGoalInput, 
  UpdateGoalInput,
  GoalStatus 
} from '../types';

export class GoalService {
  /**
   * Get all goals for the current user
   */
  static async getGoals(): Promise<GoalWithProgress[]> {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        goal_contributions (
          id,
          amount,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      throw new Error(`Failed to fetch goals: ${error.message}`);
    }

    // Transform data to include progress calculations
    return data?.map((goal: any) => this.calculateGoalProgress(goal)) || [];
  }

  /**
   * Get a single goal by ID with full details
   */
  static async getGoalById(goalId: string): Promise<GoalWithProgress | null> {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        goal_contributions (
          id,
          amount,
          contribution_type,
          notes,
          created_at,
          transaction_id,
          transactions (
            description
          )
        )
      `)
      .eq('id', goalId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Goal not found
      }
      console.error('Error fetching goal:', error);
      throw new Error(`Failed to fetch goal: ${error.message}`);
    }

    return this.calculateGoalProgress(data);
  }

  /**
   * Create a new goal
   */
  static async createGoal(input: CreateGoalInput): Promise<Goal> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const goalData = {
      ...input,
      user_id: userData.user.id,
      current_amount: 0,
      is_achieved: false,
      is_active: true,
      notification_milestones: input.notification_milestones || [25, 50, 75, 100],
      priority: input.priority || 'medium',
      status: 'active' as GoalStatus,
    };

    const { data, error } = await supabase
      .from('goals')
      .insert([goalData])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing goal
   */
  static async updateGoal(goalId: string, input: UpdateGoalInput): Promise<Goal> {
    const updateData = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      throw new Error(`Failed to update goal: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a goal
   */
  static async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('Error deleting goal:', error);
      throw new Error(`Failed to delete goal: ${error.message}`);
    }
  }

  /**
   * Toggle goal status between active and paused
   */
  static async toggleGoalStatus(goalId: string): Promise<Goal> {
    // First get the current goal
    const { data: currentGoal, error: fetchError } = await supabase
      .from('goals')
      .select('status')
      .eq('id', goalId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch goal status: ${fetchError.message}`);
    }

    const newStatus: GoalStatus = currentGoal.status === 'active' ? 'paused' : 'active';

    return this.updateGoal(goalId, { status: newStatus });
  }

  /**
   * Mark goal as completed
   */
  static async completeGoal(goalId: string): Promise<Goal> {
    return this.updateGoal(goalId, { 
      status: 'completed'
    });
  }

  /**
   * Get goals that are approaching their target date (for notifications)
   */
  static async getGoalsApproachingDeadline(daysAhead: number = 7): Promise<GoalWithProgress[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        goal_contributions (
          id,
          amount,
          created_at
        )
      `)
      .eq('status', 'active')
      .not('target_date', 'is', null)
      .lte('target_date', futureDate.toISOString().split('T')[0])
      .gte('target_date', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching goals approaching deadline:', error);
      throw new Error(`Failed to fetch goals approaching deadline: ${error.message}`);
    }

    return data?.map((goal: any) => this.calculateGoalProgress(goal)) || [];
  }

  /**
   * Get goals that have reached milestone percentages (for notifications)
   */
  static async getGoalsReachingMilestones(): Promise<{ goal: GoalWithProgress; milestone: number }[]> {
    const goals = await this.getGoals();
    const results: { goal: GoalWithProgress; milestone: number }[] = [];

    goals.forEach(goal => {
      if (goal.notification_milestones && goal.next_milestone) {
        const currentProgress = goal.progress_percentage;
        const nextMilestone = goal.next_milestone;
        
        // Check if we've reached the next milestone
        if (currentProgress >= nextMilestone) {
          results.push({ goal, milestone: nextMilestone });
        }
      }
    });

    return results;
  }

  /**
   * Calculate goal progress and derived fields
   * Private helper method
   */
  private static calculateGoalProgress(goalData: any): GoalWithProgress {
    const goal = goalData as Goal;
    const contributions = goalData.goal_contributions || [];

    const progress_percentage = goal.target_amount > 0 
      ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
      : 0;

    const remaining_amount = Math.max(goal.target_amount - goal.current_amount, 0);

    let days_remaining: number | undefined;
    let is_overdue = false;

    if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      days_remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      is_overdue = days_remaining < 0;
    } else {
      is_overdue = false;
    }

    // Find next milestone
    let next_milestone: number | undefined;
    if (goal.notification_milestones && goal.notification_milestones.length > 0) {
      next_milestone = goal.notification_milestones.find(
        milestone => milestone > progress_percentage
      );
    }

    // Get latest contribution
    const latest_contribution = contributions.length > 0 
      ? contributions.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : undefined;

    return {
      ...goal,
      progress_percentage: Math.round(progress_percentage * 100) / 100, // Round to 2 decimals
      remaining_amount,
      days_remaining,
      is_overdue,
      next_milestone,
      contributions_count: contributions.length,
      latest_contribution,
    };
  }
}