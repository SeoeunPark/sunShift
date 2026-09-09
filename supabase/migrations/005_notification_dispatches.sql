-- SHIFT: Dedup log for scheduled push notifications
-- Run order: 005 (after 004)

CREATE TABLE public.notification_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  reference_date DATE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_dispatches_unique UNIQUE (user_id, kind, reference_date)
);

CREATE INDEX notification_dispatches_user_id_idx ON public.notification_dispatches(user_id);

ALTER TABLE public.notification_dispatches ENABLE ROW LEVEL SECURITY;

-- Service role (cron dispatch) bypasses RLS.
