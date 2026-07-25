# 员工 5 交接（UI + 测试）

## 当前状态
骨架已就绪，等待实现完整视觉和交互

## 已完成
- [x] `frontend/src/ui/index.ts` 统一导出（由员工 1 创建骨架）
- [x] 6 个组件骨架文件已创建（RiskCard / RiskSummary / Checklist / LoadingPanel / ErrorPanel / Disclaimer）
- [x] `frontend/src/styles/` 目录已创建（Tailwind 已配置）

## 待完成
- [ ] 实现 6 个组件的完整视觉和交互
- [ ] 建立配色/排版规则（`frontend/src/styles/`）
- [ ] 适配 375px 手机和 1440px 桌面
- [ ] UI 或端到端测试
- [ ] `frontend/tests/` 测试文件
- [ ] `assets/brand/` 品牌资源

## 启动命令
```bash
cd frontend
npm install
npm run dev
```

## 验证命令和结果
```bash
npm run build
# 预期：构建通过，无类型错误
```

## 对外接口或导出
- `frontend/src/ui/index.ts` — 统一导出 6 个组件

## Props 契约（与员工 2 约定，不可擅自变更）
```ts
type RiskCardProps = { risk: Risk };
type RiskSummaryProps = { overallRisk: RiskLevel; riskCount: RiskCount };
type ChecklistProps = { items: ChecklistItem[] };
type LoadingPanelProps = { message?: string };
type ErrorPanelProps = { message: string; onRetry?: () => void };
type DisclaimerProps = { text: string };
```

## 依赖与环境变量
- 依赖见 `frontend/package.json`
- **不得自行增加 package.json 依赖**，如需请通知员工 2
- 优先使用现有依赖和 CSS

## 已知问题
- 所有组件目前只有最小骨架，无完整样式和交互
- 颜色之外必须同时显示文字或图标，不能只靠颜色表达等级

## 希望其他员工修改
- **员工 2**：如需调整 Props 签名，请提前协商

## 最新可合并提交
- 分支：待创建 `codex/employee-5-ui-test`
- commit：待提交
