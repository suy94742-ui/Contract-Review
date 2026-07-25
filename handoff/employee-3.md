# 员工 3 交接（后端）

## 当前状态
- 可联调

## 已完成
- 项目骨架（package.json, tsconfig.json, 依赖安装）
- `GET /health` 返回 200 `{"status":"ok"}`
- `POST /analyze` 输入校验（contractType 必填、text 20-50000 字符）
- `POST /analyze` 符合第 4 节 API 契约的响应（当前为固定示例数据，待接入 AI）
- `.env.example` 环境变量模板
- TypeScript 类型检查通过

## 启动命令
```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 填入 OPENAI_API_KEY（Demo 降级模式可跳过）
npm run dev
# 默认监听 http://localhost:3001
```

## 验证命令和结果
```bash
# 健康检查
curl http://localhost:3001/health
# 预期：{"status":"ok"}

# 正常分析
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"contractType":"rental","region":"上海","text":"甲方将位于上海市浦东新区的房屋出租给乙方，租期一年，月租3000元，押金两个月。无论任何原因退租，押金均不予退还。房东有权提前24小时通知后进入房屋检查。"}'
# 预期：200, 完整分析 JSON（见 shared/api/response.example.json）

# 空文本
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"contractType":"rental","text":"短"}'
# 预期：400, {"error":{"code":"INVALID_INPUT",...}}

# 超长文本
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"contractType":"rental","text":"（50001 个字符）"}'
# 预期：413, {"error":{"code":"TEXT_TOO_LONG",...}}
```

## 对外接口或导出
- `GET /health` — 健康检查
- `POST /analyze` — 合同风险分析（当前为固定示例数据，待接入真实 AI）

## 依赖与环境变量
- 依赖员工 1：`backend/prompts/contract-analysis.md`（Prompt 文件）
- 依赖员工 4：`shared/rules/risk-taxonomy.json`（风险分类）
- 环境变量：`OPENAI_API_KEY`, `OPENAI_MODEL`, `DEMO_FALLBACK`, `PORT`

## 已知问题
- AI 调用尚未接入，当前返回固定示例数据
- 待实现：AI 调用、超时处理、响应标准化、降级逻辑

## 希望其他员工修改
- 无

## 最新可合并提交
- 分支：codex/employee-3-backend
- commit：待重新提交
