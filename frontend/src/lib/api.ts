import type { AnalyzeRequest, AnalyzeResult } from '../types/analyze';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// TODO: 员工 2 实现完整的 API 调用逻辑（含 AbortController、错误处理、重试）
export async function analyzeContract(request: AnalyzeRequest): Promise<AnalyzeResult> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json() as Promise<AnalyzeResult>;
}
