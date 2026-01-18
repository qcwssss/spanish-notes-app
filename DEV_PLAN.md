# Spanish Notes App - 开发进度与规划文档

**更新日期**: 2026-01-18
**状态**: Phase 4 进行中 (Next.js 重构与商业化)

## 2026-01-18
- Change: 激活码流程验证可用；数据库升级已完成；Cloudflare Pages 已部署。
- Scope: Activation redeem RPC, user_profiles.is_active, DATABASE_UPGRADE 脚本，`https://note-lingo-app.pages.dev`。
- Status: done

## 2026-01-18 (Patch)
- Change: 修复设置页语言保存失败（补 `user_profiles.target_language` 字段），存储使用量改为数据库触发器自动维护。
- Scope: Supabase schema patch + notes 触发器更新 `user_profiles.storage_used`。
- Status: pending (需要执行 SQL)

## 2026-01-17
- Change: Next.js 迁移完成核心功能（Auth Gate、Activation、Settings、Editor/Sidebar）并补齐删除功能与相关测试。
- Scope: App Router 首页、设置页、激活码弹窗、笔记增删改、Audio Parser/TTS hooks。
- Status: done

---

## 1. 当前进度 (Current Status)

### 1.1 已完成功能
*   **前端架构**: Next.js App Router + React。
*   **核心功能**:
    *   **Markdown 解析器**: 已迁移为 React Hook (`useAudioParser`)。
    *   **语音引擎**: 已迁移为 React Hook (`useTTS`)。
    *   **笔记 CRUD**: 创建/编辑/删除已实现。
*   **后端集成**:
    *   **Supabase Auth**: Google OAuth 登录。
    *   **用户档案**: `user_profiles` 读取与激活状态管理。
    *   **激活码**: 前端弹窗 + 兑换 RPC 调用。
*   **设置页**: 语言选择与存储信息展示（未激活用户受限）。
*   **测试**: Vitest + 核心组件/路由覆盖。

### 1.2 现有数据库结构
*   `notes` 表: `id`, `user_id`, `title`, `content`, `created_at`, `updated_at`.

---

## 2. 商业化与高级功能规划 (Future Roadmap)

### 2.1 核心需求
1.  **完整 CRUD (增删改查)**:
    *   **删除 (Delete)**: ✅ 已实现。
    *   **搜索 (Search)**: ⏳ 未实现。
2.  **多层级笔记管理与多语言 (Hierarchy & Multi-language)**:
    *   **架构**: User -> Collection (语言设置层) -> Folder (可选) -> Note。
    *   **语言设置**: 语言 (Target Language) 将在 Collection 层级设置，而不是每条笔记单独设置。
3.  **商业化风控 (Monetization & Security)**:
    *   **激活码机制**: ✅ 已实现并验证可用。
    *   **存储限制**: ⏳ 暂不优先。
    *   **订阅制**: 后期引入 Stripe/LemonSqueezy。

> Note: 搜索功能优先级极低，短期内不做，后期可能取消。

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
- [x] **功能补全**:
    - [x] **删除笔记**: 在编辑界面增加删除按钮，调用 Supabase API 删除笔记并刷新列表。
- [x] **数据库升级**: 在 Supabase SQL Editor 中运行 `DATABASE_UPGRADE.md` 脚本。
- [x] **域名配置**: 部署到 Cloudflare Pages 后，在 Supabase 和 Google Cloud Console 更新 OAuth Redirect URL。

### 4.2 架构重构 (Migration Phase)
- [x] **初始化 Next.js 项目**:
    *   Tech Stack: Next.js 16 (App Router) + TailwindCSS + Radix UI + Supabase SSR。
- [x] **迁移核心逻辑**:
    *   将 `script.js` 中的 Parser 和 TTS 引擎封装为 React Hook (`useAudioParser`, `useTTS`)。
- [x] **实现新功能**:
    *   开发“激活码输入”弹窗组件。
- [ ] **实现新功能**:
    *   开发三层目录侧边栏 (Sidebar with Nested Folders)。

---

## 5. 资源链接
*   **GitHub**: `https://github.com/qcwssss/spanish-notes-app`
*   **Supabase Project**: `https://labnkvzdfzfjhpxmcugw.supabase.co`
*   **升级脚本**: 本地文件 `DATABASE_UPGRADE.md`
