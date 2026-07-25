import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { analyzeRouter } from "./routes/analyze.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors({ origin: true }));
// 50,000 个中文字符约 150KB，留足余量；超限统一由下方错误中间件处理
app.use(express.json({ limit: "1mb" }));

app.use(healthRouter);
app.use(analyzeRouter);

// body-parser 错误标准化为契约错误结构
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  const e = err as { type?: string };
  const requestId = `req_${Date.now().toString(36)}`;
  if (e?.type === "entity.too.large") {
    res.status(413).json({
      error: {
        code: "TEXT_TOO_LONG",
        message: "合同内容超过 50,000 字符限制。",
        requestId,
      },
    });
    return;
  }
  if (e?.type === "entity.parse.failed") {
    res.status(400).json({
      error: {
        code: "INVALID_INPUT",
        message: "请求 JSON 格式不正确。",
        requestId,
      },
    });
    return;
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
