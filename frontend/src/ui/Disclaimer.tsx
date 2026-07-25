export interface DisclaimerProps {
  text: string;
}

// TODO: 员工 5 实现
export function Disclaimer({ text }: DisclaimerProps) {
  return (
    <p className="text-xs text-gray-400 mt-4 p-2 border-t">
      {text}
    </p>
  );
}
