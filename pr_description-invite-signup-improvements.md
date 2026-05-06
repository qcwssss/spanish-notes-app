# 邀请注册密码强度校验与体验优化

## 变更目标
提升邀请注册流程的用户体验：精确提示密码强度要求，并在注册成功后提供清晰的引导页面。

## 详细变更内容
- **密码强度细粒度校验**：将原来的单一正则表达式重构为针对大小写字母及数字的独立校验规则 (`HAS_LOWERCASE`, `HAS_UPPERCASE`, `HAS_NUMBER`)。
- **精准的错误反馈**：
  - 更新了前端的 `validateForm` 逻辑，现在当密码不符合强度要求时，会直接提示具体缺失哪类字符（如：缺少大写字母）。
  - 增强了 `mapErrorMessage`，以便从 Supabase 返回的密码偏弱错误中提取具体信息并做相应的 UI 翻译提示。
  - 同意新增了一系列 i18n 错误描述文本 (`passwordMissingLower`, `passwordMissingUpper`, `passwordMissingNumber`, `passwordWeakGeneric`)。
- **注册成功界面升级**：废弃了在已有表单下方显示一行简略成功的旧做法。现在当用户注册成功 (`isSuccess === true`) 时，整个表单将会替换为一个清晰友好的“检查邮箱”引导界面，并且告知用户注册链接已发出，同时提醒有可能会被误判进入垃圾邮件箱。新增了配套的多语言界面文案 (`successTitle`, `successBody`, `successHint`)。

## 测试建议
1. 进入邀请注册页面使用密码 `redferrari`，应提示缺少大写字母。
2. 使用密码 `REDFERRARI`，应提示缺少小写字母。
3. 使用密码 `redFerrari`，应提示缺少数字。
4. 使用满足条件的密码完成后，应看到全新的带有 ✉️ 图标和下一步处理事项说明的成功提示页面。
