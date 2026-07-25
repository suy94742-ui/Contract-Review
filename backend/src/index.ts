import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// TODO: 员工 3 实现完整的 POST /analyze
// 当前为临时固定响应，用于前端联调
app.post('/analyze', (_req, res) => {
  const exampleResponse = JSON.parse(
    readFileSync(join(__dirname, '../../shared/api/response.example.json'), 'utf-8')
  )
  res.json({
    ...exampleResponse,
    requestId: `req_${Date.now()}`,
    source: 'demo_fallback' as const,
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
