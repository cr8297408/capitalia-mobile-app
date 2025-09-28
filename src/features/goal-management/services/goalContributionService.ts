/**
 * Goal Contribution Service - Backend operations for goal contributions
 * Following Scope Rule Pattern - Service local to goal-management feature
 */

import { supabase } from '../../../infrastructure/supabase/client';
import type { 
  GoalContribution,
  GoalContributionWithDetails,
  CreateGoalContributionInput
} from '../types';

export class GoalContributionService {
  /**
   * Get all contributions for a specific goal
   */
  static async getGoalContributions(goalId: string): Promise<GoalContributionWithDetails[]> {
    const { data, error } = await supabase
      .from('goal_contributions')
      .select(`
        *,
        goals (
          name
        ),
        transactions (
          description
        )
      `)
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goal contributions:', error);
      throw new Error(`Failed to fetch goal contributions: ${error.message}`);
    }

    return data?.map((contribution: any) => ({
      ...contribution,
      goal_name: contribution.goals?.name || '',
      transaction_description: contribution.transactions?.description,
    })) || [];
  }

  /**
   * Get all contributions for the current user (across all goals)
   */
  static async getUserContributions(): Promise<GoalContributionWithDetails[]> {
    const { data, error } = await supabase
      .from('goal_contributions')
      .select(`
        *,
        goals (
          name,
          icon,
          color
        ),
        transactions (
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user contributions:', error);
      throw new Error(`Failed to fetch user contributions: ${error.message}`);
    }

    return data?.map((contribution: any) => ({
      ...contribution,
      goal_name: contribution.goals?.name || '',
      transaction_description: contribution.transactions?.description,
    })) || [];
  }

  /**
   * Create a new goal contribution
   */
  static async createContribution(input: CreateGoalContributionInput): Promise<GoalContribution> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const contributionData = {
      ...input,
      user_id: userData.user.id,
      contribution_type: input.contribution_type || 'manual',
    };

    const { data, error } = await supabase
      .from('goal_contributions')
      .insert([contributionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal contribution:', error);
      throw new Error(`Failed to create goal contribution: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a goal contribution
   */
  static async updateContribution(
    contributionId: string, 
    input: Partial<CreateGoalContributionInput>
  ): Promise<GoalContribution> {
    const { data, error } = await supabase
      .from('goal_contributions')
      .update(input)
      .eq('id', contributionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal contribution:', error);
      throw new Error(`Failed to update goal contribution: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a goal contribution
   */
  static async deleteContribution(contributionId: string): Promise<void> {
    const { error } = await supabase
      .from('goal_contributions')
      .delete()
      .eq('id', contributionId);

    if (error) {
      console.error('Error deleting goal contribution:', error);
      throw new Error(`Failed to delete goal contribution: ${error.message}`);
    }
  }

  /**
   * Get contributions summary for a specific time period
   */
  static async getContributionsSummary(
    startDate: string,
    endDate: string
  ): Promise<{
    total_amount: number;
    contributions_count: number;
    goals_contributed_to: number;
    avg_contribution: number;
  }> {
    const { data, error } = await supabase
      .from('goal_contributions')
      .select('amount, goal_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('Error fetching contributions summary:', error);
      throw new Error(`Failed to fetch contributions summary: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        total_amount: 0,
        contributions_count: 0,
        goals_contributed_to: 0,
        avg_contribution: 0,
      };
    }

    const total_amount = data.reduce((sum: number, contribution: any) => sum + contribution.amount, 0);
    const contributions_count = data.length;
    const unique_goals = new Set(data.map((contribution: any) => contribution.goal_id));
    const goals_contributed_to = unique_goals.size;
    const avg_contribution = total_amount / contributions_count;

    return {
      total_amount,
      contributions_count,
      goals_contributed_to,
      avg_contribution: Math.round(avg_contribution * 100) / 100, // Round to 2 decimals
    };
  }

  /**
   * Get recent contributions (for dashboard/activity feed)
   */
  static async getRecentContributions(limit: number = 10): Promise<GoalContributionWithDetails[]> {
    const { data, error } = await supabase
      .from('goal_contributions')
      .select(`
        *,
        goals (
          name,
          icon,
          color,
          target_amount
        ),
        transactions (
          description
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent contributions:', error);
      throw new Error(`Failed to fetch recent contributions: ${error.message}`);
    }

    return data?.map((contribution: any) => ({
      ...contribution,
      goal_name: contribution.goals?.name || '',
      transaction_description: contribution.transactions?.description,
    })) || [];
  }

  /**
   * Get contribution statistics by goal
   */
  static async getContributionsByGoal(): Promise<Array<{
    goal_id: string;
    goal_name: string;
    total_contributed: number;
    contributions_count: number;
    avg_contribution: number;
    last_contribution_date: string;
  }>> {
    const { data, error } = await supabase
      .from('goal_contributions')
      .select(`
        goal_id,
        amount,
        created_at,
        goals (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contributions by goal:', error);
      throw new Error(`Failed to fetch contributions by goal: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group by goal_id
    const groupedData = data.reduce((acc: any, contribution: any) => {
      const goalId = contribution.goal_id;
      
      if (!acc[goalId]) {
        acc[goalId] = {
          goal_id: goalId,
          goal_name: contribution.goals?.name || 'Unknown Goal',
          contributions: [],
        };
      }
      
      acc[goalId].contributions.push(contribution);
      return acc;
    }, {});

    // Calculate statistics for each goal
    return Object.values(groupedData).map((goalData: any) => {
      const contributions = goalData.contributions;
      const total_contributed = contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
      const contributions_count = contributions.length;
      const avg_contribution = total_contributed / contributions_count;
      const last_contribution_date = contributions[0].created_at; // Already sorted desc

      return {
        goal_id: goalData.goal_id,
        goal_name: goalData.goal_name,
        total_contributed,
        contributions_count,
        avg_contribution: Math.round(avg_contribution * 100) / 100,
        last_contribution_date,
      };
    });
  }
}