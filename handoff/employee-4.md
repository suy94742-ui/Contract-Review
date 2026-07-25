# 员工 4 交接（风险规则 + 示例数据）

## 当前状态

- 可联调（等待修订版主 Demo 的真实 AI 复测）

## 已完成

- 复核员工 1 已创建的 `shared/rules/risk-taxonomy.json`：14 个 `categories[].id` 与冻结 API Schema 完全一致，本轮未改动该文件。
- 根据员工 1 对旧版主 Demo 连续两次均识别出 7 个风险的实际结果，重写 `rental-risky.txt`，移除额外触发隐私、单方解除和仲裁 / 管辖风险的条款，将期望数据收敛为 5 个核心风险。
- 完成 `employment-risky.txt`，覆盖单方调岗调薪、竞业限制、宽泛保密、单方解除和离职违约金 5 个核心风险。
- 完成 `user-agreement-risky.txt`，覆盖自动续费、单方修改、广泛免责、隐私授权和偏向性管辖 5 个核心风险。
- 三个 `*.expected.json` 统一使用新基线约定的 `expectedOriginalText`，每项只保留 `category`、`level` 和 `expectedOriginalText`。
- 更新 `assets/examples/README.md`，明确主 / 备用 Demo、请求参数、期望结构和降级边界。

## 启动命令

员工 4 的交付物是静态数据，不需要单独启动服务。联调时读取对应合同正文，并按 `assets/examples/README.md` 中的 `contractType` 和 `region` 请求 `POST /analyze`。

## 验证命令和结果

```powershell
# JSON 可解析
Get-ChildItem shared/rules,shared/api,assets/examples -Filter *.json -Recurse |
  ForEach-Object { Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json | Out-Null }

# Git 范围和基础检查
git status --short
git diff --stat
git diff --check
```

已实际运行并通过：

- `risk-taxonomy.json` 的 14 个 `categories[].id` 与 `shared/api/analyze.schema.json` 的 `RiskCategory` 枚举完全一致且无重复。
- 三个 `*.expected.json` 均可解析；租房、劳动 / Offer、用户协议分别包含 5、5、5 个核心风险。
- 三类合同均覆盖根目录规则指定的必备风险方向。
- 15 个 `category` 均存在于风险分类中，15 个 `level` 均属于 `high`、`medium`、`low`。
- 15 个 `expectedOriginalText` 均能在对应合同正文中逐字找到。
- 每个期望风险对象恰好只有 `category`、`level`、`expectedOriginalText` 三个字段。
- 三份合同去除首尾空白后的字符数分别为：租房 451、劳动 / Offer 456、用户协议 457，均满足接口的 20～50000 字符约束。

已实际运行但失败：

- 第一版新基线校验命令因 PowerShell 将变量名后的冒号解析为驱动器语法而未执行；修正变量边界后完整校验通过，未通过绕过检查获得结果。

因环境或依赖限制无法运行：

- 员工 1 已记录旧版主 Demo 的两次真实 AI 测试，但本轮未读取或使用其凭据；修订后的主 Demo 尚未完成连续两次真实 AI 复测。
- 后端与 UI 的最终实现仍分别由员工 3、2、5 负责；员工 4 未越权修改或代替其验收。

仅基于文件检查的判断：

- 示例风险方向符合 Demo 规则；风险等级是测试预期，不代表对真实合同效力的法律结论。

## 对外接口或导出

- 分类：`shared/rules/risk-taxonomy.json`，本轮只读复用，类别字段为 `categories[].id`。
- 主 Demo：`assets/examples/rental-risky.txt`，5 个期望风险。
- 备用 Demo：`assets/examples/employment-risky.txt`、`assets/examples/user-agreement-risky.txt`，各 5 个期望风险。
- 期望数据：对应的 `*.expected.json`，使用 `expectedRisks[].expectedOriginalText`。
- 无 API 字段变更，无依赖变更。

## 依赖与环境变量

- 不新增依赖。
- 员工 4 的静态数据不需要环境变量。
- 后端如使用演示降级，必须由员工 3 显式设置 `DEMO_FALLBACK=true`，响应必须标记 `source: "demo_fallback"`。

## 已知问题

- 旧版主 Demo 的两次真实 AI 测试均返回 7 个风险，不符合 4～6 个目标；本轮已删除额外风险触发条款，但修订版仍需员工 1 在已配置环境连续复测两次。
- 无法确认最终后端是否直接消费 `*.expected.json`；字段名已保持与最新示例基线一致。
- 修正前的 9 个未跟踪候选文件保存在本地 `stash@{0}`，未恢复、未删除，不影响当前工作区。

## 希望其他员工修改

- 文件：无。
- 原因：当前未发现必须跨职责修改的问题。
- 建议：员工 1 用三份合同调 Prompt；员工 3 按 `expectedOriginalText` 做显式降级或测试映射；员工 5 用主 Demo 连续验收两次。

## 最新可合并提交

- 分支：`codex/employee-4-risk-data`
- 基线：`537839f`
- commit：由本次提交生成，以 `git rev-parse HEAD` 输出为准。
