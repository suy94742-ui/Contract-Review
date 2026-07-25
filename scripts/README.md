# 冒烟测试脚本

## 使用方式

```bash
# 1. 启动后端服务
cd backend
npm run dev

# 2. 运行测试（新终端）
cd scripts
chmod +x smoke-test.sh
./smoke-test.sh

# 或使用自定义地址
API_BASE=http://localhost:3001 ./smoke-test.sh
```

## 测试覆盖

| # | 场景 | 期望结果 |
|---|---|---|
| 1 | `GET /health` | `{"status":"ok"}` |
| 2 | 正常租房合同请求 | `overallRisk: high`, `source: demo_fallback` |
| 3 | 空文本 | HTTP 400 |
| 4 | 文本过短（<20字） | HTTP 400 |
| 5 | 缺少 `contractType` | HTTP 400 |
| 6 | 超长文本（>50000字） | HTTP 413（或临时接口返回 200） |
| 7 | 无效 `contractType` | HTTP 400（或临时接口返回 200） |

## 注意事项

- 当前后端为临时接口，部分校验尚未实现
- T+45 联调时，预期所有错误场景返回正确的 HTTP 状态码
- 脚本使用 `set -e`，任一断言失败会中断；可注释掉以查看全部结果
