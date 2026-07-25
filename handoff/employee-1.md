# 员工 1 交接

## 当前状态
进行中（第一阶段 0～15 分钟）

## 已完成
- [x] 推送 AGENTS.md 到 main 分支
- [x] 创建并冻结 `shared/api/analyze.schema.json`
- [x] 创建 `shared/api/request.example.json`
- [x] 创建 `shared/api/response.example.json`
- [x] 创建 `backend/prompts/contract-analysis.md` 初稿

## 启动命令
```bash
# 暂无独立服务，文件已提交到 main
```

## 验证命令和结果
```bash
# 检查 schema 语法
npx ajv-cli validate -s shared/api/analyze.schema.json -d shared/api/request.example.json

# 检查响应示例是否合法 JSON
node -e "JSON.parse(require('fs').readFileSync('shared/api/response.example.json'))"
```

## 对外接口或导出
- `shared/api/analyze.schema.json`：请求/响应 JSON Schema，含完整类型定义
- `shared/api/request.example.json`：POST /analyze 请求示例（租房合同）
- `shared/api/response.example.json`：成功响应示例（5 个风险）
- `backend/prompts/contract-analysis.md`：AI 系统 Prompt 初稿

## 依赖与环境变量
- 无特殊依赖
- 需要员工 3 配置 `OPENAI_API_KEY` 和 `OPENAI_MODEL`
- 需要员工 4 提供 `shared/rules/risk-taxonomy.json`

## 已知问题
- Prompt 尚未经过真实 AI 调优测试，T+45 联调时验证
- 未配置 Demo 降级开关（`DEMO_FALLBACK`），员工 3 负责实现

## 希望其他员工修改
- **员工 4**：请确认 `risk-taxonomy.json` 中的分类与 schema 枚举一致
- **员工 3**：Prompt 加载路径为 `backend/prompts/contract-analysis.md`，请按此路径读取
- **员工 2**：类型文件 `frontend/src/types/analyze.ts` 请与 schema 定义保持一致

## 最新可合并提交
- 分支：`main`
- commit：`feat(api): freeze analyze endpoint schema, examples and system prompt`
