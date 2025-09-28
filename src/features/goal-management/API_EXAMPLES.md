# API Examples - Goal Management Feature

## Create Goal

### Endpoint
```typescript
// Service call
const goal = await GoalService.createGoal(input);
```

### Example Payload
```json
{
  "name": "Emergency Fund",
  "description": "Emergency fund to cover 6 months of expenses",
  "target_amount": 25000.00,
  "target_date": "2025-12-31",
  "priority": "high",
  "category": "emergency_fund",
  "icon": "shield",
  "color": "#EF4444",
  "notification_milestones": [25, 50, 75, 100],
  "auto_contribution_enabled": true,
  "auto_contribution_amount": 500.00,
  "auto_contribution_frequency": "monthly"
}
```

### Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid",
  "name": "Emergency Fund",
  "description": "Emergency fund to cover 6 months of expenses",
  "target_amount": 25000.00,
  "current_amount": 0.00,
  "target_date": "2025-12-31",
  "priority": "high",
  "status": "active",
  "category": "emergency_fund",
  "icon": "shield",
  "color": "#EF4444",
  "notification_milestones": [25, 50, 75, 100],
  "auto_contribution_enabled": true,
  "auto_contribution_amount": 500.00,
  "auto_contribution_frequency": "monthly",
  "is_achieved": false,
  "is_active": true,
  "created_at": "2025-09-28T18:00:00.000Z",
  "updated_at": "2025-09-28T18:00:00.000Z"
}
```

## Update Goal

### Endpoint
```typescript
// Service call
const goal = await GoalService.updateGoal(goalId, input);
```

### Example Payload (Partial Update)
```json
{
  "target_amount": 30000.00,
  "target_date": "2026-06-30",
  "status": "active",
  "auto_contribution_amount": 600.00
}
```

## Create Goal Contribution

### Endpoint
```typescript
// Service call
const contribution = await GoalContributionService.createContribution(input);
```

### Example Payload - Manual Contribution
```json
{
  "goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 1000.00,
  "contribution_type": "manual",
  "notes": "Monthly savings deposit"
}
```

### Example Payload - Transaction Linked Contribution
```json
{
  "goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 1500.00,
  "contribution_type": "transaction_linked",
  "transaction_id": "trans-uuid-123",
  "notes": "Bonus payment allocation to emergency fund"
}
```

### Response
```json
{
  "id": "contrib-uuid-456",
  "goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid",
  "transaction_id": "trans-uuid-123",
  "amount": 1500.00,
  "contribution_type": "transaction_linked",
  "notes": "Bonus payment allocation to emergency fund",
  "created_at": "2025-09-28T19:00:00.000Z"
}
```

## Get Goals with Progress

### Endpoint
```typescript
// Service call
const goals = await GoalService.getGoals();
```

### Response
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-uuid",
    "name": "Emergency Fund",
    "description": "Emergency fund to cover 6 months of expenses",
    "target_amount": 25000.00,
    "current_amount": 7500.00,
    "target_date": "2025-12-31",
    "priority": "high",
    "status": "active",
    "category": "emergency_fund",
    "icon": "shield",
    "color": "#EF4444",
    "notification_milestones": [25, 50, 75, 100],
    "auto_contribution_enabled": true,
    "auto_contribution_amount": 500.00,
    "auto_contribution_frequency": "monthly",
    "is_achieved": false,
    "is_active": true,
    "created_at": "2025-09-28T18:00:00.000Z",
    "updated_at": "2025-09-28T18:00:00.000Z",
    "progress_percentage": 30.00,
    "remaining_amount": 17500.00,
    "days_remaining": 94,
    "is_overdue": false,
    "next_milestone": 50,
    "contributions_count": 5,
    "latest_contribution": {
      "id": "contrib-latest",
      "amount": 1500.00,
      "created_at": "2025-09-28T19:00:00.000Z"
    }
  }
]
```

## Get Goal Detail with Contributions

### Endpoint
```typescript
// Service call
const goal = await GoalService.getGoalById(goalId);
const contributions = await GoalContributionService.getGoalContributions(goalId);
```

### Response
```json
{
  "goal": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Emergency Fund",
    "target_amount": 25000.00,
    "current_amount": 7500.00,
    "progress_percentage": 30.00,
    "remaining_amount": 17500.00,
    "days_remaining": 94,
    "is_overdue": false,
    "next_milestone": 50
  },
  "contributions": [
    {
      "id": "contrib-uuid-1",
      "goal_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 1500.00,
      "contribution_type": "transaction_linked",
      "notes": "Bonus payment allocation",
      "created_at": "2025-09-28T19:00:00.000Z",
      "goal_name": "Emergency Fund",
      "transaction_description": "September Bonus"
    },
    {
      "id": "contrib-uuid-2",
      "goal_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 500.00,
      "contribution_type": "automatic",
      "notes": "Monthly automatic contribution",
      "created_at": "2025-09-01T10:00:00.000Z",
      "goal_name": "Emergency Fund"
    }
  ]
}
```

## Transaction with Goal Association

### Create Transaction with Goal Link (Income/Transfer only)
```json
{
  "amount": 2000.00,
  "type": "income",
  "description": "Freelance project payment",
  "category_id": "income-category-uuid",
  "account_id": "checking-account-uuid",
  "goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-09-28",
  "notes": "Allocating to emergency fund"
}
```

### Automatic Goal Contribution Creation
When a transaction is created with a `goal_id`, a goal contribution is automatically created:

```json
{
  "id": "auto-contrib-uuid",
  "goal_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid",
  "transaction_id": "transaction-uuid",
  "amount": 2000.00,
  "contribution_type": "transaction_linked",
  "notes": "Linked from transaction: Freelance project payment",
  "created_at": "2025-09-28T20:00:00.000Z"
}
```

## Error Responses

### Validation Error
```json
{
  "error": "Validation failed",
  "details": {
    "target_amount": "Target amount must be greater than 0",
    "name": "Goal name is required"
  }
}
```

### Authentication Error
```json
{
  "error": "User not authenticated",
  "message": "Please log in to access this resource"
}
```

### Not Found Error
```json
{
  "error": "Goal not found",
  "message": "The specified goal does not exist or you don't have permission to access it"
}
```

### Business Logic Error
```json
{
  "error": "Invalid goal association",
  "message": "Only income and transfer transactions can be linked to goals"
}
```

## Hook Usage Examples

### Using useGoals Hook
```typescript
import { useGoals } from '../hooks/useGoals';

function GoalListScreen() {
  const {
    goals,
    activeGoals,
    completedGoals,
    urgentGoals,
    totalGoals,
    overallProgress,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal
  } = useGoals();

  const handleCreateGoal = async () => {
    try {
      await createGoal({
        name: "Vacation Fund",
        target_amount: 5000,
        target_date: "2025-07-01",
        category: "vacation"
      });
    } catch (error: any) {
      console.error('Failed to create goal:', error);
    }
  };

  return (
    // Component JSX
  );
}
```

### Using useGoalDetail Hook
```typescript
import { useGoalDetail } from '../hooks/useGoalDetail';

function GoalDetailScreen({ route }) {
  const { goalId } = route.params;
  const {
    goal,
    contributions,
    totalContributions,
    averageContribution,
    loading,
    addContribution,
    deleteContribution
  } = useGoalDetail(goalId);

  const handleAddContribution = async () => {
    try {
      await addContribution({
        goal_id: goalId,
        amount: 250,
        notes: "Weekly savings"
      });
    } catch (error: any) {
      console.error('Failed to add contribution:', error);
    }
  };

  return (
    // Component JSX
  );
}
```