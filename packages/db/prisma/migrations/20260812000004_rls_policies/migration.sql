-- Migration: 20260812000004_rls_policies
-- Phase 7: Row-Level Security policies for tenant isolation
-- Every table that stores org-scoped data gets a policy so that the
-- Supabase Authenticated role can only see rows for their own org.
-- The service-role key bypasses RLS entirely (used by server-side code).

-- ──────────────────────────────────────────────────────────────────────────
-- Helper function: extract org_id from the JWT claims
-- Reads from app_metadata first (authoritative), user_metadata as fallback.
-- Placed in public schema because the auth schema is managed by Supabase.
-- SECURITY DEFINER is required only so it can read jwt claims; we restrict
-- it to authenticated and service_role to prevent anon abuse.
-- ──────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.ledgerline_org_id() RETURNS text
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'orgId'),
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'orgId'),
      ''
    )
  $$;

REVOKE ALL ON FUNCTION public.ledgerline_org_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ledgerline_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ledgerline_org_id() TO service_role;

-- ──────────────────────────────────────────────────────────────────────────
-- Enable RLS on every org-scoped table
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE public."Organization"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AccountingPeriod"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLogEntry"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Attachment"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BankConnection"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BankRule"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BankTransaction"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Bill"                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BillLine"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BillPayment"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BillPaymentAllocation"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Budget"                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Customer"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Employee"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Estimate"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EstimateLine"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExchangeRate"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Expense"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ImportBatch"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Integration"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InvoiceLine"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."JournalEntry"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."JournalLine"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrgMembership"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PayRun"                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PaymentReceived"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PaymentReceivedAllocation"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payslip"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Product"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Project"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PurchaseOrder"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RecurringTemplate"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Role"                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SalesOrder"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SalesReceipt"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SavedReport"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TaxRate"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TaxReturn"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TimeEntry"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User"                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Vendor"                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WorkspaceRecord"              ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────────────
-- Direct org-scoped table policies (orgId column)
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "org_isolation" ON public."Organization"
  TO authenticated USING (id = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Account"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."AccountingPeriod"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."AuditLogEntry"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Attachment"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Customer"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Vendor"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Product"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Invoice"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Bill"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Expense"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."JournalEntry"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."ImportBatch"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."PaymentReceived"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."BillPayment"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."OrgMembership"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Budget"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Employee"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."PayRun"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Project"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."TaxRate"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."TaxReturn"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."RecurringTemplate"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."SavedReport"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."WorkspaceRecord"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Integration"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Role"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."BankConnection"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."BankRule"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."TimeEntry"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."Estimate"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."PurchaseOrder"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."SalesOrder"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

CREATE POLICY "org_isolation" ON public."SalesReceipt"
  TO authenticated USING ("orgId" = public.ledgerline_org_id());

-- ──────────────────────────────────────────────────────────────────────────
-- Child-table policies (scoped through parent's orgId)
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "org_isolation" ON public."JournalLine"
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."JournalEntry" je
    WHERE je.id = "JournalLine"."journalEntryId"
      AND je."orgId" = public.ledgerline_org_id()
  ));

CREATE POLICY "org_isolation" ON public."InvoiceLine"
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."Invoice" i
    WHERE i.id = "InvoiceLine"."invoiceId"
      AND i."orgId" = public.ledgerline_org_id()
  ));

CREATE POLICY "org_isolation" ON public."BillLine"
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."Bill" b
    WHERE b.id = "BillLine"."billId"
      AND b."orgId" = public.ledgerline_org_id()
  ));

CREATE POLICY "org_isolation" ON public."PaymentReceivedAllocation"
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."PaymentReceived" pr
    WHERE pr.id = "PaymentReceivedAllocation"."paymentReceivedId"
      AND pr."orgId" = public.ledgerline_org_id()
  ));

CREATE POLICY "org_isolation" ON public."BillPaymentAllocation"
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."BillPayment" bp
    WHERE bp.id = "BillPaymentAllocation"."billPaymentId"
      AND bp."orgId" = public.ledgerline_org_id()
  ));

CREATE POLICY "org_isolation" ON public."BankTransaction"
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."BankConnection" bc
    WHERE bc.id = "BankTransaction"."bankConnectionId"
      AND bc."orgId" = public.ledgerline_org_id()
  ));

CREATE POLICY "org_isolation" ON public."Payslip"
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."PayRun" pr
    WHERE pr.id = "Payslip"."payRunId"
      AND pr."orgId" = public.ledgerline_org_id()
  ));

CREATE POLICY "org_isolation" ON public."EstimateLine"
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."Estimate" e
    WHERE e.id = "EstimateLine"."estimateId"
      AND e."orgId" = public.ledgerline_org_id()
  ));

-- ──────────────────────────────────────────────────────────────────────────
-- Special policies
-- ──────────────────────────────────────────────────────────────────────────

-- User: each user may only see their own row
CREATE POLICY "self_isolation" ON public."User"
  TO authenticated
  USING (id = (select auth.uid()::text));

-- ExchangeRate: reference data, readable by all authenticated users
CREATE POLICY "read_all" ON public."ExchangeRate"
  FOR SELECT TO authenticated USING (true);

-- Notification: user-scoped (not org-scoped)
CREATE POLICY "self_isolation" ON public."Notification"
  TO authenticated
  USING ("userId" = (select auth.uid()::text));
