import type { Risk } from '../types/analyze';

export interface RiskCardProps {
  risk: Risk;
}

// TODO: 员工 5 实现
export function RiskCard({ risk }: RiskCardProps) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="font-bold">{risk.title}</div>
      <div className="text-sm text-gray-500">[{risk.level}] {risk.category}</div>
    </div>
  );
}
