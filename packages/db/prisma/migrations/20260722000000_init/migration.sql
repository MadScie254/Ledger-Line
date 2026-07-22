-- Ledgerline double-entry enforcement. Prisma creates the tables; this migration adds database-side guardrails.

ALTER TABLE "JournalLine"
  ADD CONSTRAINT "journal_line_non_negative_amounts"
  CHECK ("debit" >= 0 AND "credit" >= 0);

ALTER TABLE "JournalLine"
  ADD CONSTRAINT "journal_line_one_sided_amount"
  CHECK (("debit" > 0 AND "credit" = 0) OR ("credit" > 0 AND "debit" = 0));

CREATE OR REPLACE FUNCTION enforce_balanced_journal_entry()
RETURNS trigger AS $$
DECLARE
  affected_entry_id text;
  debit_total numeric;
  credit_total numeric;
  line_count integer;
BEGIN
  affected_entry_id := COALESCE(NEW."journalEntryId", OLD."journalEntryId");

  SELECT
    COALESCE(SUM("debit"), 0),
    COALESCE(SUM("credit"), 0),
    COUNT(*)
  INTO debit_total, credit_total, line_count
  FROM "JournalLine"
  WHERE "journalEntryId" = affected_entry_id;

  IF line_count < 2 THEN
    RAISE EXCEPTION 'JournalEntry % must have at least two lines', affected_entry_id;
  END IF;

  IF debit_total <> credit_total THEN
    RAISE EXCEPTION 'JournalEntry % is unbalanced: debit % credit %', affected_entry_id, debit_total, credit_total;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "journal_entry_balance_check"
AFTER INSERT OR UPDATE OR DELETE ON "JournalLine"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION enforce_balanced_journal_entry();
