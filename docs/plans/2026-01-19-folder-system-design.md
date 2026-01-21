# 文件夹系统设计文档 (Collection-Folder System Design)

**日期**: 2026-01-19
**状态**: Draft V2
**变更**: 从无限嵌套模型更改为明确的 "Collection > Folder > Document" 三层架构。

## 1. 目标 (Goal)
构建一个严格的三层笔记组织系统：
1. **Level 1 (Top)**: Collections (文件集/知识库)
2. **Level 2 (Mid)**: Folders (文件夹)
3. **Level 3 (Leaf)**: Documents/Notes (笔记文档)

一个 Collection 包含多个 Folders；一个 Folder 包含多个 Notes。

## 2. 数据库设计 (Database Schema)

### 2.1 新增 `collections` 表 (Level 1)
顶层容器。

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `gen_random_uuid()` | 主键 |
| `user_id` | `uuid` | NOT NULL | 外键，关联 `auth.users.id`，集合所有者 |
| `name` | `text` | NOT NULL | 集合名称 |
| `created_at` | `timestamptz` | `now()` | 创建时间 |

**索引**: `CREATE INDEX idx_collections_user_id ON collections(user_id);`

### 2.2 新增 `folders` 表 (Level 2)
中间层容器，必须归属于一个 Collection。

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `gen_random_uuid()` | 主键 |
| `collection_id` | `uuid` | NOT NULL | 外键，关联 `collections(id)` |
| `user_id` | `uuid` | NOT NULL | 外键，关联 `auth.users.id`（冗余存储，简化 RLS）|
| `name` | `text` | NOT NULL | 文件夹名称 |
| `created_at` | `timestamptz` | `now()` | 创建时间 |

**索引**: `CREATE INDEX idx_folders_user_id ON folders(user_id);`

> **设计说明**: `user_id` 可通过 `collection_id` 推导，但直接存储可简化 RLS 策略、提升查询性能。

### 2.3 修改 `notes` 表 (Level 3)
笔记文档，归属于一个 Folder。

| Column | Type | Default | New/Mod | Description |
| :--- | :--- | :--- | :--- | :--- |
| `folder_id` | `uuid` | `NULL` | **New** | 所属文件夹 ID |
| `is_favorite` | `boolean` | `false` | **New** | 是否收藏 |

**约束与设计决策**:
- **Strict Hierarchy**: 理论上 Note 应该在 Folder 下。如果 `folder_id` 为 NULL，这代表 "Uncategorized" 或者 "Inbox" (默认区域)。
- **Deletion Strategy**: 
  - 删除 Collection -> 级联删除 Folders -> 级联删除 Notes。
  - 删除 Folder -> 级联删除 Notes。
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
- 这个模型简化了移动逻辑，因为只需要选 Folder（UI 上可以先选 Collection 再选 Folder）。

## 4. UI 组件设计

### 4.1 侧边栏 (`Sidebar.tsx`)
重构为三级视图：

```
[ Favorites ]
  - Starred Note 1

----------------

[ Collection: Work ] 
  v Folder: Project A
      - Meeting Note
      - Design Doc
  > Folder: Project B

[ Collection: Personal ]
  > Folder: Diary
```

### 4.2 交互
- **Collections 栏**: 侧边栏最外层或顶部切换器，或者是如上所示的 Accordion (手风琴) 风格。
- **新建**:
  - "New Collection" 按钮。
  - 在 Collection 旁有 "+" 号创建 Folder。
  - 在 Folder 旁有 "+" 号创建 Note。

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
- 现有的 `notes` `folder_id` 都是 NULL。
- **方案**:
  1. 系统自动创建一个默认 Collection (例如 "My Notes")。
  2. 系统自动创建一个默认 Folder (例如 "General")。
  3. 将所有现有 orphan notes 移动到这个默认 Folder 下。
