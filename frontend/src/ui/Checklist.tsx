import type { ChecklistItem } from '../types/analyze';

export interface ChecklistProps {
  items: ChecklistItem[];
}

// TODO: 员工 5 实现
export function Checklist({ items }: ChecklistProps) {
  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item.id} className="flex items-center gap-2">
          <span>{item.status}</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
