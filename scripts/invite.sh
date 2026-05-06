#!/usr/bin/env bash
# 邮件邀请工具 - 通过 Supabase REST API 调用 create_email_invite 函数
#
# 用法：
#   ./scripts/invite.sh <邮箱>                   # 单次邀请（默认）
#   ./scripts/invite.sh <邮箱> reusable           # 可重用邀请
#   ./scripts/invite.sh <邮箱> one_time 7         # 单次邀请，7 天后过期
#
# 示例：
#   ./scripts/invite.sh alice@example.com
#   ./scripts/invite.sh alice@example.com reusable
#   ./scripts/invite.sh alice@example.com one_time 7

set -euo pipefail

# 读取 .env.local
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env.local"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

if [[ -z "$SUPABASE_URL" || -z "$SERVICE_KEY" ]]; then
  echo "❌  缺少环境变量，请检查 .env.local 中是否包含："
  echo "   NEXT_PUBLIC_SUPABASE_URL"
  echo "   SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

EMAIL="${1:-}"
POLICY="${2:-one_time}"
EXPIRY_DAYS="${3:-}"

if [[ -z "$EMAIL" ]]; then
  echo "❌  用法：./scripts/invite.sh <邮箱> [策略: one_time|reusable] [过期天数]"
  echo ""
  echo "示例："
  echo "  ./scripts/invite.sh alice@example.com"
  echo "  ./scripts/invite.sh alice@example.com reusable"
  echo "  ./scripts/invite.sh alice@example.com one_time 7"
  exit 1
fi

if [[ "$POLICY" != "one_time" && "$POLICY" != "reusable" ]]; then
  echo "❌  策略必须是 one_time 或 reusable，当前输入：$POLICY"
  exit 1
fi

# 构建 expires_at（仅 macOS）
EXPIRES_AT="null"
if [[ -n "$EXPIRY_DAYS" ]]; then
  EXPIRES_AT="\"$(date -u -v+${EXPIRY_DAYS}d '+%Y-%m-%dT%H:%M:%SZ')\""
fi

echo ""
echo "🔗  正在为 ${EMAIL} 创建邀请..."

# 调用 Supabase RPC
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/create_email_invite" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"input_email\": \"${EMAIL}\", \"input_expires_at\": ${EXPIRES_AT}, \"input_policy\": \"${POLICY}\"}")

# 检查错误
if echo "$RESPONSE" | grep -q '"code"\|"error"\|"message"'; then
  MSG=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message', d.get('error', str(d))))" 2>/dev/null || echo "$RESPONSE")
  echo "❌  创建失败：$MSG"
  exit 1
fi

# 解析结果
NORMALIZED_EMAIL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['email_normalized'] if isinstance(d, list) else d['email_normalized'])" 2>/dev/null || echo "$EMAIL")
ENCODED_EMAIL=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${NORMALIZED_EMAIL}'))")
SIGNUP_URL="${APP_URL}/auth/invite?email=${ENCODED_EMAIL}"

echo ""
echo "✅  邀请创建成功！"
echo "─────────────────────────────────────────"
echo "📧  邮箱：${NORMALIZED_EMAIL}"
echo "🎟   策略：${POLICY}"
if [[ -n "$EXPIRY_DAYS" ]]; then
  echo "⏰  过期：${EXPIRY_DAYS} 天后"
else
  echo "⏰  过期：永不过期"
fi
echo ""
echo "🔗  发给用户的注册链接："
echo "    ${SIGNUP_URL}"
echo "─────────────────────────────────────────"
echo ""
