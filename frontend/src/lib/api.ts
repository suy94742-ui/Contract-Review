import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ApiError,
  ChecklistItem,
  ContractType,
  Risk,
  RiskCategory,
  RiskLevel,
} from '../types/analyze';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(
  /\/+$/,
  '',
);
const DEFAULT_TIMEOUT_MS = 90_000;

type ApiErrorCode = ApiError['error']['code'];
const API_ERROR_CODES: ApiErrorCode[] = [
  'INVALID_INPUT',
  'TEXT_TOO_LONG',
  'AI_TIMEOUT',
  'AI_INVALID_RESPONSE',
  'INTERNAL_ERROR',
];
const CONTRACT_TYPES: ContractType[] = [
  'rental',
  'employment',
  'user_agreement',
  'part_time',
  'other',
];
const RISK_LEVELS: RiskLevel[] = ['high', 'medium', 'low'];
const RISK_CATEGORIES: RiskCategory[] = [
  'deposit',
  'penalty',
  'compensation',
  'unilateral_change',
  'automatic_renewal',
  'termination',
  'liability_exemption',
  'privacy',
  'non_compete',
  'confidentiality',
  'arbitration',
  'jurisdiction',
  'property_access',
  'other',
];
const CHECKLIST_STATUSES: ChecklistItem['status'][] = ['pass', 'warning', 'unknown'];

export interface AnalyzeOptions {
  /**
   * Optional caller-owned signal. The request is also cancelled automatically
   * after `timeoutMs` so a stalled API cannot leave the page in a loading state.
   */
  signal?: AbortSignal;
  timeoutMs?: number;
}

export class AnalyzeApiError extends Error {
  readonly code: ApiErrorCode;
  readonly requestId?: string;
  readonly status?: number;

  constructor(
    code: ApiErrorCode,
    message: string,
    options: { requestId?: string; status?: number } = {},
  ) {
    super(message);
    this.name = 'AnalyzeApiError';
    this.code = code;
    this.requestId = options.requestId;
    this.status = options.status;
  }
}

function isContractType(value: unknown): value is ContractType {
  return CONTRACT_TYPES.includes(value as ContractType);
}

function validateRequest(request: AnalyzeRequest) {
  const text = typeof request?.text === 'string' ? request.text.trim() : '';

  if (!isContractType(request?.contractType) || text.length < 20) {
    throw new AnalyzeApiError(
      'INVALID_INPUT',
      '请先选择合同类型，并粘贴至少 20 个字的合同内容。',
    );
  }

  if (text.length > 50_000) {
    throw new AnalyzeApiError(
      'TEXT_TOO_LONG',
      '合同内容超过 50,000 个字符，请删减后再试。',
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return RISK_LEVELS.includes(value as RiskLevel);
}

function isRiskCategory(value: unknown): value is RiskCategory {
  return RISK_CATEGORIES.includes(value as RiskCategory);
}

function isRisk(value: unknown): value is Risk {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    isRiskLevel(value.level) &&
    isRiskCategory(value.category) &&
    typeof value.title === 'string' &&
    typeof value.originalText === 'string' &&
    value.originalText.trim().length > 0 &&
    typeof value.explanation === 'string' &&
    typeof value.suggestion === 'string'
  );
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    CHECKLIST_STATUSES.includes(value.status as ChecklistItem['status']) &&
    (value.note === undefined || typeof value.note === 'string')
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  if (!isRecord(value)) return false;

  const riskCount = value.riskCount;
  return (
    typeof value.requestId === 'string' &&
    (value.source === 'ai' || value.source === 'demo_fallback') &&
    typeof value.summary === 'string' &&
    isRiskLevel(value.overallRisk) &&
    isRecord(riskCount) &&
    isNonNegativeInteger(riskCount.total) &&
    isNonNegativeInteger(riskCount.high) &&
    isNonNegativeInteger(riskCount.medium) &&
    isNonNegativeInteger(riskCount.low) &&
    Array.isArray(value.risks) &&
    value.risks.every(isRisk) &&
    Array.isArray(value.checklist) &&
    value.checklist.every(isChecklistItem) &&
    typeof value.disclaimer === 'string'
  );
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return API_ERROR_CODES.includes(value as ApiErrorCode);
}

function isApiError(value: unknown): value is ApiError {
  if (!isRecord(value) || !isRecord(value.error)) return false;

  const error = value.error;
  return (
    isApiErrorCode(error.code) &&
    typeof error.message === 'string' &&
    typeof error.requestId === 'string'
  );
}

function isAbortError(value: unknown): value is DOMException {
  return (
    (typeof DOMException !== 'undefined' &&
      value instanceof DOMException &&
      value.name === 'AbortError') ||
    (isRecord(value) && value.name === 'AbortError')
  );
}

/**
 * Analyze a contract through the backend's single POST /analyze endpoint.
 *
 * HTTP errors are converted to `AnalyzeApiError` so the UI can show a useful
 * message without depending on backend implementation details. The caller
 * can pass an AbortSignal when navigating away or starting a new request.
 */
export async function analyzeContract(
  request: AnalyzeRequest,
  options: AnalyzeOptions = {},
): Promise<AnalyzeResponse> {
  validateRequest(request);

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let didTimeout = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const abortFromCaller = () => controller.abort();
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', abortFromCaller, { once: true });
    }
  }

  timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        text: request.text.trim(),
      }),
      signal: controller.signal,
    });

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new AnalyzeApiError(
        response.ok ? 'AI_INVALID_RESPONSE' : 'INTERNAL_ERROR',
        '服务返回了无法读取的内容，请稍后重试。',
        { status: response.status },
      );
    }

    if (!response.ok) {
      if (isApiError(payload)) {
        throw new AnalyzeApiError(payload.error.code, payload.error.message, {
          requestId: payload.error.requestId,
          status: response.status,
        });
      }

      throw new AnalyzeApiError(
        response.status === 413 ? 'TEXT_TOO_LONG' : 'INTERNAL_ERROR',
        '暂时无法完成合同分析，请稍后重试。',
        { status: response.status },
      );
    }

    if (!isAnalyzeResponse(payload)) {
      throw new AnalyzeApiError(
        'AI_INVALID_RESPONSE',
        '服务返回的数据格式异常，请稍后重试。',
        { status: response.status },
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof AnalyzeApiError) {
      throw error;
    }

    if (isAbortError(error)) {
      if (didTimeout) {
        throw new AnalyzeApiError(
          'AI_TIMEOUT',
          '分析等待时间过长，请稍后重试。',
        );
      }

      // Preserve explicit caller cancellation so the page can quietly ignore
      // a request that was cancelled during navigation.
      throw error;
    }

    throw new AnalyzeApiError(
      'INTERNAL_ERROR',
      '暂时无法连接分析服务，请确认后端已启动后重试。',
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}

export function isRequestAborted(error: unknown): boolean {
  return isAbortError(error);
}

export function getAnalyzeErrorMessage(error: unknown): string {
  if (error instanceof AnalyzeApiError) return error.message;
  if (isApiError(error)) return error.error.message;
  if (isAbortError(error)) return '分析请求已取消。';
  return '暂时无法完成合同分析，请稍后重试。';
}
