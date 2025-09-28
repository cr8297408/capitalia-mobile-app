/*
  # Fix Account Balance Logic

  1. Problem
    - Current update_account_balance() function incorrectly handles transaction types
    - Expenses should subtract from balance, not add
    - Transfer logic is backwards
    - Need to use ABS() to ensure consistent amount handling

  2. Solution
    - Fix balance calculation logic for all transaction types:
      - Income: Add to balance
      - Expense: Subtract from balance  
      - Transfer: Subtract from source, add to destination
    - Use ABS(amount) to handle both positive and negative amounts correctly
*/

-- Function to update account balance on transaction changes (CORRECTED)
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS trigger AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    -- Update the main account balance based on transaction type
    IF NEW.type = 'income' THEN
      -- Income: Add to account balance
      UPDATE accounts 
      SET balance = balance + ABS(NEW.amount),
          updated_at = now()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      -- Expense: Subtract from account balance
      UPDATE accounts 
      SET balance = balance - ABS(NEW.amount),
          updated_at = now()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' AND NEW.transfer_to_account_id IS NOT NULL THEN
      -- Transfer: Subtract from source account, add to destination account
      UPDATE accounts 
      SET balance = balance - ABS(NEW.amount),
          updated_at = now()
      WHERE id = NEW.account_id;
      
      UPDATE accounts 
      SET balance = balance + ABS(NEW.amount),
          updated_at = now()
      WHERE id = NEW.transfer_to_account_id;
    END IF;
    
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Revert old transaction effect
    IF OLD.type = 'income' THEN
      UPDATE accounts 
      SET balance = balance - ABS(OLD.amount),
          updated_at = now()
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts 
      SET balance = balance + ABS(OLD.amount),
          updated_at = now()
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' AND OLD.transfer_to_account_id IS NOT NULL THEN
      -- Revert transfer: add back to source, subtract from destination
      UPDATE accounts 
      SET balance = balance + ABS(OLD.amount),
          updated_at = now()
      WHERE id = OLD.account_id;
      
      UPDATE accounts 
      SET balance = balance - ABS(OLD.amount),
          updated_at = now()
      WHERE id = OLD.transfer_to_account_id;
    END IF;
    
    -- Apply new transaction effect
    IF NEW.type = 'income' THEN
      UPDATE accounts 
      SET balance = balance + ABS(NEW.amount),
          updated_at = now()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts 
      SET balance = balance - ABS(NEW.amount),
          updated_at = now()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' AND NEW.transfer_to_account_id IS NOT NULL THEN
      UPDATE accounts 
      SET balance = balance - ABS(NEW.amount),
          updated_at = now()
      WHERE id = NEW.account_id;
      
      UPDATE accounts 
      SET balance = balance + ABS(NEW.amount),
          updated_at = now()
      WHERE id = NEW.transfer_to_account_id;
    END IF;
    
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    -- Revert the transaction effect
    IF OLD.type = 'income' THEN
      UPDATE accounts 
      SET balance = balance - ABS(OLD.amount),
          updated_at = now()
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts 
      SET balance = balance + ABS(OLD.amount),
          updated_at = now()
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' AND OLD.transfer_to_account_id IS NOT NULL THEN
      -- Revert transfer: add back to source, subtract from destination
      UPDATE accounts 
      SET balance = balance + ABS(OLD.amount),
          updated_at = now()
      WHERE id = OLD.account_id;
      
      UPDATE accounts 
      SET balance = balance - ABS(OLD.amount),
          updated_at = now()
      WHERE id = OLD.transfer_to_account_id;
    END IF;
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
