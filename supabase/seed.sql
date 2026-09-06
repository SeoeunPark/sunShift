# SHIFT — Supabase Seed (Development Only)
#
# Usage: Run manually in Supabase SQL Editor after migrations.
# Do NOT use in production with real personal data.

-- Example test user data is created automatically via handle_new_user trigger
-- when a user signs up through Supabase Auth.
--
-- To verify schema after signup:
-- SELECT * FROM profiles WHERE id = auth.uid();
-- SELECT * FROM shift_settings WHERE user_id = auth.uid();
-- SELECT * FROM shift_definitions WHERE shift_settings_id IN (
--   SELECT id FROM shift_settings WHERE user_id = auth.uid()
-- );
