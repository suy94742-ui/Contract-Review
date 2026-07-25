# 员工 4 交接（风险规则 + 示例数据）

## 当前状态
骨架部分就绪，需填充示例合同

## 已完成
- [x] `shared/rules/risk-taxonomy.json` 风险分类体系（由员工 1 创建，员工 4 可扩充描述）

## 待完成
- [ ] `assets/examples/rental-risky.txt` — 主 Demo 租房合同
- [ ] `assets/examples/rental-risky.expected.json`
- [ ] `assets/examples/employment-risky.txt`
- [ ] `assets/examples/employment-risky.expected.json`
- [ ] `assets/examples/user-agreement-risky.txt`
- [ ] `assets/examples/user-agreement-risky.expected.json`
- [ ] `assets/examples/README.md`

## 启动命令
无独立服务

## 验证命令和结果
```bash
# 确认每个 expected.json 中的 originalText 都能在对应 txt 中找到
grep -F "押金均不予退还" assets/examples/rental-risky.txt
```

## 对外接口或导出
- `shared/rules/risk-taxonomy.json` — 风险分类（只读）
- `assets/examples/*.txt` — 示例合同
- `assets/examples/*.expected.json` — 期望识别结果

## 依赖与环境变量
- 无

## 已知问题
- 风险分类已由员工 1 定义，如需增删分类需通知员工 1 同步 schema
- 示例合同尚未编写

## 希望其他员工修改
- **员工 1**：如需增删 `risk-taxonomy.json` 中的分类，请同步更新 `shared/api/analyze.schema.json`

## 最新可合并提交
- 分支：待创建 `codex/employee-4-risk-data`
- commit：待提交
