-- Combined pending notification schema (safe to re-run)
-- Run in Supabase SQL Editor if npm run db:migrate is unavailable.

ALTER TABLE public.notification_settings
  ADD COLUMN IF NOT EXISTS sleep_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.notification_settings
  ALTER COLUMN before_shift_enabled SET DEFAULT FALSE,
  ALTER COLUMN off_day_enabled SET DEFAULT FALSE,
  ALTER COLUMN leave_enabled SET DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.notification_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  reference_date DATE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_dispatches_unique UNIQUE (user_id, kind, reference_date)
);

CREATE INDEX IF NOT EXISTS notification_dispatches_user_id_idx
  ON public.notification_dispatches(user_id);

ALTER TABLE public.notification_dispatches ENABLE ROW LEVEL SECURITY;
