# Spanish Notes App - 开发进度与规划文档

**更新日期**: 2026-01-13
**状态**: Phase 3 完成 (Vanilla JS) -> 准备进入 Phase 4 (Next.js 重构与商业化)

---

## 1. 当前进度 (Current Status)

### 1.1 已完成功能 (Phase 1-3)
*   **前端架构**: 纯原生 (Vanilla JS + HTML + CSS)。
*   **UI 设计**: 实现了高质量的 Glassmorphism (玻璃拟态) 深色模式界面。
*   **核心功能**:
    *   **Markdown 解析器**: 将特定格式的笔记转换为可点击的音频播放器。
    *   **语音引擎**: 智能调用浏览器 TTS，支持 Google/Monica/本地语音包。
    *   **自动同步**: 基于防抖 (Debounce) 的自动保存机制。
*   **后端集成**:
    *   **Supabase Auth**: 集成 Google OAuth 登录。
    *   **PostgreSQL**: 实现 Row Level Security (RLS) 数据隔离。
*   **部署**: 代码已托管至 GitHub (`spanish-notes-app`)，准备部署至 Cloudflare Pages。

### 1.2 现有数据库结构
*   `notes` 表: `id`, `user_id`, `title`, `content`, `created_at`, `updated_at`.

---

## 2. 商业化与高级功能规划 (Future Roadmap)

为了支持付费订阅、多语言学习及更复杂的笔记管理，我们决定从原生开发迁移至 **Next.js** 生态，并引入后端风控机制。

### 2.1 核心需求
1.  **完整 CRUD (增删改查)**:
    *   **删除 (Delete)**: 在当前原生版本中优先实现。
    *   **搜索 (Search)**: 后续实现。
2.  **多层级笔记管理与多语言 (Hierarchy & Multi-language)**:
    *   **架构**: User -> Collection (语言设置层) -> Folder (可选) -> Note。
    *   **语言设置**: 语言 (Target Language) 将在 Collection 层级设置，而不是每条笔记单独设置。
    *   原生 JS 难以维护此逻辑，需迁移至 React/Next.js。
3.  **商业化风控 (Monetization & Security)**:
    *   **激活码机制**: 用户注册后默认为“未激活”状态 (Read-only)，输入激活码后解锁写入权限。
    *   **存储限制**: 免费用户限制 500KB，付费用户解锁更多。
    *   **订阅制**: 后期引入 Stripe/LemonSqueezy。

---

## 3. 数据库设计方案 (Database Design)

我们已设计好 SQL 脚本 (`DATABASE_UPGRADE.md`)，用于在 Supabase 中执行升级。

### 3.1 新增/修改表结构
1.  **`notes` 表升级**:
    *   新增 `target_language` (text, default 'es')。
2.  **`user_profiles` 表 (新建)**:
    *   `id`: 关联 `auth.users`。
    *   `is_active`: boolean (默认 false, 只有 true 才能写笔记)。
    *   `storage_used`: bigint (默认 0)。
    *   `plan_type`: text (free/pro)。
3.  **`activation_codes` 表 (新建)**:
    *   `code`: 激活码字符串。
    *   `max_uses`: 最大使用次数。
    *   `used_count`: 当前使用次数。

### 3.2 安全策略 (RLS)
*   **写入拦截**: 修改 `notes` 表的 INSERT 策略，强制检查 `user_profiles.is_active = true`。

---

## 4. 下一步行动计划 (Action Plan)

### 4.1 立即执行 (Immediate)
- [ ] **功能补全**:
    - [ ] **删除笔记**: 在编辑界面增加删除按钮，调用 Supabase API 删除笔记并刷新列表。
- [ ] **数据库升级**: 在 Supabase SQL Editor 中运行 `DATABASE_UPGRADE.md` 脚本。
- [ ] **域名配置**: 部署到 Cloudflare Pages 后，在 Supabase 和 Google Cloud Console 更新 OAuth Redirect URL。

### 4.2 架构重构 (Migration Phase)
- [ ] **初始化 Next.js 项目**:
    *   Tech Stack: Next.js 14 (App Router) + TailwindCSS + Radix UI + Supabase SSR。
- [ ] **迁移核心逻辑**:
    *   将 `script.js` 中的 Parser 和 TTS 引擎封装为 React Hook (`useAudioParser`, `useTTS`)。
- [ ] **实现新功能**:
    *   开发“激活码输入”弹窗组件。
    *   开发三层目录侧边栏 (Sidebar with Nested Folders)。

---

## 5. 资源链接
*   **GitHub**: `https://github.com/qcwssss/spanish-notes-app`
*   **Supabase Project**: `https://labnkvzdfzfjhpxmcugw.supabase.co`
*   **升级脚本**: 本地文件 `DATABASE_UPGRADE.md`
