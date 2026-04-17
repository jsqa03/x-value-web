-- ═══════════════════════════════════════════════════════════════════════════
--  X-Value Finance — Migration 002: Dual-currency (COP / USD) support
--  Run in Supabase SQL Editor after migration 001.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── contracts: add bimonetary columns ──────────────────────────────────────
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS currency      text DEFAULT 'COP'
    CHECK (currency IN ('USD','COP')),
  ADD COLUMN IF NOT EXISTS setup_fee     numeric(15,2)
    CHECK (setup_fee IS NULL OR setup_fee >= 0),
  ADD COLUMN IF NOT EXISTS monthly_fee   numeric(15,2)
    CHECK (monthly_fee IS NULL OR monthly_fee >= 0);

-- ─── expenses: add currency column ──────────────────────────────────────────
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'COP'
    CHECK (currency IN ('USD','COP'));

-- ─── payments: allow decimal amounts for USD ─────────────────────────────────
-- bigint → numeric(15,2) so USD cents-precision is preserved without lossy casting
ALTER TABLE payments
  ALTER COLUMN amount TYPE numeric(15,2) USING amount::numeric(15,2);

-- ─── commissions: allow decimal base/commission amounts for USD ───────────────
ALTER TABLE commissions
  ALTER COLUMN base_amount       TYPE numeric(15,2) USING base_amount::numeric(15,2),
  ALTER COLUMN commission_amount TYPE numeric(15,2) USING commission_amount::numeric(15,2);

-- ─── Backfill: set currency on existing contracts ────────────────────────────
UPDATE contracts SET currency = 'USD' WHERE service_type = 'X-Value AI'    AND currency IS NULL;
UPDATE contracts SET currency = 'COP' WHERE service_type = 'X-VALUE GROWTH' AND currency IS NULL;
