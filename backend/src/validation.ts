const VALID_CONTRACT_TYPES = [
  "rental",
  "employment",
  "user_agreement",
  "part_time",
  "other",
] as const;

export type ContractType = (typeof VALID_CONTRACT_TYPES)[number];

export interface ValidationError {
  code: string;
  message: string;
}

export function validateAnalyzeRequest(body: any): ValidationError | null {
  if (!body || typeof body !== "object") {
    return { code: "INVALID_INPUT", message: "请求格式不正确。" };
  }

  if (!body.contractType || !VALID_CONTRACT_TYPES.includes(body.contractType)) {
    return {
      code: "INVALID_INPUT",
      message: `contractType 必填，可选值：${VALID_CONTRACT_TYPES.join("、")}。`,
    };
  }

  if (typeof body.text !== "string") {
    return { code: "INVALID_INPUT", message: "请粘贴合同内容。" };
  }

  const trimmed = body.text.trim();
  if (trimmed.length < 20) {
    return {
      code: "INVALID_INPUT",
      message: "请粘贴至少 20 个字符的合同内容。",
    };
  }

  if (trimmed.length > 50000) {
    return { code: "TEXT_TOO_LONG", message: "合同内容超过 50,000 字符限制。" };
  }

  return null;
}
