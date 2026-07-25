// 合同风险分析接口类型定义
// 与 shared/api/analyze.schema.json 保持一致
// 由员工 1 创建和维护契约，员工 2/5 只读取不修改

export type ContractType =
  | "rental"
  | "employment"
  | "user_agreement"
  | "part_time"
  | "other";

export type RiskLevel = "high" | "medium" | "low";

export type Source = "ai" | "demo_fallback";

export type ChecklistStatus = "pass" | "warning" | "unknown";

export type RiskCategory =
  | "deposit"
  | "penalty"
  | "compensation"
  | "unilateral_change"
  | "automatic_renewal"
  | "termination"
  | "liability_exemption"
  | "privacy"
  | "non_compete"
  | "confidentiality"
  | "arbitration"
  | "jurisdiction"
  | "property_access"
  | "other";

export interface Risk {
  id: string;
  level: RiskLevel;
  category: RiskCategory;
  title: string;
  originalText: string;
  explanation: string;
  suggestion: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistStatus;
  note?: string;
}

export interface RiskCount {
  total: number;
  high: number;
  medium: number;
  low: number;
}

// POST /analyze 请求
export interface AnalyzeRequest {
  contractType: ContractType;
  region?: string;
  text: string;
}

// POST /analyze 成功响应
export interface AnalyzeResponse {
  requestId: string;
  source: Source;
  summary: string;
  overallRisk: RiskLevel;
  riskCount: RiskCount;
  risks: Risk[];
  checklist: ChecklistItem[];
  disclaimer: string;
}

// 错误响应
export interface ApiError {
  error: {
    code: "INVALID_INPUT" | "TEXT_TOO_LONG" | "AI_TIMEOUT" | "AI_INVALID_RESPONSE" | "INTERNAL_ERROR";
    message: string;
    requestId: string;
  };
}

// 通用响应类型
export type AnalyzeResult = AnalyzeResponse | ApiError;
