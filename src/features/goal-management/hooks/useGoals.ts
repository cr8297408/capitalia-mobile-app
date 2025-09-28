/**
 * Goals Hook - Shared hook for goal management operations
 * Following Scope Rule Pattern - Hook local to goal-management feature
 */

import { useState, useEffect, useCallback } from 'react';
import { GoalService } from '../services/goalService';
import type { 
  GoalWithProgress, 
  CreateGoalInput, 
  UpdateGoalInput,
  GoalStatus 
} from '../types';

export function useGoals() {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GoalService.getGoals();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (input: CreateGoalInput) => {
    try {
      setError(null);
      const newGoal = await GoalService.createGoal(input);
      // Reload goals to get the updated progress calculations
      await loadGoals();
      return newGoal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGoals]);

  const updateGoal = useCallback(async (goalId: string, input: UpdateGoalInput) => {
    try {
      setError(null);
      const updatedGoal = await GoalService.updateGoal(goalId, input);
      // Reload goals to get the updated progress calculations
      await loadGoals();
      return updatedGoal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGoals]);

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      setError(null);
      await GoalService.deleteGoal(goalId);
      // Remove the goal from local state immediately
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const toggleGoalStatus = useCallback(async (goalId: string) => {
    try {
      setError(null);
      await GoalService.toggleGoalStatus(goalId);
      await loadGoals();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle goal status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGoals]);

  const completeGoal = useCallback(async (goalId: string) => {
    try {
      setError(null);
      await GoalService.completeGoal(goalId);
      await loadGoals();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGoals]);

  // Load goals on hook initialization
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Filter goals by status
  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const pausedGoals = goals.filter(goal => goal.status === 'paused');

  // Get goals approaching deadline
  const urgentGoals = goals.filter(goal => 
    goal.status === 'active' && 
    goal.days_remaining !== undefined && 
    goal.days_remaining <= 7 && 
    goal.days_remaining > 0
  );

  // Get overdue goals
  const overdueGoals = goals.filter(goal => 
    goal.status === 'active' && goal.is_overdue
  );

  // Calculate summary statistics
  const totalGoals = goals.length;
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalRemainingAmount = goals.reduce((sum, goal) => sum + goal.remaining_amount, 0);
  const overallProgress = totalTargetAmount > 0 
    ? (totalCurrentAmount / totalTargetAmount) * 100 
    : 0;

  return {
    // Data
    goals,
    activeGoals,
    completedGoals,
    pausedGoals,
    urgentGoals,
    overdueGoals,
    
    // Statistics
    totalGoals,
    totalTargetAmount,
    totalCurrentAmount,
    totalRemainingAmount,
    overallProgress: Math.round(overallProgress * 100) / 100,
    
    // State
    loading,
    error,
    
    // Actions
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    completeGoal,
  };
}