# 员工 3 交接（后端）

## 当前状态
骨架已就绪，等待实现完整业务逻辑

## 已完成
- [x] 后端项目骨架（package.json / tsconfig）
- [x] `backend/src/index.ts` 含 `GET /health` 和临时 `POST /analyze`
- [x] `backend/.env.example` 环境变量模板（由员工 1 创建）

## 启动命令
```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 填入 OPENAI_API_KEY
npm run dev
# 默认监听 http://localhost:3001
```

## 验证命令和结果
```bash
# 健康检查
curl http://localhost:3001/health
# 预期：{"status":"ok"}

# 临时分析接口
curl -X POST http://localhost:3001/analyze \
  -H 'Content-Type: application/json' \
  -d '{"contractType":"rental","text":"测试合同内容，至少需要二十个字符以上。"}'
# 预期：返回 response.example.json 内容
```

## 对外接口或导出
- `GET /health` — 健康检查
- `POST /analyze` — 合同分析（当前为固定返回）

## 依赖与环境变量
- 依赖见 `backend/package.json`
- 必需环境变量：`OPENAI_API_KEY`
- 可选：`OPENAI_MODEL`、`PORT`、`DEMO_FALLBACK`

## 已知问题
- `POST /analyze` 目前返回固定示例数据，未调用真实 AI
- 缺少输入校验、超时处理、错误标准化、降级逻辑
- 未读取 `backend/prompts/contract-analysis.md` 和 `shared/rules/risk-taxonomy.json`

## 希望其他员工修改
- 无

## 最新可合并提交
- 分支：待创建 `codex/employee-3-backend`
- commit：待提交
