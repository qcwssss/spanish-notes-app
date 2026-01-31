# 项目进展报告 (Progress Report)

## 当前状态摘要
**日期**: 2026年1月24日
**当前版本**: Phase 8 - 文件夹删除流程完成
**主要分支**: `master`

## 2026-01-30
- 完成收藏视图（独立页面）与侧边栏视图切换（All Notes / Favorites）
- 收藏列表支持更新时间排序切换（Newest/Oldest），并将选择持久化到 localStorage
- 新增收藏视图测试覆盖
- 新增手动深色/浅色切换（侧边栏按钮 + localStorage 持久化），主内容与侧边栏提供最小可用浅色样式
- 确认 Step 2 全量浅色优化方向（明亮中性配色），覆盖页面、表单、编辑区、弹窗、Toast 与卡片

## 已达成的里程碑

### 1. 交互式学习引擎升级 ✅
- **粒度化点读**: 实现了从"行级"到"词句级"的跳转。现在应用可以智能识别 Markdown 中的外语短语，并提供即时点读。
- **多语言矩阵**: 核心逻辑已抽象化，完整支持 **西班牙语、法语、德语、英语、葡萄牙语、意大利语、荷兰语**。
- **高级样式**: 引入了"Premium"视觉效果，通过天蓝色虚线下划线引导用户进行交互。

### 2. 技术架构优化 ✅
- **Markdown AST 遍历**: 实现了递归组件注入，支持在复杂 Markdown 结构（如列表、表格、加粗文本）中保持交互性。
- **动态语言分割**: 开发了基于字符集的动态正则表达式生成器 (`segmenter.ts`)，能够精准分离目标语和解释语。
- **工程化标准**: 
  - 全面迁移测试至 `tests/` 目录。
  - 配置 Vitest 以覆盖所有关键逻辑。
  - 完成了 Gemini 建议的重构，代码更加简洁健壮。

### 3. 用户体验与基础设施 ✅
- **身份验证**: 稳定的 Google OAuth 流。
- **存储管理**: 后端触发器实时计算用户存储占用，并同步至前端设置页面。
- **自动化部署**: 成功部署于 Cloudflare Pages。

### 4. 文件夹系统设计 ✅
**设计文档**: `docs/plans/2026-01-19-folder-system-design.md` (V4 Final)

**核心设计决策**:
| 决策点 | 结果 |
|--------|------|
| 架构 | 三层表结构（Collection > Folder > Note），但 V1 UI 只显示两层 |
| 默认命名 | Collection: `My Collection`, Folder: `My Notes` |
| 创建时机 | Eager Create - 用户注册时通过 Database Trigger 自动创建 |
| 删除策略 | `ON DELETE RESTRICT` - 禁止删除含笔记的文件夹 |
| folder_id | `NOT NULL` - 永不为空 |
| UI 行为 | 渐进显示：无真正文件夹时扁平列表，有文件夹时显示层级 |

### 5. 文件夹系统实现 ✅ (NEW - TDD)
**TDD 计划**: `docs/plans/2026-01-21-folder-system-tdd-plan.md`

**Phase 1 - 数据库层** ✅:
- `collections` 表 + RLS 策略
- `folders` 表 + RLS 策略  
- `notes` 表添加 `folder_id`, `is_favorite` 字段
- 新用户触发器 (Eager Create)
- 现有数据迁移脚本

**Phase 2 - 后端层** ✅:
- TypeScript 类型: `Collection`, `Folder`
- `getDefaultFolder()`, `getFolders()` 查询函数
- `createFolder()`, `renameFolder()`, `deleteFolder()` 操作
- `moveNote()`, `toggleFavorite()` 笔记操作
- `shouldShowHierarchy()` 渐进显示逻辑

**Phase 3 - 前端层** ✅:
- `FolderList` 组件 - 文件夹树 + 展开/折叠
- `CreateFolderDialog` 组件 - 创建文件夹弹窗
- `Sidebar` 更新 - 集成渐进显示
- `page.tsx` 更新 - 获取 folders 数据

**测试覆盖**: 37 个测试通过

**Git 提交**:
```
2f4f572 feat(notes): include folder_id in notes query
7e2f6d8 feat: implement folder system frontend (TDD)
5e2aa45 feat: implement folder system backend (TDD)
2b3f933 docs: add detailed TDD implementation plan
aefcfc2 docs: finalize folder system design (V4)
```

---

### 6. 拖拽移动笔记 ✅
**TDD 计划**: `docs/plans/2026-01-21-drag-drop-notes-tdd-plan.md`

**实现内容**:
- 使用 **@dnd-kit** 实现拖拽移动
- `DraggableNote` / `DroppableFolder` 组件
- `FolderList` 集成 DnD（仅客户端挂载，避免 hydration mismatch）
- 创建文件夹失败时 Toast 提示

**测试覆盖**:
- `tests/components/folders/DraggableNote.test.tsx`
- `tests/components/folders/DroppableFolder.test.tsx`
- `tests/components/folders/FolderList.test.tsx`

### 7. 文件夹重命名 UI ✅
**实现内容**:
- 文件夹行右侧三点菜单（Edit）
- 双击名称进入 inline rename
- Enter 保存 / Esc 取消 / Blur 提交
- UI 立即更新，失败时回滚

**测试覆盖**:
- `tests/components/folders/DroppableFolder.test.tsx`

### 8. 文件夹删除流程 ✅
**实现内容**:
- 三点菜单提供 Delete 入口（默认文件夹不可删）
- 两条路径：保留笔记（移动到默认文件夹）/ 删除全部笔记
- 删除全部笔记需二次确认
- 失败提示使用 Toast

**数据库**:
- Supabase RPC：`move_notes_and_delete_folder`, `delete_folder_and_notes`
- SQL 文件：`@supabase/2026-01-24-folder-delete-rpcs.sql`

**测试覆盖**:
- `tests/components/folders/DroppableFolder.test.tsx`

---

## 下一步计划
- 搜索功能（全文检索）
- 扩展语言支持（更多语言字符集）
- 离线支持（PWA）

---

## 技术细节回顾
- **`MarkdownRenderer`**: 负责将静态 Markdown 转换为动态 React 组件树。
- **`TextSplitter`**: 负责最终的文本到 Span 的映射。
- **`useTTS`**: 封装了复杂的语音发现与选择逻辑，支持跨设备一致性。

---
*由 Antigravity AI 生成 | 最后更新: 2026-01-24*
