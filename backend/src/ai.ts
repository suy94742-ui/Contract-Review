import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DISCLAIMER =
  "本结果由 AI 生成，仅用于风险提示，不构成法律意见；重要合同请咨询专业律师。";
const LEVELS = ["high", "medium", "low"] as const;
const CHECKLIST_STATUS = ["pass", "warning", "unknown"];
const AI_TIMEOUT_MS = 45000;

type Level = (typeof LEVELS)[number];

interface AnalyzeBody {
  contractType: string;
  region?: string;
  text: string;
}

function loadPrompt(): string {
  return readFileSync(
    join(__dirname, "../prompts/contract-analysis.md"),
    "utf-8"
  );
}

function loadValidCategories(): Set<string> {
  try {
    const raw = readFileSync(
      join(__dirname, "../../shared/rules/risk-taxonomy.json"),
      "utf-8"
    );
    const taxonomy = JSON.parse(raw);
    return new Set(
      (taxonomy.categories || []).map((c: { id: string }) => c.id)
    );
  } catch {
    return new Set(["other"]);
  }
}

function aiError(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

export async function analyzeWithAI(body: AnalyzeBody, requestId: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (
    process.env.OPENAI_BASE_URL || "https://api.moonshot.cn/v1"
  ).replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "moonshot-v1-8k";

  const systemPrompt = loadPrompt();
  const validCategories = loadValidCategories();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  let raw = "";
  try {
    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `合同类型：${body.contractType}\n地区：${
              body.region || "未提供"
            }\n\n合同正文：\n${body.text}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw aiError("AI_INVALID_RESPONSE", `AI 服务返回 HTTP ${resp.status}`);
    }
    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    raw = data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    const e = err as Error & { code?: string; name?: string };
    if (e.name === "AbortError") {
      throw aiError("AI_TIMEOUT", "AI 调用超时");
    }
    if (e.code) throw e;
    throw aiError("AI_INVALID_RESPONSE", "AI 请求失败");
  } finally {
    clearTimeout(timer);
  }

  // 去除可能的代码围栏后解析 JSON
  let parsed: {
    summary?: unknown;
    risks?: unknown;
    checklist?: unknown;
  };
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    throw aiError("AI_INVALID_RESPONSE", "AI 返回内容不是合法 JSON");
  }

  if (!parsed || !Array.isArray(parsed.risks)) {
    throw aiError("AI_INVALID_RESPONSE", "AI 返回缺少 risks 字段");
  }

  // 标准化：等级过滤、分类映射、ID 补齐、计数重算、排序
  const risks = (parsed.risks as Record<string, unknown>[])
    .filter((r) => r && LEVELS.includes(r.level as Level))
    .map((r) => ({
      id: "",
      level: r.level as Level,
      category: validCategories.has(String(r.category))
        ? String(r.category)
        : "other",
      title: String(r.title ?? "未命名风险"),
      originalText: String(r.originalText ?? ""),
      explanation: String(r.explanation ?? ""),
      suggestion: String(r.suggestion ?? ""),
    }));

  const order: Record<Level, number> = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => order[a.level] - order[b.level]);
  risks.forEach((r, i) => {
    r.id = `risk_${i + 1}`;
  });

  const count = (l: Level) => risks.filter((r) => r.level === l).length;
  const overallRisk: Level =
    count("high") > 0 ? "high" : count("medium") > 0 ? "medium" : "low";

  const checklist = Array.isArray(parsed.checklist)
    ? (parsed.checklist as Record<string, unknown>[])
        .filter(
          (c) =>
            c && c.id && c.label && CHECKLIST_STATUS.includes(String(c.status))
        )
        .map((c) => ({
          id: String(c.id),
          label: String(c.label),
          status: String(c.status),
          ...(c.note ? { note: String(c.note) } : {}),
        }))
    : [];

  return {
    requestId,
    source: "ai" as const,
    summary: String(parsed.summary ?? "分析完成。"),
    overallRisk,
    riskCount: {
      total: risks.length,
      high: count("high"),
      medium: count("medium"),
      low: count("low"),
    },
    risks,
    checklist,
    disclaimer: DISCLAIMER,
  };
}
