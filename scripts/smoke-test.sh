#!/usr/bin/env bash
# 合同体检 Demo 冒烟测试脚本
# 运行前确保后端服务已启动：cd backend && npm run dev

BASE_URL="${API_BASE:-http://localhost:3001}"
PASS=0
FAIL=0

check_json() {
  local json="$1"
  local key="$2"
  local expected="$3"
  if python3 scripts/check_json.py "$json" "$key" "$expected"; then
    ((PASS++))
  else
    ((FAIL++))
  fi
}

echo "=== 合同体检 Demo 冒烟测试 ==="
echo "目标: $BASE_URL"
echo ""

# 1. 健康检查
echo "[1/7] GET /health"
RESP=$(curl -s "$BASE_URL/health")
check_json "$RESP" "status" "ok"
echo ""

# 2. 正常分析请求（租房合同）
echo "[2/7] POST /analyze - 正常请求"
RESP=$(curl -s -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{"contractType":"rental","region":"上海","text":"房屋租赁合同。甲方王某，乙方李某。租赁期限2024年1月1日至12月31日。每月租金5000元，押金10000元。无论任何原因退租，押金均不予退还。"}')
check_json "$RESP" "overallRisk" "high"
SOURCE=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('source',''))" 2>/dev/null)
if [ "$SOURCE" = "ai" ] || [ "$SOURCE" = "demo_fallback" ]; then
  echo "  ✓ source = $SOURCE"
  ((PASS++))
else
  echo "  ✗ source 非法 (期望 ai|demo_fallback, 实际: $SOURCE)"
  ((FAIL++))
fi
check_json "$RESP" "requestId" "req_"
RISK_COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('risks',[])))")
if [ "$RISK_COUNT" -gt 0 ]; then
  echo "  ✓ risks count = $RISK_COUNT"
  ((PASS++))
else
  echo "  ✗ risks 为空"
  ((FAIL++))
fi
echo ""

# 3. 空文本
echo "[3/7] POST /analyze - 空文本"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{"contractType":"rental","text":""}')
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo "  ✓ HTTP 400"
  ((PASS++))
else
  echo "  ✗ 期望 HTTP 400, 实际 $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# 4. 文本过短
echo "[4/7] POST /analyze - 文本过短"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{"contractType":"rental","text":"太短"}')
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo "  ✓ HTTP 400"
  ((PASS++))
else
  echo "  ✗ 期望 HTTP 400, 实际 $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# 5. 缺少必填字段
echo "[5/7] POST /analyze - 缺少 contractType"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text":"测试合同内容至少需要二十个字符以上"}')
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo "  ✓ HTTP 400"
  ((PASS++))
else
  echo "  ✗ 期望 HTTP 400, 实际 $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# 6. 超长文本（模拟）
echo "[6/7] POST /analyze - 超长文本 (>50000)"
LONG_TEXT=$(python3 -c "print('x' * 50001)")
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"contractType\":\"rental\",\"text\":\"$LONG_TEXT\"}")
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "413" ]; then
  echo "  ✓ HTTP 413"
  ((PASS++))
else
  echo "  ✗ 期望 HTTP 413 (TEXT_TOO_LONG), 实际 $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# 7. 无效合同类型
echo "[7/7] POST /analyze - 无效 contractType"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{"contractType":"invalid","text":"测试合同内容至少需要二十个字符以上"}')
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo "  ✓ HTTP 400"
  ((PASS++))
else
  echo "  ✗ 期望 HTTP 400 (INVALID_INPUT), 实际 $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# 汇总
echo "========================="
echo "通过: $PASS"
echo "失败: $FAIL"
if [ "$FAIL" -eq 0 ]; then
  echo "✅ 全部通过"
  exit 0
else
  echo "❌ 有失败项"
  exit 1
fi
