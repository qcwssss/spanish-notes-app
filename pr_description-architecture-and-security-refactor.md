# Pull Request: refactor: 全面架构审计与安全修复

## 摘要 (Summary)
本次 PR 基于代码库的全面审计，对项目中的核心安全漏洞、组件职责不清、类型定义误差以及性能闪烁等问题进行了系统性修复。

## 核心变更 (Key Changes)

### 🔴 安全修复 (Security)
- **修复鉴权旁路漏洞**：删除了 `middleware.ts` 中仅通过 `sb-*-auth-token` Cookie 存在与否就予以放行的逻辑。现已彻底堵住过期/伪造 Cookie 的访问路径，保证所有受保护路由均经过完整的用户校验。

### 🟠 架构与重构 (Architecture & Refactoring)
- **统一数据请求职责**：
  - 净化了 `utils/notes/queries.ts`，移除了 `createNote`、`updateNote` 和 `deleteNote` 等所有的写操作（Mutations），将它们归拢至 `utils/notes/actions.ts`。
  - 在 `queries.ts` 中新增了 `getNotes` 方法，并替换了 `AppPage` 中的内联 Supabase 查询逻辑，提升了代码的复用性和抽象一致性。
- **神组件拆解**：
  - 针对长达 430 行的 `DroppableFolder` 进行了初步拆分，将删除文件夹的确认弹窗逻辑抽离到独立的 `FolderDeleteDialogs.tsx` 中，大幅缩减了主组件体积。
- **状态管理规范化**：
  - 提取了 `useTheme` hook：将主题管理状态从 `Sidebar` 中解耦，使 `Sidebar` 仅作为状态消费方。
  - 提取了 `useIsMobile` hook：利用 `useSyncExternalStore` 替换了原始的 `useEffect`，根治了由于初始值不一致造成的移动端检测屏幕渲染闪烁问题。
  - 简化了 `ShareActions.tsx`：合并了针对外部点击和 `Escape` 键的两个多余的 `useEffect`。

### 🟡 类型优化 (Type Safety)
- **对齐 DB Schema**：调整了 `Note` 类型 (`types/note.ts`)，将数据库层面声明为 `NOT NULL` 的 `user_id` 和 `created_at` 字段由 Optional (`?`) 修正为必填项。并将 `content` 的类型准确定义为 `string | null`。

### 🟢 其他修复 (Other Fixes)
- 修复了 `useTTS` 钩子中对 `window.speechSynthesis.onvoiceschanged` 暴力赋值的问题，改用更为安全的 `addEventListener` 防止全局监听器被覆盖。

## 测试建议 (How to Test)
1. **安全校验**：清除本地的登录状态并伪造一个以 `sb-` 开头的无效 cookie，尝试访问 `/app`，应验证直接被重定向到 `/`。
2. **基本功能校验**：确认新建、重命名、删除（包含子笔记）文件夹的功能正常运作；新建、更新、移动笔记的功能正常运作。
3. **响应式与 UI 检测**：从桌面端调整窗口大小至移动端尺寸，确认侧边栏状态不会出现“先亮后暗”或初始尺寸的闪烁。
4. **主题切换**：确认侧边栏底部的“浅色/深色”主题切换功能正常工作并能正确记录于本地和反映到 DOM 元素上。
