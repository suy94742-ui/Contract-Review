import type { RiskLevel, RiskCount } from '../types/analyze';

export interface RiskSummaryProps {
  overallRisk: RiskLevel;
  riskCount: RiskCount;
}

// TODO: 员工 5 实现
export function RiskSummary({ overallRisk, riskCount }: RiskSummaryProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div>总体风险: {overallRisk}</div>
      <div>高:{riskCount.high} 中:{riskCount.medium} 低:{riskCount.low}</div>
    </div>
  );
}
