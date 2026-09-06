-- SHIFT: Initial schema
-- Run order: 001

-- ---------------------------------------------------------------------------
-- Utility: auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  leave_total INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- shift_settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.shift_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_number INTEGER NOT NULL DEFAULT 4,
  base_date DATE NOT NULL,
  base_shift TEXT NOT NULL CHECK (base_shift IN ('A', 'B', 'C')),
  pattern_id TEXT NOT NULL DEFAULT 'four-group-6-2',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shift_settings_user_id_unique UNIQUE (user_id)
);

CREATE INDEX shift_settings_user_id_idx ON public.shift_settings(user_id);

CREATE TRIGGER shift_settings_set_updated_at
  BEFORE UPDATE ON public.shift_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- shift_definitions
-- ---------------------------------------------------------------------------
CREATE TABLE public.shift_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_settings_id UUID NOT NULL REFERENCES public.shift_settings(id) ON DELETE CASCADE,
  code TEXT NOT NULL CHECK (code IN ('A', 'B', 'C', 'OFF')),
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  start_time TIME,
  end_time TIME,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shift_definitions_settings_code_unique UNIQUE (shift_settings_id, code)
);

CREATE INDEX shift_definitions_settings_id_idx ON public.shift_definitions(shift_settings_id);

CREATE TRIGGER shift_definitions_set_updated_at
  BEFORE UPDATE ON public.shift_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- leave_records
-- ---------------------------------------------------------------------------
CREATE TABLE public.leave_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT leave_records_user_date_unique UNIQUE (user_id, date)
);

CREATE INDEX leave_records_user_id_idx ON public.leave_records(user_id);
CREATE INDEX leave_records_date_idx ON public.leave_records(date);

CREATE TRIGGER leave_records_set_updated_at
  BEFORE UPDATE ON public.leave_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- memo_records
-- ---------------------------------------------------------------------------
CREATE TABLE public.memo_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT memo_records_user_date_unique UNIQUE (user_id, date)
);

CREATE INDEX memo_records_user_id_idx ON public.memo_records(user_id);
CREATE INDEX memo_records_date_idx ON public.memo_records(date);

CREATE TRIGGER memo_records_set_updated_at
  BEFORE UPDATE ON public.memo_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notification_settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  today_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  today_time TIME NOT NULL DEFAULT '07:00',
  tomorrow_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  tomorrow_time TIME NOT NULL DEFAULT '20:00',
  before_shift_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  before_shift_minutes INTEGER NOT NULL DEFAULT 120,
  off_day_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  leave_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_settings_user_id_unique UNIQUE (user_id)
);

CREATE TRIGGER notification_settings_set_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- sleep_settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.sleep_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shift_code TEXT NOT NULL CHECK (shift_code IN ('A', 'B', 'C')),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notification_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sleep_settings_user_shift_unique UNIQUE (user_id, shift_code)
);

CREATE INDEX sleep_settings_user_id_idx ON public.sleep_settings(user_id);

CREATE TRIGGER sleep_settings_set_updated_at
  BEFORE UPDATE ON public.sleep_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New user bootstrap: profile + default shift/notification/sleep settings
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_settings_id UUID;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.shift_settings (user_id, group_number, base_date, base_shift, pattern_id)
  VALUES (NEW.id, 4, '2026-09-02', 'B', 'four-group-6-2')
  RETURNING id INTO new_settings_id;

  INSERT INTO public.shift_definitions (shift_settings_id, code, name, label, start_time, end_time, display_order)
  VALUES
    (new_settings_id, 'A', 'A조', '주간', '07:00', '15:00', 0),
    (new_settings_id, 'B', 'B조', '오후', '15:00', '23:00', 1),
    (new_settings_id, 'C', 'C조', '야간', '23:00', '07:00', 2),
    (new_settings_id, 'OFF', '휴무', '휴무', NULL, NULL, 3);

  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.sleep_settings (user_id, shift_code, enabled, notification_time)
  VALUES
    (NEW.id, 'A', TRUE, '22:30'),
    (NEW.id, 'B', TRUE, '00:30'),
    (NEW.id, 'C', TRUE, '08:00');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
