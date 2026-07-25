# 员工 1 交接

## 当前状态
骨架层全部就绪，等待其他员工填充业务逻辑

## 已完成
- [x] 推送 AGENTS.md 到 main 分支
- [x] 创建并冻结 `shared/api/analyze.schema.json`
- [x] 创建 `shared/api/request.example.json`（主 Demo：租房合同）
- [x] 创建 `shared/api/response.example.json`
- [x] 创建 `backend/prompts/contract-analysis.md` 初稿
- [x] 创建 `shared/rules/risk-taxonomy.json`
- [x] 创建 `frontend/src/types/analyze.ts`
- [x] 创建前端项目骨架（package.json / vite / tsconfig / tailwind / postcss / index.html / main.tsx / App.tsx / index.css）
- [x] 创建后端项目骨架（package.json / tsconfig / src/index.ts）
- [x] 创建 `frontend/src/ui/index.ts` + 6 个组件骨架
- [x] 创建 `frontend/src/lib/api.ts` 骨架
- [x] 创建 `docs/acceptance-checklist.md`
- [x] 创建 `docs/demo-script.md`
- [x] 创建 `README.md` 骨架
- [x] 创建 `handoff/employee-1.md` ~ `employee-5.md`
- [x] 创建根目录 `.gitignore`
- [x] 创建 `backend/.env.example`
- [x] 主 Demo 合同选定：租房合同
- [x] 请求/响应示例结构校验通过

## 启动命令
```bash
# 后端
cd backend && npm install && cp .env.example .env && npm run dev

# 前端（新终端）
cd frontend && npm install && npm run dev
```

## 验证命令和结果
```bash
# 后端健康检查
curl http://localhost:3001/health
# 预期：{"status":"ok"}

# 前端构建
# cd frontend && npm run build
# 预期：构建通过
```

## 对外接口或导出
- `shared/api/analyze.schema.json`：API 契约 Schema
- `shared/api/request.example.json` / `response.example.json`：请求/响应示例
- `shared/rules/risk-taxonomy.json`：风险分类体系
- `backend/prompts/contract-analysis.md`：AI 系统 Prompt
- `frontend/src/types/analyze.ts`：TypeScript 类型定义
- `frontend/src/ui/index.ts`：UI 组件统一导出
- `frontend/src/lib/api.ts`：API 调用骨架

## 依赖与环境变量
- 后端需要 `OPENAI_API_KEY`（员工 3 配置）
- 前端需要 `VITE_API_BASE_URL`（默认 `http://localhost:3001`）

## 已知问题
- Prompt 尚未经过真实 AI 调优测试，T+45 联调时验证
- 前后端骨架可运行，但业务逻辑未实现
- `POST /analyze` 目前返回固定示例数据

## 希望其他员工修改
- **员工 2**：填充首页/结果页状态流，完善 `lib/api.ts`
- **员工 3**：实现真实 AI 调用、校验、标准化、错误处理
- **员工 4**：编写示例合同和 expected.json
- **员工 5**：实现 6 个 UI 组件的完整视觉和交互

## 最新可合并提交
- 分支：`main`
- commit：待提交（本次骨架统一提交）
