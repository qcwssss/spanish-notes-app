# 数据库升级脚本 (Database Migration Script)

这个文档包含了将您的数据库升级为支持 **多语言** 和 **激活码风控系统** 的完整 SQL 脚本。

请按顺序在 Supabase 的 **SQL Editor** 中运行以下代码块。

---

## 第一步：多语言支持 (Multi-language Support)

这会给现有的笔记表增加语言字段，默认为西班牙语 (`es`)，确保旧数据不受影响。

```sql
-- 给 notes 表添加目标语言字段
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS target_language TEXT DEFAULT 'es';

COMMENT ON COLUMN notes.target_language IS 'ISO 639-1 language code (es, en, fr, de, etc.)';
```

---

## 第二步：用户档案与激活码系统 (User Profiles & Activation Codes)

这部分建立了用户权限管理的基础。

```sql
-- 1. 创建用户档案表 (用于存储额度、激活状态)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  is_active BOOLEAN DEFAULT false,           -- 默认为未激活
  storage_used BIGINT DEFAULT 0,             -- 已用存储空间 (字节)
  plan_type TEXT DEFAULT 'free',             -- free, pro
  target_language TEXT DEFAULT NULL,         -- 目标语言（首次保存后锁定）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 如果之前已创建表，请补充字段
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS target_language TEXT DEFAULT NULL;

-- 开启 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 允许用户查看自己的档案
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT USING (auth.uid() = id);

-- 2. 创建激活码表
CREATE TABLE IF NOT EXISTS activation_codes (
  code TEXT PRIMARY KEY,           -- 激活码字符串 (如 "VIP-2026")
  max_uses INT DEFAULT 1,          -- 最大使用次数
  used_count INT DEFAULT 0,        -- 当前已用次数
  plan_type TEXT DEFAULT 'free',   -- 该码对应的会员等级
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 激活码表不需要 RLS (通常只在后端逻辑或 Postgres Function 中访问)
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
```

---

## 第三步：自动化与风控逻辑 (Automation & Security)

这部分确保新用户自动拥有档案，并且只有激活用户才能写笔记。

```sql
-- 1. 自动触发器：当新用户注册时，自动在 user_profiles 表中创建记录
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 绑定到 auth.users 表 (如果触发器已存在，这行可能会报错，可忽略)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. 核心函数：激活用户逻辑
-- 前端调用这个函数，传入激活码
CREATE OR REPLACE FUNCTION redeem_activation_code(input_code TEXT)
RETURNS TEXT -- 返回结果消息
LANGUAGE plpgsql SECURITY DEFINER -- 以系统权限运行，从而能修改 user_profiles
AS $$
DECLARE
  code_record RECORD;
  user_status BOOLEAN;
BEGIN
  -- 1. 检查用户是否已经激活
  SELECT is_active INTO user_status FROM user_profiles WHERE id = auth.uid();
  IF user_status = true THEN
    RETURN 'Already activated';
  END IF;

  -- 2. 查找并锁定激活码 (防止并发问题)
  SELECT * INTO code_record FROM activation_codes 
  WHERE code = input_code FOR UPDATE;

  -- 3. 验证激活码
  IF code_record IS NULL THEN
    RETURN 'Invalid code';
  END IF;

  IF code_record.used_count >= code_record.max_uses THEN
    RETURN 'Code fully used';
  END IF;

  -- 4. 执行激活
  -- 增加使用次数
  UPDATE activation_codes 
  SET used_count = used_count + 1 
  WHERE code = input_code;

  -- 更新用户状态
  UPDATE user_profiles 
  SET is_active = true, 
      plan_type = code_record.plan_type 
  WHERE id = auth.uid();

  RETURN 'Success';
END;
$$;
```

## 第四步：存储使用量自动更新 (Storage Usage Tracking)

这部分会在每次新建/更新/删除笔记后更新 `user_profiles.storage_used`。

```sql
CREATE OR REPLACE FUNCTION public.refresh_storage_used()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);

  UPDATE user_profiles
  SET storage_used = COALESCE((
    SELECT SUM(octet_length(content))
    FROM notes
    WHERE user_id = target_user_id
  ), 0)
  WHERE id = target_user_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notes_refresh_storage_used ON notes;
CREATE TRIGGER notes_refresh_storage_used
  AFTER INSERT OR UPDATE OR DELETE ON notes
  FOR EACH ROW EXECUTE PROCEDURE public.refresh_storage_used();
```

---

## 第四步：增强安全策略 (Enforce Security)

**注意**：这一步会修改 `notes` 表的写入权限。执行后，`is_active` 为 `false` 的用户将**无法新建笔记**。

```sql
-- 删除旧的插入策略
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;

-- 创建新的插入策略：必须是本人 AND 必须已激活
CREATE POLICY "Active users can insert notes" 
  ON notes FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND 
    (SELECT is_active FROM user_profiles WHERE id = auth.uid()) = true
  );
```

---

## 第五步：测试数据 (Test Data)

生成几个测试用的激活码。

```sql
-- 插入一个可以用 100 次的通用测试码
INSERT INTO activation_codes (code, max_uses, plan_type) 
VALUES ('HAILMARY', 10, 'beta_access')
ON CONFLICT (code) DO NOTHING;

-- 插入一个只能用 1 次的 VIP 码
INSERT INTO activation_codes (code, max_uses, plan_type) 
VALUES ('VIP-ONLY-ONE', 1, 'pro_plan')
ON CONFLICT (code) DO NOTHING;
```
