[English Version](./README.md) | **中文版本**

---

# VivaNote

**VivaNote** 是一个为语言学习者设计的智能笔记应用。它**支持任何浏览器 TTS（语音合成）引擎兼容的语言**。应用集成了 Markdown 渲染、交互式点读（Point-and-Read）和多语言语音合成功能，帮助用户在阅读和记录笔记的同时，更直观地学习外语发音和语法。

## 1. 项目简介

本应用采用 Next.js (App Router) 构建，利用 Supabase 进行身份验证和数据存储，并部署在 Cloudflare Pages 上。其核心亮点在于**交互式文本处理**——能够自动识别笔记中的目标语言短语，并将其转化为可点击的交互元素，触发高质量的语音朗读。

只要您的浏览器（如 Chrome, Safari, Edge）支持某种语言的语音包，本应用即可支持该语言的发音。

## 2. 已完成功能

- **身份验证与用户系统**:
  - 集成 Google OAuth 登录。
  - 邮箱密码登录。
  - 邮箱邀请注册（`scripts/invite.sh` → `/auth/invite?email=xxx`）。
  - 用户配置管理（Target Language 选择）。
  - 存储空间配额跟踪（Storage tracking）。

- **笔记管理**:
  - 完整的 CRUD 功能（创建、读取、更新、删除）。
  - 文件夹组织（创建 / 重命名 / 删除）。
  - 拖拽移动笔记到文件夹。
  - 文件夹重命名（双击或三点菜单）。
  - 收藏视图（可按更新时间排序）。
  - 响应式侧边栏和编辑界面。
  - **笔记分享**: 通过公开链接分享笔记供他人只读访问。
    - 试试看: [https://vivanote.epubtranslation.com/share/6ed572b32dfc481f8eceefac771fc2f81bd08712989d4658910ffc7b19f6950b](https://vivanote.epubtranslation.com/share/6ed572b32dfc481f8eceefac771fc2f81bd08712989d4658910ffc7b19f6950b)

- **核心交互功能**:
  - **交互式 Markdown 渲染**: 重写了 Markdown 组件，支持对段落、列表、标题等块级元素进行递归解析，实现词级/句级的交互。
  - **智能文本分割 (Text Segmentation)**: 基于不同语言的字符集（Alphabets），动态构建正则匹配模式，将目标语言短语与解释说明（如中文、英文翻译）分离。
  - **浏览器原生 TTS (点读功能)**:
    - **广泛的语言支持**: 基于 Web Speech API，支持浏览器/操作系统安装的所有语言（如西班牙语、法语、德语、英语、葡萄牙语、意大利语、荷兰语、日语、中文等）。
    - **智能声音选择**: 优先匹配系统提供的本地高质量语音包。
    - **交互式朗读**: 点击即可发音，自动取消当前播放并切换到新内容。

- **工程化建设**:
  - **测试套件**: 使用 Vitest + React Testing Library 进行单元测试和组件测试。
  - **目录重构**: 建立了清晰的项目结构，将测试文件迁移至独立的 `tests/` 目录。
  - **部署自动化**: 通过 Cloudflare Pages 实现 CI/CD。

## 3. 技术实现详解

### 交互式渲染流程 (`MarkdownRenderer.tsx`)
应用通过递归遍历 React 元素树，将所有字符串节点替换为 `TextSplitter` 组件。这种方法不仅支持纯文本，还能处理嵌套在粗体、斜体或链接中的文字，确保交互性无处不在。

### 语言感知分割 (`segmenter.ts` & `extractor.ts`)
分割逻辑不再是简单的按行分割，而是“按语言”分割：
1. **动态正则生成**: 根据用户设置的目标语言，从 `extractor.ts` 获取对应的字母表范围。
2. **短语捕获**: 正则表达式会捕获连贯的目标语言短语（包括标点符号、连字符和省略号），而保留括号内的翻译或注释为普通文本。

### 多语言 TTS 引擎 (`useTTS.ts`)
一个封装了浏览器 `speechSynthesis` API 的自定义 Hook：
- **文本清洗**: 在发送给 TTS 引擎之前，会通过 `extractTargetText` 剔除不属于该语言的干扰字符（如元注释）。
- **持久化**: 自动记住用户为每种语言选择的最佳声音。

## 4. 当前开发状态

- **当前分支**: `master`
- **最近更新**:
  - 文件夹系统已完成并上线。
  - 支持拖拽移动笔记到文件夹。
  - 文件夹支持 inline 重命名（双击或菜单）。
  - 文件夹删除功能（带确认弹窗）。
  - 收藏视图与侧边栏切换（All Notes / Favorites）。
  - 部署域名: [https://vivanote.epubtranslation.com](https://vivanote.epubtranslation.com)

## 5. 待完成事项 (Roadmap)

- [x] **Favorites 视图**: 收藏笔记视图。
- [ ] **激活策略优化**: 评估是否需要在 OAuth 登录时自动激活。
- [ ] **扩展语言支持**: 在 `extractor.ts` 中添加更多语言的字符集定义（如亚洲语言、西里尔字母等）。
- [ ] **离线支持**: 探索 PWA 可能性，支持离线阅读笔记。

## 6. 开发工作流 (Workflow)

本项目遵循一套标准化的工程工作流，以确保代码质量并减少低级错误：
- **实现阶段**: 修改 `.tsx` 代码时运行 `react-impl-review` 技能。
- **审查阶段**: 创建 PR 前运行 `pr-code-review` 技能。
- **发布阶段**: 使用 `git-ship` 技能自动化提交、推送并创建 PR。

详细说明请参考 [Workflow Convention](docs/WORKFLOW.md)。

## 7. 开发环境运行

```bash
npm install
npm run dev
```

运行测试：
```bash
npm test
```

---
*Last updated (最后更新): 2026-03-28*
