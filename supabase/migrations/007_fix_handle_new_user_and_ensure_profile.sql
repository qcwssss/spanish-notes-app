-- Migration: 修复 handle_new_user 函数 + 添加 ensure_user_profile 兜底函数
-- Date: 2026-02-22
-- 问题: 生产环境的 handle_new_user() 仍是旧版本，不包含 user_profiles INSERT 逻辑
-- 修复: 重新定义 handle_new_user() 并添加 ensure_user_profile() 兜底 RPC

-- Step 1: 修复 handle_new_user（包含 user_profiles INSERT）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_collection_id uuid;
BEGIN
  -- 创建用户 profile
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- 创建默认 collection
  INSERT INTO public.collections (user_id, name, is_default)
  VALUES (NEW.id, 'My Collection', true)
  RETURNING id INTO new_collection_id;

  -- 创建默认 folder
  INSERT INTO public.folders (user_id, collection_id, name, is_default)
  VALUES (NEW.id, new_collection_id, 'My Notes', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: 兜底函数，前端查不到 profile 时调用
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, is_active)
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    false
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Step 3: 为已存在但缺少 profile 的用户补创建
INSERT INTO public.user_profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
);
