-- SHIFT: Row Level Security policies
-- Run order: 002 (after 001)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memo_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_settings ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- shift_settings
CREATE POLICY "shift_settings_select_own"
  ON public.shift_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "shift_settings_insert_own"
  ON public.shift_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "shift_settings_update_own"
  ON public.shift_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "shift_settings_delete_own"
  ON public.shift_settings FOR DELETE
  USING (auth.uid() = user_id);

-- shift_definitions (via parent shift_settings ownership)
CREATE POLICY "shift_definitions_select_own"
  ON public.shift_definitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shift_settings ss
      WHERE ss.id = shift_definitions.shift_settings_id
        AND ss.user_id = auth.uid()
    )
  );

CREATE POLICY "shift_definitions_insert_own"
  ON public.shift_definitions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shift_settings ss
      WHERE ss.id = shift_definitions.shift_settings_id
        AND ss.user_id = auth.uid()
    )
  );

CREATE POLICY "shift_definitions_update_own"
  ON public.shift_definitions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shift_settings ss
      WHERE ss.id = shift_definitions.shift_settings_id
        AND ss.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shift_settings ss
      WHERE ss.id = shift_definitions.shift_settings_id
        AND ss.user_id = auth.uid()
    )
  );

CREATE POLICY "shift_definitions_delete_own"
  ON public.shift_definitions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shift_settings ss
      WHERE ss.id = shift_definitions.shift_settings_id
        AND ss.user_id = auth.uid()
    )
  );

-- leave_records
CREATE POLICY "leave_records_select_own"
  ON public.leave_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "leave_records_insert_own"
  ON public.leave_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leave_records_update_own"
  ON public.leave_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leave_records_delete_own"
  ON public.leave_records FOR DELETE
  USING (auth.uid() = user_id);

-- memo_records
CREATE POLICY "memo_records_select_own"
  ON public.memo_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "memo_records_insert_own"
  ON public.memo_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "memo_records_update_own"
  ON public.memo_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "memo_records_delete_own"
  ON public.memo_records FOR DELETE
  USING (auth.uid() = user_id);

-- notification_settings
CREATE POLICY "notification_settings_select_own"
  ON public.notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notification_settings_insert_own"
  ON public.notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_settings_update_own"
  ON public.notification_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_settings_delete_own"
  ON public.notification_settings FOR DELETE
  USING (auth.uid() = user_id);

-- sleep_settings
CREATE POLICY "sleep_settings_select_own"
  ON public.sleep_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sleep_settings_insert_own"
  ON public.sleep_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sleep_settings_update_own"
  ON public.sleep_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sleep_settings_delete_own"
  ON public.sleep_settings FOR DELETE
  USING (auth.uid() = user_id);
