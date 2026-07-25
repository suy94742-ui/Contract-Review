export interface LoadingPanelProps {
  message?: string;
}

// TODO: 员工 5 实现
export function LoadingPanel({ message = '正在检查合同风险...' }: LoadingPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4" />
      <p>{message}</p>
    </div>
  );
}
