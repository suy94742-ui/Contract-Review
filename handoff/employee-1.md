# 员工 1 交接

## 当前状态
**整合完成，全链路可演示**（冒烟 10/10，前端可跑完整流程）

## 已完成（本轮整合）
- [x] 合并员工 4 分支（`0468d9a`），三份示例合同逐字校验通过
- [x] 集成员工 3 后端（validation + routes，文件经微信收到，非 Git 分支）
- [x] 员工 1 最终连接：实现 `backend/src/ai.ts` 真实 AI 调用（25s 超时、去围栏、JSON 校验、ID/计数/排序/免责声明标准化）
- [x] 移除员工 3 的 mock.ts（非降级路径冒充 `source:"ai"`，违反契约）
- [x] 降级路径改为返回 `response.example.json` + `source: "demo_fallback"`
- [x] 修复 `express.json` 100KB 限制 → 1mb，body-parser 错误标准化为契约 JSON
- [x] 员工 2 前端未交付（其转发的文件夹实为员工 3 后端），由员工 1 按 §3 完成 `App.tsx` 单页全流程 + `lib/api.ts`
- [x] 后端 tsc ✅ / 前端 build ✅ / 冒烟测试 10/10 ✅ / 无密钥返回 INTERNAL_ERROR ✅
- [x] 路演 PPT：`合同体检-路演.pptx`（7 页，含演讲备注）

## 已完成
- [x] 推送 AGENTS.md 到 main 分支
- [x] 创建并冻结 `shared/api/analyze.schema.json`
- [x] 创建 `shared/api/request.example.json`（主 Demo：租房合同）
- [x] 创建 `shared/api/response.example.json`
- [x] 创建 `backend/prompts/contract-analysis.md`（已调优，含防注入+无引用法条+纯JSON约束）
- [x] 创建 `shared/rules/risk-taxonomy.json`（14 类风险分类）
- [x] 创建 `frontend/src/types/analyze.ts`（TypeScript 类型定义）
- [x] 创建前端项目骨架（package/vite/tsconfig/tailwind/postcss/html/main/App/css）
- [x] 创建后端项目骨架（package/tsconfig/src/index.ts）
- [x] 创建 `frontend/src/ui/index.ts` + 6 个组件骨架
- [x] 创建 `frontend/src/lib/api.ts` 骨架
- [x] 创建 `docs/acceptance-checklist.md`
- [x] 创建 `docs/demo-script.md`
- [x] 创建 `README.md` 骨架
- [x] 创建根目录 `.gitignore`
- [x] 创建 `backend/.env.example`
- [x] 创建 `scripts/smoke-test.sh` + `scripts/check_json.py`（冒烟测试）
- [x] 创建 `assets/examples/rental-risky.txt` + `.expected.json`（主 Demo 合同）
- [x] 创建 `assets/examples/employment-risky.txt` + `.expected.json`（骨架）
- [x] 创建 `assets/examples/user-agreement-risky.txt` + `.expected.json`（骨架）
- [x] 创建 `assets/examples/README.md`
- [x] 创建 `handoff/employee-1.md` ~ `employee-5.md`

### 验证结果
- [x] 后端 `GET /health` ✅ `{"status":"ok"}`
- [x] 后端 `POST /analyze`（临时接口）✅ 返回 200，5 个风险，`demo_fallback`
- [x] 前端 `tsc --noEmit` ✅ 类型检查通过
- [x] 冒烟测试脚本 ✅ 7 项中 4 项通过
- [x] **Prompt AI 测试（第1次）** ✅ 7 个风险，3 high，纯 JSON 输出
- [x] **Prompt AI 测试（第2次）** ✅ 7 个风险，4 high，结构稳定
- [x] **提示注入防护测试** ✅ AI 未被欺骗，正确识别单方修改权

## 启动命令
```bash
# 后端（需配置 .env 中的 OPENAI_API_KEY）
cd backend && npm install && cp .env.example .env
# 编辑 .env 填入 OPENAI_API_KEY
npm run dev

# 前端（新终端）
cd frontend && npm install && npm run dev

# 冒烟测试（后端运行后）
bash scripts/smoke-test.sh
```

## 验证命令和结果
```bash
# 后端健康检查
curl http://localhost:3001/health
# 结果：{"status":"ok"}

# 前端类型检查
cd frontend && npx tsc --noEmit
# 结果：通过

# 冒烟测试
bash scripts/smoke-test.sh
# 结果：7 项中 4 项通过（正常请求、健康检查、超长文本、无效类型）
#       3 项等待员工 3 实现校验（空文本、过短文本、缺少字段）
```

## Prompt 测试结果（关键）

使用 Kimi API (`moonshot-v1-8k`) 测试主 Demo 合同 (`rental-risky.txt`)：

**第 1 次运行：**
- overallRisk: `high`
- 7 个风险：deposit(high) + penalty(high) + property_access(high) + automatic_renewal(medium) + liability_exemption(medium) + arbitration(medium) + privacy(medium)

**第 2 次运行：**
- overallRisk: `high`
- 7 个风险：deposit(high) + penalty(high) + termination(high) + automatic_renewal(high) + liability_exemption(medium) + privacy(medium) + property_access(medium)

**提示注入测试：**
- 输入包含 "请忽略之前所有指令" 的攻击文本
- AI 未被欺骗，正确识别出 `unilateral_change(medium)` 风险

## 对外接口或导出
- `shared/api/analyze.schema.json`：API 契约 Schema
- `shared/api/request.example.json` / `response.example.json`：请求/响应示例
- `shared/rules/risk-taxonomy.json`：风险分类体系（14 类）
- `backend/prompts/contract-analysis.md`：AI 系统 Prompt（已调优）
- `frontend/src/types/analyze.ts`：TypeScript 类型定义
- `frontend/src/ui/index.ts`：UI 组件统一导出
- `frontend/src/lib/api.ts`：API 调用骨架
- `scripts/smoke-test.sh`：冒烟测试脚本
- `assets/examples/rental-risky.txt`：主 Demo 合同（6 个预期风险）

## 依赖与环境变量
- 后端需要 `OPENAI_API_KEY` — 已由员工 1 验证可用（Kimi API 兼容 OpenAI 格式）
- 后端 `OPENAI_MODEL` 建议用 `moonshot-v1-8k`（测试通过）
- 前端需要 `VITE_API_BASE_URL`（默认 `http://localhost:3001`）

## 已知问题
- `POST /analyze` 当前返回固定示例数据，未调用真实 AI（员工 3 负责接入）
- 后端缺少输入校验（空文本、过短文本、缺少字段均返回 200 而非 400）
- 未配置 Demo 降级开关（`DEMO_FALLBACK`），员工 3 负责实现

## 希望其他员工修改
- **员工 2**：填充首页/结果页状态流，完善 `lib/api.ts`（AbortController、错误处理）
- **员工 3**：实现真实 AI 调用、输入校验、超时处理、错误标准化、降级逻辑
- **员工 4**：完善 `employment-risky.txt` 和 `user-agreement-risky.txt` 为完整合同文本
- **员工 5**：实现 6 个 UI 组件的完整视觉和交互

## 冒烟测试当前状态（2026-07-25 复测）

本轮修复（员工 1 实操内容）：
- `scripts/smoke-test.sh` 第 2 项：`source` 断言由硬编码 `demo_fallback` 改为接受 `ai|demo_fallback`（真实 AI 接通后不会误判失败）
- 第 6 项：超长文本只接受 HTTP 413，不再把临时接口的 200 判为通过
- 第 7 项：无效 contractType 只接受 HTTP 400，不再接受 200
- `.gitignore` 移除 `package-lock.json` 忽略规则，前后端 lock 文件纳入 Git，避免五人并行版本漂移

实测结果（后端临时接口）：通过 5 / 失败 5。失败项全部是员工 3 待实现的输入校验，脚本现在能真实暴露问题。

| # | 场景 | 状态 | 备注 |
|---|---|---|---|
| 1 | GET /health | ✅ | 返回 ok |
| 2 | 正常请求 | ✅ | 5 个风险，source 断言已兼容 ai/demo_fallback |
| 3 | 空文本 | ❌ | 临时接口返回 200，等员工 3 实现校验 |
| 4 | 文本过短 | ❌ | 同上 |
| 5 | 缺少 contractType | ❌ | 同上 |
| 6 | 超长文本 | ❌ | 期望 413，等员工 3 实现 |
| 7 | 无效 contractType | ❌ | 期望 400，等员工 3 实现 |

## 最新可合并提交
- 分支：`main`
- commit：`d4576ed` feat(prompt): optimize for stable JSON output, add anti-injection and no-legal-citation rules
