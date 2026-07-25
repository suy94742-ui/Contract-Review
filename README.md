# 合同体检

> AI 驱动的合同风险快速扫描工具。粘贴合同文本，30 秒内识别潜在风险条款。

## 快速启动

需要两个终端：

```bash
# 终端 1：启动后端
cd backend
npm install
cp .env.example .env
# 编辑 .env，填入 OPENAI_API_KEY 和 OPENAI_MODEL
npm run dev

# 终端 2：启动前端
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`，后端运行在 `http://localhost:3001`。

## 环境变量

### 后端 `.env`

| 变量 | 必填 | 说明 |
|---|---|---|
| `OPENAI_API_KEY` | 是 | AI 服务 API 密钥 |
| `OPENAI_MODEL` | 否 | 模型名称，默认 `gpt-4o-mini` |
| `DEMO_FALLBACK` | 否 | 设为 `true` 时，AI 不可用返回演示降级结果 |

### 前端 `.env`

| 变量 | 必填 | 说明 |
|---|---|---|
| `VITE_API_BASE_URL` | 否 | 后端地址，默认 `http://localhost:3001` |

## 项目结构

```
├── frontend/          # React + TypeScript + Vite + Tailwind
├── backend/           # Node.js + TypeScript + Express
├── shared/            # API 契约、风险分类
│   ├── api/
│   └── rules/
├── assets/examples/   # 示例合同和期望结果
└── docs/              # 验收清单、Demo 讲稿
```

## API 契约

- `GET /health` — 健康检查
- `POST /analyze` — 合同风险分析

详见 `shared/api/analyze.schema.json`。

## 技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind CSS
- 后端：Node.js + TypeScript + Express
- AI：OpenAI Chat Completions API

## 免责声明

本工具生成结果仅用于风险提示，**不构成法律意见**。重要合同决策请咨询专业律师。
