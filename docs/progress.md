# 项目进展报告 (Progress Report)

## 当前状态摘要
**日期**: 2026年1月21日
**当前版本**: Phase 5 - 文件夹系统设计完成
**主要分支**: `feat/folder`

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

### 4. 文件夹系统设计 ✅ (NEW)
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

---

## 下一步计划：文件夹系统实施

### Phase 1: 数据库层 (TDD)
1. 创建 `collections` 表 + RLS
2. 创建 `folders` 表 + RLS
3. 修改 `notes` 表添加 `folder_id`
4. 创建新用户触发器 (Eager Create)
5. 迁移现有数据

### Phase 2: 后端层 (TDD)
1. 定义 TypeScript 类型 (`Collection`, `Folder`)
2. Folder CRUD Server Actions
3. 笔记移动功能 (`moveNote`)
4. 获取默认 Folder 函数

### Phase 3: 前端层 (TDD)
1. Sidebar 重构 - 渐进显示逻辑
2. 创建文件夹对话框
3. 笔记移动 UI
4. Favorites 视图

---

## 技术细节回顾
- **`MarkdownRenderer`**: 负责将静态 Markdown 转换为动态 React 组件树。
- **`TextSplitter`**: 负责最终的文本到 Span 的映射。
- **`useTTS`**: 封装了复杂的语音发现与选择逻辑，支持跨设备一致性。

---
*由 Antigravity AI 生成 | 最后更新: 2026-01-21*
