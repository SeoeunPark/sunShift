-- Add sleep notification toggle; deprecate fixed-time / unused notification flags
ALTER TABLE public.notification_settings
  ADD COLUMN IF NOT EXISTS sleep_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.notification_settings
  ALTER COLUMN before_shift_enabled SET DEFAULT FALSE,
  ALTER COLUMN off_day_enabled SET DEFAULT FALSE,
  ALTER COLUMN leave_enabled SET DEFAULT FALSE;
