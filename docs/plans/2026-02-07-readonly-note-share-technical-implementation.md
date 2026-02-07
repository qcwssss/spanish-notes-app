# 只读笔记分享功能（V1）技术实施计划

## 1. 文档目的
本文件用于指导工程落地，明确只读分享功能的实施要求、技术规格、开发步骤、测试方案与验收标准。

关联产品方案：`docs/plans/2026-02-07-readonly-note-share-plan.md`

---

## 2. 实施要求（Must Have）

### 2.1 业务要求
1. 笔记作者可生成分享链接。
2. 分享链接默认长期有效（无过期时间）。
3. 笔记作者可手动撤销分享，撤销后链接立即失效。
4. 笔记被删除后，分享链接立即失效。
5. 访问者只能只读查看（不能编辑、删除、收藏、移动）。
6. 访问者可在分享页点击文本触发浏览器发音（TTS）。

### 2.2 安全要求
1. 分享 token 必须高熵随机、不可枚举。
2. 公开查询接口只能返回最小展示字段。
3. 所有写操作必须进行登录态与所有权校验。
4. 无效 token、已撤销、已删除内容不得泄露原文。

### 2.3 兼容性要求
1. 兼容当前 i18n 架构（中英文）。
2. 不破坏现有首页编辑流程。
3. 不影响现有 Cloudflare Pages 构建与部署。

---

## 3. 技术规格

### 3.1 数据库设计

#### 新增表：`public.note_shares`
- `id uuid primary key default gen_random_uuid()`
- `note_id uuid not null references public.notes(id) on delete cascade`
- `owner_id uuid not null references auth.users(id) on delete cascade`
- `token text not null unique`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`

#### 约束与索引
- `unique(token)`
- `index(owner_id)`
- `unique(note_id)`（V1 一条笔记只保留一条分享记录）

#### RLS 策略（建议）
- 启用 RLS：`alter table public.note_shares enable row level security;`
- 作者可读写自己的分享记录：`auth.uid() = owner_id`
- 公开只读不直接走表策略，建议通过服务端函数做 token 查询后返回受控字段。

> 备注：为降低复杂度，分享页读取可先在 Next.js 服务端使用 service-role 以外的安全方式实现（基于 server client + token 查 join），并严格限制返回字段。

### 3.2 Token 规格
- 生成方式：`crypto.randomUUID()` + 随机串拼接，或直接 32+ 字节随机值 base64url。
- 最小熵建议：>= 128 bit。
- 链接格式：`/share/{token}`。

### 3.3 服务端接口（Server Actions / Queries）

建议新建：`src/utils/shares/queries.ts`

1. `createOrGetNoteShare(noteId: string): Promise<{ token: string; url: string }>`
   - 前置：用户已登录
   - 校验：`notes.user_id === auth.uid()`
   - 行为：
     - 若 note_shares 已存在且 active，返回已有 token
     - 若不存在则创建并返回新 token
   - 错误：`unauthenticated | forbidden | note_not_found | unknown`

2. `revokeNoteShare(noteId: string): Promise<{ success: true }>`
   - 前置：用户已登录
   - 校验：仅 owner 可撤销
   - 行为：`is_active = false`

3. `getSharedNoteByToken(token: string): Promise<SharedNoteView | null>`
   - 前置：公开访问
   - 校验：
     - token 存在
     - `is_active = true`
     - 关联 note 仍存在
   - 返回字段（仅只读）：
     - `note.id`
     - `note.title`
     - `note.content`
     - `targetLanguage`（来源 owner profile）
     - `updated_at`

类型建议：
```ts
export interface SharedNoteView {
  id: string;
  title: string;
  content: string;
  targetLanguage: string | null;
  updatedAt: string;
}
```

### 3.4 前端页面与组件规格

#### 3.4.1 新增页面
- `src/app/share/[token]/page.tsx`

页面行为：
1. 服务端读取 token 并调用 `getSharedNoteByToken`。
2. 有效：渲染只读页面（标题 + NotePlayer）。
3. 无效：渲染“分享不可用”文案（不返回原文）。

页面限制：
- 不渲染 `Editor` 的编辑/删除控件。
- 不渲染收藏按钮。
- 不渲染任何写操作入口。

#### 3.4.2 复用组件
- 使用 `NotePlayer` 展示内容与发音能力。
- 目标语言沿用分享数据中的 `targetLanguage`。

#### 3.4.3 作者侧入口
建议在 `Editor` 工具栏增加按钮：
- 未分享：`分享`
- 已分享：`复制链接` + `撤销分享`

交互：
- 复制成功/失败：toast
- 撤销成功/失败：toast

### 3.5 i18n 文案规格
在 `src/i18n/messages.ts` 新增：
- `share.button`
- `share.copyLink`
- `share.revoke`
- `share.readonly`
- `share.unavailable`
- `share.copySuccess`
- `share.copyFailed`
- `share.revokeSuccess`
- `share.revokeFailed`

---

## 4. 实施步骤（建议顺序）

### Phase 1: 数据与服务端
1. 新增 migration：创建 `note_shares` 表、索引、约束、RLS。
2. 新建 `src/utils/shares/queries.ts` 实现 3 个核心函数。
3. 本地验证 token 生成、撤销、读取逻辑。

### Phase 2: 分享页
1. 新建 `src/app/share/[token]/page.tsx`。
2. 接入 `getSharedNoteByToken`。
3. 复用 `NotePlayer`，完成只读展示。
4. 增加失效态 UI。

### Phase 3: 作者端操作
1. 在 `Editor` 加分享按钮与撤销入口。
2. 复制链接（`navigator.clipboard.writeText`）与 toast 提示。
3. 状态切换（已分享/未分享）。

### Phase 4: i18n 与测试
1. 补齐中英文文案。
2. 更新/新增测试。
3. 全量执行 `npm test` 与 `npm run build`。

---

## 5. 测试方案

### 5.1 单元/集成测试
1. `createOrGetNoteShare`
   - 首次创建成功
   - 再次调用返回同 token
   - 非 owner 调用失败

2. `revokeNoteShare`
   - owner 撤销成功
   - 非 owner 撤销失败
   - 撤销后 token 不可访问

3. `getSharedNoteByToken`
   - token 有效返回内容
   - token 不存在返回 null
   - token 已撤销返回 null
   - note 已删除返回 null

### 5.2 页面测试
1. `/share/[token]` 有效时显示内容与标题。
2. 分享页不存在编辑/删除/收藏按钮。
3. 可触发发音流程（mock `speechSynthesis`）。
4. 无效 token 显示不可用文案。

### 5.3 手工验收
1. 登录 A 创建分享，匿名窗口打开可读可点读。
2. A 撤销分享，匿名窗口刷新后失效。
3. A 删除笔记，匿名窗口刷新后失效。

---

## 6. 验收标准（Definition of Done）
1. 分享链接可生成、可复制、可公开访问。
2. 访问者仅只读，不可执行任何写操作。
3. 分享页发音可用。
4. 撤销后立即失效。
5. 删除笔记后立即失效。
6. 中英文文案完整。
7. 测试与构建通过。

---

## 7. 风险与注意事项
1. **RLS 设计不当导致越权**：必须通过 owner 校验与受控字段返回规避。
2. **token 可猜测风险**：必须使用高熵随机 token。
3. **分享页误复用编辑组件**：必须隔离为只读渲染。
4. **云部署差异**：新增路由后需确认 Cloudflare Pages 构建正常。

---

## 8. 后续可选增强（非 V1）
1. 链接过期时间
2. 一条笔记多链接管理
3. 访问次数统计
4. 密码保护分享
