/*
  # Validate Transfer Currency

  1. Problem
    - Users can currently transfer between accounts with different currencies
    - This can cause data inconsistency and confusion
    - Need to validate that both accounts have the same currency

  2. Solution
    - Create a function to validate currency compatibility
    - Add trigger to check currency before allowing transfers
    - Return clear error message if currencies don't match
*/

-- Function to validate transfer currency compatibility
CREATE OR REPLACE FUNCTION validate_transfer_currency()
RETURNS trigger AS $$
DECLARE
  source_currency TEXT;
  destination_currency TEXT;
BEGIN
  -- Only validate transfers
  IF NEW.type != 'transfer' OR NEW.transfer_to_account_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get source account currency
  SELECT currency INTO source_currency
  FROM accounts 
  WHERE id = NEW.account_id AND user_id = NEW.user_id;

  -- Get destination account currency
  SELECT currency INTO destination_currency
  FROM accounts 
  WHERE id = NEW.transfer_to_account_id AND user_id = NEW.user_id;

  -- Check if currencies exist (accounts found)
  IF source_currency IS NULL THEN
    RAISE EXCEPTION 'Source account not found or does not belong to user';
  END IF;

  IF destination_currency IS NULL THEN
    RAISE EXCEPTION 'Destination account not found or does not belong to user';
  END IF;

  -- Validate that currencies match
  IF source_currency != destination_currency THEN
    RAISE EXCEPTION 'Cannot transfer between accounts with different currencies. Source: %, Destination: %', 
      source_currency, destination_currency;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate transfer currency before insert/update
DROP TRIGGER IF EXISTS validate_transfer_currency_trigger ON transactions;
CREATE TRIGGER validate_transfer_currency_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION validate_transfer_currency();
