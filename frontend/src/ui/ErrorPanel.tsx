export interface ErrorPanelProps {
  message: string;
  onRetry?: () => void;
}

// TODO: 员工 5 实现
export function ErrorPanel({ message, onRetry }: ErrorPanelProps) {
  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
      <p className="text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
          重试
        </button>
      )}
    </div>
  );
}
