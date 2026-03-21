-- Auto-create profile on user signup
-- This ensures a profile always exists when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, nickname, avatar_letter)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_letter', '?')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also insert profile for any existing auth users that don't have one yet
INSERT INTO public.profiles (id, full_name, nickname, avatar_letter)
SELECT id, '', '', '?'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
