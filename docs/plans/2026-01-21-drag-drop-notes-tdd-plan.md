# 拖拽移动笔记 TDD 实施计划

**日期**: 2026-01-21  
**状态**: 已完成（合并到 `master`）
**前置依赖**: 文件夹系统已实现，`moveNote()` Server Action 已存在  
**方法论**: Test-Driven Development (Red → Green → Refactor)

---

## 概述

实现拖拽移动笔记到不同文件夹的功能。

### 技术选型

| 选项 | 优点 | 缺点 | 决定 |
|------|------|------|------|
| **@dnd-kit** | 现代、轻量、React 优化、a11y 友好 | 需要学习新 API | ✅ 选用 |
| react-beautiful-dnd | 成熟、文档丰富 | 已停止维护 | ❌ |
| 原生 HTML5 Drag API | 无依赖 | 样式难控制、移动端差 | ❌ |

### 核心概念

```
┌─────────────────────────────────────────┐
│  DndContext (拖拽上下文)                  │
│  ├── Droppable (文件夹 - 可放置区域)       │
│  │   └── Draggable (笔记 - 可拖拽元素)    │
│  │       └── 📄 Note Item                │
│  ├── Droppable (另一个文件夹)             │
│  └── DragOverlay (拖拽时的预览)           │
└─────────────────────────────────────────┘
```

---

## Phase 1: 准备工作

### 1.1 安装依赖

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**验证**:
```bash
npm list @dnd-kit/core
# 应输出版本号
```

---

## Phase 2: 测试驱动开发

### 2.1 DraggableNote 组件

**目标**: 让笔记项可拖拽

**测试文件**: `tests/components/folders/DraggableNote.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import DraggableNote from '@/components/DraggableNote';

describe('DraggableNote', () => {
  const mockNote = {
    id: 'note-1',
    title: 'Test Note',
    folder_id: 'folder-1',
  };

  const renderWithDnd = (ui: React.ReactElement) => {
    return render(<DndContext>{ui}</DndContext>);
  };

  it('should render the note title', () => {
    renderWithDnd(<DraggableNote note={mockNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('should have draggable attributes', () => {
    renderWithDnd(<DraggableNote note={mockNote} />);
    const element = screen.getByText('Test Note').closest('[data-draggable]');
    expect(element).toBeInTheDocument();
  });

  it('should show untitled for notes without title', () => {
    renderWithDnd(<DraggableNote note={{ ...mockNote, title: '' }} />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });
});
```

**实施步骤**:
1. ❌ 写测试 → 运行失败 (Red)
2. ✅ 创建 `src/components/DraggableNote.tsx`
3. ✅ 实现最小代码让测试通过 (Green)
4. 🔄 重构 (Refactor)

---

### 2.2 DroppableFolder 组件

**目标**: 让文件夹可以接收被拖入的笔记

**测试文件**: `tests/components/folders/DroppableFolder.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import DroppableFolder from '@/components/DroppableFolder';

describe('DroppableFolder', () => {
  const mockFolder = {
    id: 'folder-1',
    name: 'My Notes',
    is_default: true,
  };

  const renderWithDnd = (ui: React.ReactElement) => {
    return render(<DndContext>{ui}</DndContext>);
  };

  it('should render the folder name', () => {
    renderWithDnd(
      <DroppableFolder folder={mockFolder}>
        <div>Children</div>
      </DroppableFolder>
    );
    expect(screen.getByText('My Notes')).toBeInTheDocument();
  });

  it('should have droppable attributes', () => {
    renderWithDnd(
      <DroppableFolder folder={mockFolder}>
        <div>Children</div>
      </DroppableFolder>
    );
    const element = screen.getByText('My Notes').closest('[data-droppable]');
    expect(element).toBeInTheDocument();
  });

  it('should render children (notes)', () => {
    renderWithDnd(
      <DroppableFolder folder={mockFolder}>
        <div>Note 1</div>
        <div>Note 2</div>
      </DroppableFolder>
    );
    expect(screen.getByText('Note 1')).toBeInTheDocument();
    expect(screen.getByText('Note 2')).toBeInTheDocument();
  });
});
```

---

### 2.3 拖拽上下文与事件处理

**目标**: 处理拖拽结束事件，调用 `moveNote`

**测试文件**: `tests/components/folders/DndFolderList.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import DndFolderList from '@/components/DndFolderList';
import { moveNote } from '@/utils/notes/actions';

// Mock the server action
vi.mock('@/utils/notes/actions', () => ({
  moveNote: vi.fn(),
}));

describe('DndFolderList', () => {
  const mockFolders = [
    { id: 'folder-1', name: 'My Notes', is_default: true },
    { id: 'folder-2', name: 'Work', is_default: false },
  ];

  const mockNotes = [
    { id: 'note-1', title: 'Note A', folder_id: 'folder-1' },
    { id: 'note-2', title: 'Note B', folder_id: 'folder-1' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all folders with their notes', () => {
    render(<DndFolderList folders={mockFolders} notes={mockNotes} />);
    
    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Note A')).toBeInTheDocument();
  });

  it('should call moveNote when note is dropped on different folder', async () => {
    // 注意：完整的拖拽测试需要模拟 DnD 事件
    // 这里测试 handleDragEnd 逻辑
    const { container } = render(
      <DndFolderList folders={mockFolders} notes={mockNotes} />
    );
    
    // @dnd-kit 提供测试工具来模拟拖拽
    // 具体实现见 Phase 3
  });

  it('should NOT call moveNote when note is dropped on same folder', async () => {
    // 拖回原位置不应触发移动
  });

  it('should show visual feedback when dragging over a folder', () => {
    // 文件夹应该高亮显示
  });
});
```

---

### 2.4 拖拽时的视觉反馈

**目标**: 拖拽时显示预览，目标文件夹高亮

**测试文件**: `tests/components/folders/DragOverlay.test.tsx`

```typescript
describe('Drag Visual Feedback', () => {
  it('should show drag overlay when dragging', () => {
    // 拖拽时应显示笔记预览
  });

  it('should highlight target folder when hovering', () => {
    // 悬停在文件夹上时应有视觉反馈
  });

  it('should show cursor change when draggable', () => {
    // 可拖拽元素应显示 grab 光标
  });
});
```

---

## Phase 3: 实施步骤

### 3.1 创建 DraggableNote 组件

**文件**: `src/components/DraggableNote.tsx`

```typescript
'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';

interface DraggableNoteProps {
  note: Note;
}

export default function DraggableNote({ note }: DraggableNoteProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
    data: {
      type: 'note',
      note,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-draggable
    >
      <Link
        href={`/?noteId=${note.id}`}
        className="block p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors truncate text-sm cursor-grab active:cursor-grabbing"
      >
        {note.title || UNTITLED_NOTE_TITLE}
      </Link>
    </div>
  );
}
```

---

### 3.2 创建 DroppableFolder 组件

**文件**: `src/components/DroppableFolder.tsx`

```typescript
'use client';

import { useDroppable } from '@dnd-kit/core';
import { Folder } from '@/types/folder';

interface DroppableFolderProps {
  folder: Folder;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  noteCount: number;
}

export default function DroppableFolder({
  folder,
  children,
  isExpanded,
  onToggle,
  noteCount,
}: DroppableFolderProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
    data: {
      type: 'folder',
      folder,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-droppable
      className={isOver ? 'bg-slate-700 rounded-lg' : ''}
    >
      {/* 文件夹标题行 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        {/* ... 展开/折叠图标、文件夹图标、名称、笔记数 */}
      </button>

      {/* 展开时显示笔记列表 */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
```

---

### 3.3 更新 FolderList 使用 DnD

**文件**: `src/components/FolderList.tsx` (修改)

```typescript
'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Folder } from '@/types/folder';
import { Note } from '@/types/note';
import { moveNote } from '@/utils/notes/actions';
import DraggableNote from './DraggableNote';
import DroppableFolder from './DroppableFolder';

export default function FolderList({ folders, notes, showHierarchy = true }: FolderListProps) {
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'note') {
      setActiveNote(active.data.current.note);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveNote(null);

    if (!over) return;

    const noteId = active.id as string;
    const targetFolderId = over.id as string;
    const note = active.data.current?.note as Note;

    // 如果拖到了同一个文件夹，不做操作
    if (note.folder_id === targetFolderId) return;

    // 调用 Server Action 移动笔记
    await moveNote(noteId, targetFolderId);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* 文件夹和笔记列表 */}
      
      {/* 拖拽预览 */}
      <DragOverlay>
        {activeNote ? (
          <div className="bg-slate-800 p-2 rounded-lg text-slate-300 shadow-lg">
            {activeNote.title || 'Untitled'}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

---

## Phase 4: 验证清单

### 4.1 自动化测试

```bash
npm test -- --grep "Drag"
```

| 测试 | 预期 |
|------|------|
| DraggableNote 渲染 | ✅ Pass |
| DroppableFolder 渲染 | ✅ Pass |
| 拖拽到不同文件夹触发 moveNote | ✅ Pass |
| 拖拽到相同文件夹不触发 | ✅ Pass |
| 视觉反馈显示 | ✅ Pass |

---

### 4.2 手动验证流程

**准备条件**:
- 至少有 2 个文件夹
- 每个文件夹至少有 1 个笔记

**测试场景**:

| # | 操作 | 预期结果 |
|---|------|----------|
| 1 | 鼠标悬停在笔记上 | 光标变为 grab |
| 2 | 按住并拖动笔记 | 显示拖拽预览，原位置变半透明 |
| 3 | 拖动到另一个文件夹上方 | 目标文件夹高亮 |
| 4 | 放开鼠标 | 笔记移动到新文件夹，数量更新 |
| 5 | 拖动笔记到原文件夹 | 无变化，不刷新 |
| 6 | 拖动到空白区域放开 | 取消拖拽，笔记留在原位 |
| 7 | 刷新页面 | 笔记仍在新文件夹中（数据持久化）|

---

### 4.3 边界情况测试

| 场景 | 预期行为 |
|------|----------|
| 拖拽到折叠的文件夹 | 可以放入（文件夹作为 drop zone） |
| 快速连续拖拽 | 应正确处理，无 race condition |
| 网络错误 | 显示错误提示，笔记回到原位 |
| 触摸设备 | 长按触发拖拽（需要 @dnd-kit/touch 传感器） |

---

## 交付结果

- 新增组件：`DraggableNote`、`DroppableFolder`
- `FolderList` 集成 DnD（客户端挂载以避免 hydration mismatch）
- 测试覆盖：
  - `tests/components/folders/DraggableNote.test.tsx`
  - `tests/components/folders/DroppableFolder.test.tsx`
  - `tests/components/folders/FolderList.test.tsx`

---

## Phase 5: 实施时间表

| Step | 任务 | 预估时间 | 依赖 |
|------|------|----------|------|
| 1 | 安装 @dnd-kit 依赖 | 5 min | - |
| 2 | 写 DraggableNote 测试 | 15 min | - |
| 3 | 实现 DraggableNote 组件 | 20 min | Step 2 |
| 4 | 写 DroppableFolder 测试 | 15 min | - |
| 5 | 实现 DroppableFolder 组件 | 20 min | Step 4 |
| 6 | 写 DndFolderList 集成测试 | 20 min | - |
| 7 | 修改 FolderList 集成 DnD | 30 min | Step 3, 5 |
| 8 | 添加视觉反馈样式 | 15 min | Step 7 |
| 9 | 手动验证 | 15 min | Step 8 |
| 10 | 修复边界情况 | 20 min | Step 9 |

**总计**: 约 2.5 - 3 小时

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| @dnd-kit 与 Next.js App Router SSR 冲突 | 运行时错误 | 使用 'use client' 确保客户端渲染 |
| Link 组件与拖拽冲突 | 点击时触发导航而非拖拽 | 分离拖拽句柄或使用 pointer-events 控制 |
| 移动设备支持 | 触摸拖拽不工作 | 添加 TouchSensor |
| 性能问题（大量笔记） | 拖拽卡顿 | 虚拟化列表或限制可视范围 |

---

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `package.json` | 添加 @dnd-kit 依赖 |
| `src/components/DraggableNote.tsx` | 新建 |
| `src/components/DroppableFolder.tsx` | 新建 |
| `src/components/FolderList.tsx` | 修改 - 集成 DnD |
| `tests/components/folders/DraggableNote.test.tsx` | 新建 |
| `tests/components/folders/DroppableFolder.test.tsx` | 新建 |
| `tests/components/folders/DndFolderList.test.tsx` | 新建 |

---

*由 Sisyphus AI 生成 | 2026-01-21*
