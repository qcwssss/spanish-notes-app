#!/usr/bin/env node
/**
 * 邮件邀请工具
 * 用法：npm run invite <邮箱> [策略] [过期天数]
 *
 * 示例：
 *   npm run invite alice@example.com
 *   npm run invite alice@example.com reusable
 *   npm run invite alice@example.com one_time 7
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 读取 .env.local 中的配置（简单解析，无需额外依赖）
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local 不存在则忽略，依赖系统环境变量
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 缺少环境变量：');
  if (!SUPABASE_URL) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n请在 .env.local 中配置这两个变量后重试。');
  process.exit(1);
}

const [, , email, policy = 'one_time', expiryDays] = process.argv;

if (!email) {
  console.error('❌ 用法：npm run invite <邮箱> [策略: one_time|reusable] [过期天数]');
  console.error('\n示例：');
  console.error('  npm run invite alice@example.com');
  console.error('  npm run invite alice@example.com reusable');
  console.error('  npm run invite alice@example.com one_time 7');
  process.exit(1);
}

if (!['one_time', 'reusable'].includes(policy)) {
  console.error(`❌ 策略必须是 one_time 或 reusable，当前输入：${policy}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let expiresAt = null;
if (expiryDays) {
  const days = parseInt(expiryDays, 10);
  if (isNaN(days) || days <= 0) {
    console.error(`❌ 过期天数必须是正整数，当前输入：${expiryDays}`);
    process.exit(1);
  }
  expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

console.log(`\n🔗 正在为 ${email} 创建邀请...`);

const { data, error } = await supabase.rpc('create_email_invite', {
  input_email: email,
  input_expires_at: expiresAt,
  input_policy: policy,
});

if (error) {
  console.error(`❌ 创建失败：${error.message}`);
  process.exit(1);
}

const row = Array.isArray(data) ? data[0] : data;
const inviteUrl = `${SUPABASE_URL.replace('.supabase.co', '')}/auth/invite?email=${encodeURIComponent(row.email_normalized)}`;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const signupUrl = `${appUrl}/auth/invite?email=${encodeURIComponent(row.email_normalized)}`;

console.log('\n✅ 邀请创建成功！');
console.log('─────────────────────────────────────────');
console.log(`📧 邮箱：${row.email_normalized}`);
console.log(`🎟  策略：${row.invite_policy}`);
console.log(`⏰ 过期：${row.expires_at ? new Date(row.expires_at).toLocaleString('zh-CN') : '永不过期'}`);
console.log(`\n🔗 发给用户的注册链接：\n   ${signupUrl}`);
console.log('─────────────────────────────────────────\n');
