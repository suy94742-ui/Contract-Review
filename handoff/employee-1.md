# 员工 1 交接

## 当前状态
进行中（第二阶段：Prompt 自测与契约完善）

## 已完成
- [x] 推送 AGENTS.md 到 main 分支
- [x] 创建并冻结 `shared/api/analyze.schema.json`
- [x] 创建 `shared/api/request.example.json`（主 Demo：租房合同）
- [x] 创建 `shared/api/response.example.json`
- [x] 创建 `backend/prompts/contract-analysis.md` 初稿
- [x] 创建 `docs/acceptance-checklist.md`
- [x] 创建 `docs/demo-script.md`
- [x] 创建 `README.md` 骨架
- [x] 创建 `handoff/employee-1.md`
- [x] 创建根目录 `.gitignore`
- [x] 创建 `backend/.env.example`
- [x] 主 Demo 合同选定：租房合同
- [x] 请求/响应示例结构校验通过

## 启动命令
```bash
# 暂无独立服务，文件已提交到 main
```

## 验证命令和结果
```bash
# 请求/响应示例 JSON 结构校验
python3 /tmp/validate_schema.py
# 结果：请求示例 OK / 响应示例 OK
```

## 对外接口或导出
- `shared/api/analyze.schema.json`：请求/响应 JSON Schema，含完整类型定义
- `shared/api/request.example.json`：POST /analyze 请求示例（租房合同，5 个核心风险）
- `shared/api/response.example.json`：成功响应示例
- `backend/prompts/contract-analysis.md`：AI 系统 Prompt 初稿
- `backend/.env.example`：后端环境变量模板

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
- commit：`8367709` chore(backend): add .env.example with OPENAI config
