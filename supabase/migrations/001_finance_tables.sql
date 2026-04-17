-- ═══════════════════════════════════════════════════════════════════════════
--  X-Value Finance Module — Migration 001
--  Run this script in your Supabase SQL Editor (Settings → SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Contracts (activated clients) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id              uuid REFERENCES leads(id)    ON DELETE SET NULL,
  client_name          text NOT NULL,
  service_type         text NOT NULL CHECK (service_type IN ('X-Value AI', 'X-VALUE GROWTH')),

  -- Team at time of closing
  assigned_sales_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_manager_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,

  -- Financials (integer pesos — no decimal drift)
  closing_amount       bigint NOT NULL CHECK (closing_amount > 0),

  -- X-VALUE GROWTH fee escalation (NULL for X-Value AI)
  fee_month_1_2        bigint CHECK (fee_month_1_2   IS NULL OR fee_month_1_2   > 0),
  fee_month_3_plus     bigint CHECK (fee_month_3_plus IS NULL OR fee_month_3_plus > 0),

  -- Key dates — first_payment_date is "Day 0" of the billing cycle
  contract_signed_date date NOT NULL,
  first_payment_date   date NOT NULL,

  status               text DEFAULT 'active' CHECK (status IN ('active','inactive','cancelled')),
  notes                text,

  created_by           uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at           timestamptz DEFAULT now() NOT NULL,
  updated_at           timestamptz DEFAULT now() NOT NULL
);

-- ─── Payment schedule (auto-generated on client activation) ─────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id      uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,

  -- payment_month: integer starting at 1 — drives fee escalation & commissions
  payment_month    int  NOT NULL CHECK (payment_month >= 1),
  scheduled_date   date NOT NULL,
  paid_date        date,                          -- NULL = not yet paid
  amount           bigint NOT NULL CHECK (amount > 0),

  notes            text,
  registered_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now() NOT NULL,

  -- Hard duplicate prevention
  UNIQUE (contract_id, payment_month)
);

-- ─── Company expenses ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date    date NOT NULL,
  concept         text NOT NULL,
  amount          bigint NOT NULL CHECK (amount > 0),
  category        text NOT NULL,
  responsible_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

-- ─── Commissions (pre-calculated at contract activation) ─────────────────────
-- Commission logic (HARD-CODED, no exceptions):
--   X-Value AI       → Manager 3% of closing_amount, payment_month = 1, commission_type = 'one_time'
--   X-VALUE GROWTH   → Sales  10% of fee_month_1_2   for payment_month IN (1,2), type = 'monthly'
--   X-VALUE GROWTH   → Manager 10% of fee_month_3_plus for payment_month IN (3,4), type = 'monthly'
CREATE TABLE IF NOT EXISTS commissions (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id       uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,

  beneficiary_id    uuid REFERENCES profiles(id)  ON DELETE CASCADE NOT NULL,
  beneficiary_role  text NOT NULL CHECK (beneficiary_role IN ('sales','manager')),

  service_type      text NOT NULL,
  payment_month     int  NOT NULL CHECK (payment_month >= 1),
  commission_type   text NOT NULL CHECK (commission_type IN ('one_time','monthly')),

  base_amount       bigint       NOT NULL CHECK (base_amount > 0),
  rate              numeric(6,4) NOT NULL,
  commission_amount bigint       NOT NULL CHECK (commission_amount >= 0),

  created_at        timestamptz DEFAULT now() NOT NULL,

  -- Strict duplicate prevention
  UNIQUE (contract_id, beneficiary_id, payment_month, commission_type)
);

-- ─── Indexes for common query patterns ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contracts_lead_id         ON contracts  (lead_id);
CREATE INDEX IF NOT EXISTS idx_contracts_sales_id        ON contracts  (assigned_sales_id);
CREATE INDEX IF NOT EXISTS idx_contracts_manager_id      ON contracts  (assigned_manager_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id      ON payments   (contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_scheduled_date   ON payments   (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_payments_paid_date        ON payments   (paid_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date             ON expenses   (expense_date);
CREATE INDEX IF NOT EXISTS idx_commissions_beneficiary   ON commissions(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_commissions_contract_id   ON commissions(contract_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────
-- All mutations go through the service-role key in server actions (bypasses RLS).
-- Enable RLS to future-proof; all access works via service-role.
ALTER TABLE contracts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- ─── Convenience: updated_at trigger for contracts ───────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS contracts_updated_at ON contracts;
CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
