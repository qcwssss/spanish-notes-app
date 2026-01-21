# 文件夹系统设计文档 (Collection-Folder System Design)

**日期**: 2026-01-19
**状态**: Draft V4 (Final)
**变更**: 采用 "简化版 + Eager Create" 方案。

## 1. 目标 (Goal)

### 1.1 V1 简化版策略

| 层级 | 数据库 | UI 显示 |
|------|--------|---------|
| Collection | ✅ 保留表结构 | ❌ 隐藏（未来扩展用） |
| Folder | ✅ 完整实现 | ✅ 显示 |
| Note | ✅ 完整实现 | ✅ 显示 |

**策略**: 数据库保留三层结构以便未来扩展，但 V1 UI 只显示 **Folder > Note** 两层。

### 1.2 默认命名

| 层级 | 默认名称 | is_default |
|------|----------|------------|
| Collection | `"My Collection"` | `true` |
| Folder | `"My Notes"` | `true` |

### 1.3 核心设计理念：虚拟默认 + 渐进显示

**问题**: 如何让新用户体验简单（无需创建文件夹），同时支持高级用户的组织需求？

**解决方案**:
1. **Eager Create**: 用户注册时，通过 **Database Trigger** 自动创建默认 Collection 和 Folder
2. **永不为空**: 新笔记自动放入默认 Folder，`folder_id` 永远不为 NULL
3. **渐进显示**: UI 根据用户是否有"真正的"（非默认）文件夹来决定显示模式：
   - **无真正文件夹** → 显示扁平笔记列表（简单模式）
   - **有文件夹** → 显示层级结构（高级模式）

**优势**:
- 新用户零配置即可使用
- 数据库设计简洁（无 NULL 处理）
- 用户体验随复杂度自然增长
- Database Trigger 保证数据一致性

## 2. 数据库设计 (Database Schema)

### 2.1 新增 `collections` 表 (Level 1)
顶层容器。

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `gen_random_uuid()` | 主键 |
| `user_id` | `uuid` | NOT NULL | 外键，关联 `auth.users.id`，集合所有者 |
| `name` | `text` | NOT NULL | 集合名称 |
| `is_default` | `boolean` | `false` | **标记虚拟默认集合** |
| `created_at` | `timestamptz` | `now()` | 创建时间 |

**索引**: `CREATE INDEX idx_collections_user_id ON collections(user_id);`

**外键约束**:
```sql
ALTER TABLE collections
  ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;
```

**唯一约束**: 每个用户只能有一个默认集合
```sql
CREATE UNIQUE INDEX idx_collections_default 
  ON collections(user_id) 
  WHERE is_default = true;
```

### 2.2 新增 `folders` 表 (Level 2)
中间层容器，必须归属于一个 Collection。

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `gen_random_uuid()` | 主键 |
| `collection_id` | `uuid` | NOT NULL | 外键，关联 `collections(id)` |
| `user_id` | `uuid` | NOT NULL | 外键，关联 `auth.users.id`（冗余存储，简化 RLS）|
| `name` | `text` | NOT NULL | 文件夹名称 |
| `is_default` | `boolean` | `false` | **标记虚拟默认文件夹** |
| `created_at` | `timestamptz` | `now()` | 创建时间 |

**索引**: `CREATE INDEX idx_folders_user_id ON folders(user_id);`

**外键约束**:
```sql
ALTER TABLE folders
  ADD CONSTRAINT fk_collection
  FOREIGN KEY (collection_id) REFERENCES collections(id)
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;
```

**唯一约束**: 每个用户只能有一个默认文件夹
```sql
CREATE UNIQUE INDEX idx_folders_default 
  ON folders(user_id) 
  WHERE is_default = true;
```

> **设计说明**: `user_id` 可通过 `collection_id` 推导，但直接存储可简化 RLS 策略、提升查询性能。

### 2.3 修改 `notes` 表 (Level 3)
笔记文档，归属于一个 Folder。

| Column | Type | Default | New/Mod | Description |
| :--- | :--- | :--- | :--- | :--- |
| `folder_id` | `uuid` | **NOT NULL** | **New** | 所属文件夹 ID（永不为空） |
| `is_favorite` | `boolean` | `false` | **New** | 是否收藏 |

**外键约束**:
```sql
ALTER TABLE notes
  ADD CONSTRAINT fk_folder
  FOREIGN KEY (folder_id) REFERENCES folders(id)
  ON DELETE RESTRICT;  -- 禁止删除非空文件夹
```

**约束与设计决策**:
- **Strict Hierarchy**: Note 必须在 Folder 下，`folder_id` 永远不为 NULL。
- **虚拟默认**: 未分类的笔记存放在 `is_default=true` 的默认 Folder 中。
- **Deletion Strategy**: 
  - 删除 Collection → 需先移动/删除其下所有内容
  - 删除 Folder → 如果包含笔记，需先移动到其他文件夹
  - 删除默认 Folder → **禁止**（系统保护）
  - *安全机制*: UI 应提示用户二次确认。

## 3. Server Actions / API

### 3.1 Collections 管理
- `createCollection(name: string)`
- `renameCollection(id: string, name: string)`
- `deleteCollection(id: string)`: *Dangerous*

### 3.2 Folders 管理
- `createFolder(collectionId: string, name: string)`
- `renameFolder(id: string, name: string)`
- `deleteFolder(id: string)`

### 3.3 笔记移动
- `moveNote(noteId: string, targetFolderId: string)`
- `moveFolder(folderId: string, targetCollectionId: string)` - 文件夹移动到其他收藏夹
- 这个模型简化了移动逻辑，因为只需要选 Folder（UI 上可以先选 Collection 再选 Folder）。

### 3.4 用户注册时自动创建默认结构 (Database Trigger)

**实现方式**: Supabase Database Trigger（在 `auth.users` 插入时自动触发）

```sql
-- 创建函数：为新用户初始化默认结构
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_collection_id uuid;
BEGIN
  -- 创建默认 Collection
  INSERT INTO public.collections (user_id, name, is_default)
  VALUES (NEW.id, 'My Collection', true)
  RETURNING id INTO new_collection_id;
  
  -- 创建默认 Folder
  INSERT INTO public.folders (user_id, collection_id, name, is_default)
  VALUES (NEW.id, new_collection_id, 'My Notes', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：在用户注册时触发
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**优势**:
- 在数据库层面保证，不会遗漏
- 前端/后端代码无需特殊处理
- 即使 Auth webhook 失败也没关系

## 4. UI 组件设计

### 4.1 V1 简化版 UI（只显示 Folder 层）

**重要**: V1 阶段 Collection 层在 UI 中**完全隐藏**，用户只看到 Folder > Note。

### 4.2 渐进显示逻辑 (Progressive Display)

```typescript
// 判断是否显示层级结构（只看 Folder）
function shouldShowHierarchy(folders: Folder[]): boolean {
  // 过滤掉默认的
  const realFolders = folders.filter(f => !f.isDefault);
  
  // 如果有任何"真正的"文件夹，显示层级
  return realFolders.length > 0;
}
```

**UI 状态**:
- **简单模式** (无真正文件夹): 扁平笔记列表，隐藏层级导航
- **高级模式** (有文件夹): 显示 Folder > Note 层级

### 4.3 侧边栏 (`Sidebar.tsx`)

**简单模式** (V1 默认):
```
[ + New Note ]
[ Favorites ⭐ ]

My Notes
  - Note 1
  - Note 2
  - Note 3

[ + Create Folder ]  <-- 入口按钮
```

**高级模式** (有文件夹后):
```
[ + New Note ]
[ Favorites ⭐ ]

v My Notes (默认文件夹)
    - Note 1
    - Note 2
> Work
    - Meeting Note
> Personal
    - Diary
```

### 4.4 交互
- **模式切换**: 当用户创建第一个"真正的"文件夹时，自动从简单模式切换到高级模式
- **新建**:
  - 简单模式: "+ New Note" 直接创建到默认 Folder
  - 高级模式: 可选择目标 Folder
- **首次创建文件夹**: 弹出对话框引导用户理解层级结构

## 5. 实施步骤

### Step 1: 数据库迁移
1. 创建 `collections` 表。
2. 创建 `folders` 表 (带 `collection_id`)。
3. 修改 `notes` 表 (带 `folder_id`)。

### Step 2: 后端类型与查询
1. 定义 Types (`Collection`, `Folder`, `Note`).
2. 实现 CRUD Actions。

### Step 3: 前端侧边栏重构
1. 这是一个较大的 UI 变动。需要重写 Sidebar 来遍历这个三层结构。
2. 数据获取：可以一次性获取 `collections` + `folders` (轻量级)，点击 Folder 时懒加载 `notes`，或者如果笔记少，一次性全拉。*目前笔记少，建议全拉构建 Tree。*

## 6. 旧数据迁移计划 (Migration Plan)
- 现有的 `notes` 没有 `folder_id` 列。

**迁移步骤**:

### Step 1: 创建新表
```sql
-- 1. 创建 collections 表
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE UNIQUE INDEX idx_collections_default ON collections(user_id) WHERE is_default = true;

-- 2. 创建 folders 表
CREATE TABLE folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_collection_id ON folders(collection_id);
CREATE UNIQUE INDEX idx_folders_default ON folders(user_id) WHERE is_default = true;
```

### Step 2: 为现有用户创建默认结构并迁移笔记
```sql
-- 为每个有笔记的用户创建默认 Collection
INSERT INTO collections (user_id, name, is_default)
SELECT DISTINCT user_id, 'My Collection', true
FROM notes
WHERE user_id IS NOT NULL;

-- 为每个用户创建默认 Folder
INSERT INTO folders (user_id, collection_id, name, is_default)
SELECT c.user_id, c.id, 'My Notes', true
FROM collections c
WHERE c.is_default = true;

-- 给 notes 表添加 folder_id 列
ALTER TABLE notes ADD COLUMN folder_id uuid;

-- 将所有现有笔记关联到对应用户的默认 Folder
UPDATE notes n
SET folder_id = f.id
FROM folders f
WHERE f.user_id = n.user_id AND f.is_default = true;

-- 设置 folder_id 为 NOT NULL
ALTER TABLE notes ALTER COLUMN folder_id SET NOT NULL;

-- 添加外键约束
ALTER TABLE notes ADD CONSTRAINT fk_folder 
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE RESTRICT;
```

### Step 3: 添加 RLS 策略
```sql
-- Collections RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own collections" ON collections
  FOR ALL USING (auth.uid() = user_id);

-- Folders RLS  
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own folders" ON folders
  FOR ALL USING (auth.uid() = user_id);
```

### Step 4: 添加新用户触发器 (Eager Create)
```sql
-- 创建函数：为新用户初始化默认结构
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_collection_id uuid;
BEGIN
  -- 创建默认 Collection
  INSERT INTO public.collections (user_id, name, is_default)
  VALUES (NEW.id, 'My Collection', true)
  RETURNING id INTO new_collection_id;
  
  -- 创建默认 Folder
  INSERT INTO public.folders (user_id, collection_id, name, is_default)
  VALUES (NEW.id, new_collection_id, 'My Notes', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：在用户注册时触发
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 7. 排序功能 (Sorting)

### P1: 基础排序（必须支持）
- 按日期排序（创建时间 / 更新时间）
- 按名称排序（A-Z / Z-A）

### P2: 手动拖拽排序（暂不实现）
- 需要额外的 `position` 字段
- 复杂度较高，留待后续迭代

---

## 变更日志

### 2026-01-21 (V4 - Final)
- 采用 "简化版" 策略：UI 只显示 Folder > Note 两层
- 采用 "Eager Create" + Database Trigger 方式创建默认结构
- 更新默认命名：`My Collection` + `My Notes`
- 移除 UI 中的 Collection 层显示
- 简化 `shouldShowHierarchy()` 逻辑

### 2026-01-21 (V3)
- 采用 "虚拟默认 + 渐进显示" 方案
- `folder_id` 改为 NOT NULL
- 添加 `is_default` 字段到 collections 和 folders
- 更新删除策略为 RESTRICT
- 添加渐进显示 UI 逻辑
- 添加 `moveFolder` API
