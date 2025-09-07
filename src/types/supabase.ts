export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
          balance: number;
          currency: string;
          is_active: boolean;
          institution_name: string | null;
          account_number_last_four: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
          balance?: number;
          currency?: string;
          is_active?: boolean;
          institution_name?: string | null;
          account_number_last_four?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
          balance?: number;
          currency?: string;
          is_active?: boolean;
          institution_name?: string | null;
          account_number_last_four?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string | null;
          amount: number;
          description: string;
          date: string;
          type: 'income' | 'expense' | 'transfer';
          is_recurring: boolean;
          recurring_frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          tags: string[];
          receipt_url: string | null;
          notes: string | null;
          transfer_to_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id?: string | null;
          amount: number;
          description: string;
          date?: string;
          type: 'income' | 'expense' | 'transfer';
          is_recurring?: boolean;
          recurring_frequency?: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          tags?: string[];
          receipt_url?: string | null;
          notes?: string | null;
          transfer_to_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          category_id?: string | null;
          amount?: number;
          description?: string;
          date?: string;
          type?: 'income' | 'expense' | 'transfer';
          is_recurring?: boolean;
          recurring_frequency?: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          tags?: string[];
          receipt_url?: string | null;
          notes?: string | null;
          transfer_to_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          spent_amount: number;
          category_id: string | null;
          period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
          start_date: string;
          end_date: string;
          alert_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          spent_amount?: number;
          category_id?: string | null;
          period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
          start_date: string;
          end_date: string;
          alert_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          spent_amount?: number;
          category_id?: string | null;
          period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
          start_date?: string;
          end_date?: string;
          alert_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          icon: string;
          color: string;
          parent_category_id: string | null;
          is_system_default: boolean;
          transaction_type: 'income' | 'expense' | 'transfer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          icon?: string;
          color?: string;
          parent_category_id?: string | null;
          is_system_default?: boolean;
          transaction_type?: 'income' | 'expense' | 'transfer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          icon?: string;
          color?: string;
          parent_category_id?: string | null;
          is_system_default?: boolean;
          transaction_type?: 'income' | 'expense' | 'transfer';
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          description: string | null;
          is_achieved: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          target_date?: string | null;
          description?: string | null;
          is_achieved?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
          description?: string | null;
          is_achieved?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stripe_customers: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          email?: string | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';
          current_period_start: string;
          current_period_end: string;
          premium_features_enabled: boolean;
          plan_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';
          current_period_start: string;
          current_period_end: string;
          premium_features_enabled?: boolean;
          plan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';
          current_period_start?: string;
          current_period_end?: string;
          premium_features_enabled?: boolean;
          plan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          stripe_price_id: string;
          name: string;
          amount: number;
          currency: string;
          interval: string;
          features: any;
          max_transactions: number | null;
          max_accounts: number | null;
          max_budgets: number | null;
          can_export_data: boolean;
          can_use_advanced_analytics: boolean;
          can_use_recurring_transactions: boolean;
          can_attach_receipts: boolean;
          can_set_custom_categories: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          stripe_price_id: string;
          name: string;
          amount: number;
          currency?: string;
          interval?: string;
          features?: any;
          max_transactions?: number | null;
          max_accounts?: number | null;
          max_budgets?: number | null;
          can_export_data?: boolean;
          can_use_advanced_analytics?: boolean;
          can_use_recurring_transactions?: boolean;
          can_attach_receipts?: boolean;
          can_set_custom_categories?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          stripe_price_id?: string;
          name?: string;
          amount?: number;
          currency?: string;
          interval?: string;
          features?: any;
          max_transactions?: number | null;
          max_accounts?: number | null;
          max_budgets?: number | null;
          can_export_data?: boolean;
          can_use_advanced_analytics?: boolean;
          can_use_recurring_transactions?: boolean;
          can_attach_receipts?: boolean;
          can_set_custom_categories?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      webhook_logs: {
        Row: {
          id: string;
          stripe_event_id: string;
          event_type: string;
          processed: boolean;
          data: any;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stripe_event_id: string;
          event_type: string;
          processed?: boolean;
          data: any;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          stripe_event_id?: string;
          event_type?: string;
          processed?: boolean;
          data?: any;
          error?: string | null;
          created_at?: string;
        };
      };
    };
  };
}