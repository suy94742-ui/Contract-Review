import { Router, Request, Response } from "express";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { validateAnalyzeRequest } from "../validation.js";
import { analyzeWithAI } from "../ai.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const analyzeRouter = Router();

function makeRequestId(): string {
  return `req_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

// Demo 降级结果：使用员工 4 主 Demo 合同对应的示例响应，诚实标注 demo_fallback
function buildFallbackResponse(requestId: string) {
  const example = JSON.parse(
    readFileSync(
      join(__dirname, "../../../shared/api/response.example.json"),
      "utf-8"
    )
  );
  return { ...example, requestId, source: "demo_fallback" as const };
}

analyzeRouter.post("/analyze", async (req: Request, res: Response) => {
  const requestId = makeRequestId();

  const validationError = validateAnalyzeRequest(req.body);
  if (validationError) {
    const httpStatus = validationError.code === "TEXT_TOO_LONG" ? 413 : 400;
    res.status(httpStatus).json({
      error: { ...validationError, requestId },
    });
    return;
  }

  // 显式开启降级时，返回演示数据（页面会标注"演示降级结果"）
  if (process.env.DEMO_FALLBACK === "true") {
    res.json(buildFallbackResponse(requestId));
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "AI 服务未配置密钥，请配置后重试或开启演示降级模式。",
        requestId,
      },
    });
    return;
  }

  try {
    const result = await analyzeWithAI(req.body, requestId);
    res.json(result);
  } catch (err) {
    const e = err as Error & { code?: string };
    if (e.code === "AI_TIMEOUT") {
      res.status(504).json({
        error: {
          code: "AI_TIMEOUT",
          message: "AI 分析超时，请稍后重试。",
          requestId,
        },
      });
      return;
    }
    if (e.code === "AI_INVALID_RESPONSE") {
      res.status(502).json({
        error: {
          code: "AI_INVALID_RESPONSE",
          message: "AI 返回结果异常，请重试。",
          requestId,
        },
      });
      return;
    }
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "服务内部错误，请稍后重试。",
        requestId,
      },
    });
  }
});
