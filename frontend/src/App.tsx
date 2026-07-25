import { useState } from 'react'
import type { AnalyzeResponse } from './types/analyze'

function App() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold p-4">合同体检 Demo</h1>
      {/* TODO: 员工 2 填充首页和结果页路由/状态流 */}
      <pre className="p-4 text-sm">{result ? JSON.stringify(result, null, 2) : '等待提交合同...'}</pre>
    </div>
  )
}

export default App
