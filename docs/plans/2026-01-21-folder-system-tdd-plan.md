# 文件夹系统 TDD 实施计划

**日期**: 2026-01-21
**设计文档**: `docs/plans/2026-01-19-folder-system-design.md` (V4)
**方法论**: Test-Driven Development (Red → Green → Refactor)

---

## 概述

本计划采用 TDD 方式实现文件夹系统，分为三个阶段：
1. **Phase 1**: 数据库层（SQL 迁移 + 验证）
2. **Phase 2**: 后端层（TypeScript 类型 + Server Actions）
3. **Phase 3**: 前端层（UI 组件）

每个任务都遵循 **Red → Green → Refactor** 循环。

---

## Phase 1: 数据库层

### 1.1 创建 Collections 表
**目标**: 创建 `collections` 表及其 RLS 策略

**测试验证**:
```sql
-- 验证表存在
SELECT * FROM collections LIMIT 1;

-- 验证 RLS 策略
-- 用户只能看到自己的 collections
```

**实施步骤**:
1. 创建 migration 文件
2. 运行 migration
3. 验证表结构
4. 验证 RLS

---

### 1.2 创建 Folders 表
**目标**: 创建 `folders` 表及其 RLS 策略

**测试验证**:
```sql
-- 验证表存在
SELECT * FROM folders LIMIT 1;

-- 验证外键约束
-- folder 必须属于一个 collection
```

**实施步骤**:
1. 创建 migration 文件
2. 运行 migration
3. 验证表结构和外键
4. 验证 RLS

---

### 1.3 修改 Notes 表
**目标**: 添加 `folder_id` 和 `is_favorite` 字段

**测试验证**:
```sql
-- 验证字段存在
SELECT folder_id, is_favorite FROM notes LIMIT 1;

-- 验证 NOT NULL 约束
-- 验证外键约束 (ON DELETE RESTRICT)
```

**实施步骤**:
1. 添加字段（允许 NULL）
2. 迁移现有数据
3. 设置 NOT NULL
4. 添加外键约束

---

### 1.4 创建 Database Trigger (Eager Create)
**目标**: 新用户注册时自动创建默认结构

**测试验证**:
```sql
-- 验证：新用户注册后，自动拥有
-- 1. 一个 is_default=true 的 Collection
-- 2. 一个 is_default=true 的 Folder
```

**实施步骤**:
1. 创建 `handle_new_user()` 函数
2. 创建触发器绑定到 `auth.users`
3. 测试新用户注册

---

### 1.5 迁移现有数据
**目标**: 为现有用户创建默认结构，迁移笔记

**测试验证**:
```sql
-- 验证：所有现有笔记都有 folder_id
SELECT COUNT(*) FROM notes WHERE folder_id IS NULL; -- 应为 0
```

**实施步骤**:
1. 为现有用户创建默认 Collection
2. 为现有用户创建默认 Folder
3. 将所有笔记关联到默认 Folder

---

## Phase 2: 后端层 (TypeScript + Server Actions)

### 2.1 定义 TypeScript 类型
**目标**: 定义 `Collection` 和 `Folder` 类型

**测试文件**: `tests/types/folder.test.ts`
```typescript
describe('Folder Types', () => {
  it('should have required fields', () => {
    const folder: Folder = {
      id: 'uuid',
      userId: 'uuid',
      collectionId: 'uuid',
      name: 'My Notes',
      isDefault: true,
      createdAt: new Date(),
    };
    expect(folder.isDefault).toBe(true);
  });
});
```

**实施步骤**:
1. 写测试
2. 创建 `src/types/folder.ts`
3. 导出类型

---

### 2.2 获取默认 Folder
**目标**: `getDefaultFolder(userId)` 函数

**测试文件**: `tests/utils/folders/queries.test.ts`
```typescript
describe('getDefaultFolder', () => {
  it('should return the default folder for a user', async () => {
    const folder = await getDefaultFolder(userId);
    expect(folder).toBeDefined();
    expect(folder.isDefault).toBe(true);
  });
});
```

**实施步骤**:
1. 写测试
2. 实现 `src/utils/folders/queries.ts`
3. 验证测试通过

---

### 2.3 Folder CRUD Actions
**目标**: 创建、重命名、删除文件夹

**测试文件**: `tests/actions/folder.test.ts`
```typescript
describe('Folder Actions', () => {
  describe('createFolder', () => {
    it('should create a new folder', async () => {
      const folder = await createFolder({ name: 'Work' });
      expect(folder.name).toBe('Work');
      expect(folder.isDefault).toBe(false);
    });
  });

  describe('renameFolder', () => {
    it('should rename a folder', async () => {
      const updated = await renameFolder(folderId, 'New Name');
      expect(updated.name).toBe('New Name');
    });
  });

  describe('deleteFolder', () => {
    it('should delete an empty folder', async () => {
      await deleteFolder(emptyFolderId);
      // verify deleted
    });

    it('should NOT delete a folder with notes', async () => {
      await expect(deleteFolder(folderWithNotes)).rejects.toThrow();
    });

    it('should NOT delete the default folder', async () => {
      await expect(deleteFolder(defaultFolderId)).rejects.toThrow();
    });
  });
});
```

**实施步骤**:
1. 写测试
2. 实现 `src/actions/folder.ts`
3. 逐个验证测试通过

---

### 2.4 获取用户所有 Folders
**目标**: `getFolders(userId)` 函数

**测试文件**: `tests/utils/folders/queries.test.ts`
```typescript
describe('getFolders', () => {
  it('should return all folders for a user', async () => {
    const folders = await getFolders(userId);
    expect(folders.length).toBeGreaterThan(0);
  });

  it('should include the default folder', async () => {
    const folders = await getFolders(userId);
    const defaultFolder = folders.find(f => f.isDefault);
    expect(defaultFolder).toBeDefined();
  });
});
```

---

### 2.5 移动笔记
**目标**: `moveNote(noteId, targetFolderId)` 函数

**测试文件**: `tests/actions/note.test.ts`
```typescript
describe('moveNote', () => {
  it('should move a note to another folder', async () => {
    const updated = await moveNote(noteId, targetFolderId);
    expect(updated.folderId).toBe(targetFolderId);
  });

  it('should NOT move to a non-existent folder', async () => {
    await expect(moveNote(noteId, 'fake-id')).rejects.toThrow();
  });
});
```

---

### 2.6 渐进显示逻辑
**目标**: `shouldShowHierarchy(folders)` 函数

**测试文件**: `tests/utils/folders/display.test.ts`
```typescript
describe('shouldShowHierarchy', () => {
  it('should return false when only default folder exists', () => {
    const folders = [{ id: '1', isDefault: true, name: 'My Notes' }];
    expect(shouldShowHierarchy(folders)).toBe(false);
  });

  it('should return true when real folders exist', () => {
    const folders = [
      { id: '1', isDefault: true, name: 'My Notes' },
      { id: '2', isDefault: false, name: 'Work' },
    ];
    expect(shouldShowHierarchy(folders)).toBe(true);
  });
});
```

---

## Phase 3: 前端层 (React Components)

### 3.1 FolderList 组件
**目标**: 显示文件夹列表

**测试文件**: `tests/components/FolderList.test.tsx`
```typescript
describe('FolderList', () => {
  it('should render all folders', () => {
    render(<FolderList folders={mockFolders} />);
    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should highlight the selected folder', () => {
    render(<FolderList folders={mockFolders} selectedId="2" />);
    // verify highlight
  });
});
```

---

### 3.2 Sidebar 渐进显示
**目标**: 根据 `shouldShowHierarchy` 切换显示模式

**测试文件**: `tests/components/Sidebar.test.tsx`
```typescript
describe('Sidebar Progressive Display', () => {
  it('should show flat list when no real folders', () => {
    render(<Sidebar folders={[defaultFolderOnly]} notes={mockNotes} />);
    // 只显示笔记列表，不显示文件夹层级
  });

  it('should show hierarchy when real folders exist', () => {
    render(<Sidebar folders={foldersWithReal} notes={mockNotes} />);
    // 显示文件夹 > 笔记层级
  });
});
```

---

### 3.3 CreateFolderDialog 组件
**目标**: 创建新文件夹对话框

**测试文件**: `tests/components/CreateFolderDialog.test.tsx`
```typescript
describe('CreateFolderDialog', () => {
  it('should create a folder on submit', async () => {
    const onCreate = vi.fn();
    render(<CreateFolderDialog onCreate={onCreate} />);
    
    await userEvent.type(screen.getByRole('textbox'), 'New Folder');
    await userEvent.click(screen.getByText('Create'));
    
    expect(onCreate).toHaveBeenCalledWith({ name: 'New Folder' });
  });

  it('should validate empty name', async () => {
    render(<CreateFolderDialog onCreate={vi.fn()} />);
    await userEvent.click(screen.getByText('Create'));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

---

### 3.4 MoveNoteDialog 组件
**目标**: 移动笔记到其他文件夹

**测试文件**: `tests/components/MoveNoteDialog.test.tsx`
```typescript
describe('MoveNoteDialog', () => {
  it('should show all available folders', () => {
    render(<MoveNoteDialog noteId="1" folders={mockFolders} />);
    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should call moveNote on selection', async () => {
    const onMove = vi.fn();
    render(<MoveNoteDialog noteId="1" folders={mockFolders} onMove={onMove} />);
    
    await userEvent.click(screen.getByText('Work'));
    await userEvent.click(screen.getByText('Move'));
    
    expect(onMove).toHaveBeenCalledWith('1', 'work-folder-id');
  });
});
```

---

### 3.5 Favorites 视图
**目标**: 显示所有收藏的笔记

**测试文件**: `tests/components/FavoritesView.test.tsx`
```typescript
describe('FavoritesView', () => {
  it('should show only favorited notes', () => {
    render(<FavoritesView notes={mixedNotes} />);
    expect(screen.getByText('Favorite Note')).toBeInTheDocument();
    expect(screen.queryByText('Regular Note')).not.toBeInTheDocument();
  });
});
```

---

## 实施顺序

| Step | Phase | Task | 预估时间 |
|------|-------|------|----------|
| 1 | DB | 创建 collections 表 | 30 min |
| 2 | DB | 创建 folders 表 | 30 min |
| 3 | DB | 修改 notes 表 | 30 min |
| 4 | DB | 创建 Eager Create Trigger | 30 min |
| 5 | DB | 迁移现有数据 | 30 min |
| 6 | BE | TypeScript 类型定义 | 15 min |
| 7 | BE | getDefaultFolder | 30 min |
| 8 | BE | getFolders | 30 min |
| 9 | BE | createFolder | 30 min |
| 10 | BE | renameFolder | 20 min |
| 11 | BE | deleteFolder | 30 min |
| 12 | BE | moveNote | 30 min |
| 13 | BE | shouldShowHierarchy | 15 min |
| 14 | FE | FolderList 组件 | 45 min |
| 15 | FE | Sidebar 渐进显示 | 60 min |
| 16 | FE | CreateFolderDialog | 45 min |
| 17 | FE | MoveNoteDialog | 45 min |
| 18 | FE | Favorites 视图 | 30 min |

**总计**: 约 9 小时

---

## 验收标准

### Phase 1 完成标准
- [ ] 所有表创建成功
- [ ] RLS 策略生效
- [ ] 新用户注册自动创建默认结构
- [ ] 现有数据迁移完成

### Phase 2 完成标准
- [ ] 所有后端测试通过
- [ ] Folder CRUD 功能正常
- [ ] 笔记移动功能正常

### Phase 3 完成标准
- [ ] 所有前端测试通过
- [ ] Sidebar 渐进显示正常
- [ ] 对话框交互正常
- [x] Favorites 视图正常

---

*由 Antigravity AI 生成 | 2026-01-21*
