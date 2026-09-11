-- Add leave types: 연중휴가 (annual) and 야간케어 휴가 (night_care)

ALTER TABLE public.leave_records
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'annual'
  CHECK (type IN ('annual', 'night_care'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS night_care_leave_total INTEGER NOT NULL DEFAULT 0;
