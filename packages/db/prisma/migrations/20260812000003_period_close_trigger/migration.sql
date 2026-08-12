-- Prevent modifications to JournalLine if the accounting period is CLOSED or LOCKED

CREATE OR REPLACE FUNCTION check_accounting_period_status()
RETURNS TRIGGER AS $$
DECLARE
    entry_period_id TEXT;
    period_status "AccountingPeriodStatus";
BEGIN
    -- For INSERT or UPDATE, check the NEW journal entry
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        SELECT "accountingPeriodId" INTO entry_period_id
        FROM "JournalEntry"
        WHERE id = NEW."journalEntryId";
    -- For DELETE, check the OLD journal entry
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT "accountingPeriodId" INTO entry_period_id
        FROM "JournalEntry"
        WHERE id = OLD."journalEntryId";
    END IF;

    -- If no period is linked, allow the operation
    IF entry_period_id IS NULL THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Get the period status
    SELECT status INTO period_status
    FROM "AccountingPeriod"
    WHERE id = entry_period_id;

    -- Block if CLOSED or LOCKED
    IF period_status IN ('CLOSED', 'LOCKED') THEN
        RAISE EXCEPTION 'Cannot modify journal lines in a % accounting period (Period ID: %)', period_status, entry_period_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "journal_line_period_check"
BEFORE INSERT OR UPDATE OR DELETE ON "JournalLine"
FOR EACH ROW
EXECUTE FUNCTION check_accounting_period_status();
