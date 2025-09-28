/**
 * Goal Detail Hook - Hook for individual goal operations
 * Following Scope Rule Pattern - Hook local to goal-management feature
 */

import { useState, useEffect, useCallback } from 'react';
import { GoalService } from '../services/goalService';
import { GoalContributionService } from '../services/goalContributionService';
import type { 
  GoalWithProgress, 
  GoalContributionWithDetails,
  CreateGoalContributionInput
} from '../types';

export function useGoalDetail(goalId: string | null) {
  const [goal, setGoal] = useState<GoalWithProgress | null>(null);
  const [contributions, setContributions] = useState<GoalContributionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoalDetail = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [goalData, contributionsData] = await Promise.all([
        GoalService.getGoalById(id),
        GoalContributionService.getGoalContributions(id)
      ]);
      
      setGoal(goalData);
      setContributions(contributionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goal details');
      console.error('Error loading goal detail:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addContribution = useCallback(async (input: CreateGoalContributionInput) => {
    try {
      setError(null);
      const newContribution = await GoalContributionService.createContribution(input);
      
      // Reload goal and contributions to get updated data
      if (goalId) {
        await loadGoalDetail(goalId);
      }
      
      return newContribution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add contribution';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [goalId, loadGoalDetail]);

  const updateContribution = useCallback(async (
    contributionId: string, 
    input: Partial<CreateGoalContributionInput>
  ) => {
    try {
      setError(null);
      const updatedContribution = await GoalContributionService.updateContribution(contributionId, input);
      
      // Reload goal and contributions to get updated data
      if (goalId) {
        await loadGoalDetail(goalId);
      }
      
      return updatedContribution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contribution';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [goalId, loadGoalDetail]);

  const deleteContribution = useCallback(async (contributionId: string) => {
    try {
      setError(null);
      await GoalContributionService.deleteContribution(contributionId);
      
      // Remove from local state immediately
      setContributions(prev => prev.filter(c => c.id !== contributionId));
      
      // Reload goal to get updated progress
      if (goalId) {
        const updatedGoal = await GoalService.getGoalById(goalId);
        setGoal(updatedGoal);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete contribution';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [goalId]);

  // Load goal details when goalId changes
  useEffect(() => {
    if (goalId) {
      loadGoalDetail(goalId);
    } else {
      setGoal(null);
      setContributions([]);
      setLoading(false);
    }
  }, [goalId, loadGoalDetail]);

  // Calculate contribution statistics
  const totalContributions = contributions.length;
  const manualContributions = contributions.filter(c => c.contribution_type === 'manual').length;
  const automaticContributions = contributions.filter(c => c.contribution_type === 'automatic').length;
  const transactionLinkedContributions = contributions.filter(c => c.contribution_type === 'transaction_linked').length;
  
  const averageContribution = totalContributions > 0 
    ? contributions.reduce((sum, c) => sum + c.amount, 0) / totalContributions 
    : 0;

  const lastContributionDate = contributions.length > 0 
    ? contributions[0].created_at 
    : null;

  // Get contributions by month (for charts)
  const contributionsByMonth = contributions.reduce((acc, contribution) => {
    const date = new Date(contribution.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, amount: 0, count: 0 };
    }
    
    acc[monthKey].amount += contribution.amount;
    acc[monthKey].count += 1;
    
    return acc;
  }, {} as Record<string, { month: string; amount: number; count: number }>);

  const monthlyData = Object.values(contributionsByMonth).sort((a, b) => a.month.localeCompare(b.month));

  return {
    // Data
    goal,
    contributions,
    
    // Statistics
    totalContributions,
    manualContributions,
    automaticContributions,
    transactionLinkedContributions,
    averageContribution: Math.round(averageContribution * 100) / 100,
    lastContributionDate,
    monthlyData,
    
    // State
    loading,
    error,
    
    // Actions
    loadGoalDetail,
    addContribution,
    updateContribution,
    deleteContribution,
  };
}