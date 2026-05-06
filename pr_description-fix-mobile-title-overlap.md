# fix(ui): 修复手机端 sidebar toggle 按钮遮挡笔记标题

## Description

修复了在手机端（sidebar 收起状态下），固定定位的 sidebar toggle 按钮覆盖笔记标题和标题输入框的问题。

该 toggle 按钮使用 `fixed top-4 left-4 z-50` 定位，而 `<main>` 内容区在手机端原先没有足够的左侧内边距，导致标题文字直接从页面最左侧开始渲染，被按钮遮挡。

## Key Changes

- **`src/app/app/page.tsx`**: 将 `<main>` 的手机端 padding 从 `px-0 py-4` 改为 `pl-14 pr-2 py-4`，为 toggle 按钮留出 56px 的左侧空间。桌面端仍使用 `md:p-8`。
- **`src/app/favorites/page.tsx`**: 同步修复收藏页面的 `<main>` 容器，将 `p-8` 改为 `pl-14 pr-2 py-4 md:p-8`，保持手机端与桌面端一致的响应式行为。

## Instructions

1. 在手机或 DevTools 手机模拟器中打开 `/app` 页面
2. 确认 sidebar 自动收起后，笔记标题（如 "Untitled Note"）完整显示在 toggle 按钮右侧，不被遮挡
3. 点击新建笔记，确认编辑模式下的标题输入框也不被遮挡
4. 切换到 `/favorites` 页面，确认同样的修复效果
5. 在桌面端确认布局正常（sidebar 展开时 `md:p-8` 生效，无多余间距）
