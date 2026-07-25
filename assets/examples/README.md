# 示例合同目录

这些文件用于合同体检 Demo 的 Prompt 调试、后端显式降级匹配和 UI 验收。内容均为虚构演示样例，仅用于风险提示测试，不构成法律意见，也不对应真实个人或企业。

## 文件与请求参数

| 合同文件 | `contractType` | 建议 `region` | 用途 |
|---|---|---|---|
| `rental-risky.txt` | `rental` | `上海` | 主 Demo；预期识别 5 个核心风险 |
| `employment-risky.txt` | `employment` | `上海` | 备用 Demo；预期识别 5 个核心风险 |
| `user-agreement-risky.txt` | `user_agreement` | 空字符串 | 备用 Demo；预期识别 5 个核心风险 |

主 Demo 固定为 `rental-risky.txt`。其风险点覆盖押金、提前退租违约金、房东进入权、广泛免责和自动续期。正文刻意避免额外加入隐私、单方解除、仲裁或管辖风险，以便将核心输出稳定控制在 4～6 个。

## `*.expected.json` 结构

每个期望文件只维护以下三个判断字段：

```json
{
  "expectedRisks": [
    {
      "category": "deposit",
      "level": "high",
      "expectedOriginalText": "必须能在对应合同正文中逐字找到的句子或短摘录"
    }
  ]
}
```

- `category` 必须与 `shared/rules/risk-taxonomy.json` 中的 `categories[].id` 一致。
- `level` 只能是 `high`、`medium` 或 `low`。
- `expectedOriginalText` 必须逐字出现在同名合同文件中。
- 标题、解释、建议、ID、计数和免责声明不在期望文件中写死，由 AI 或后端按冻结契约生成和标准化。
- 验收关注核心类别和等级是否命中，不要求 AI 的标题、解释或建议逐字一致。

## 使用边界

- 后端只有在显式设置 `DEMO_FALLBACK=true` 时才可把这些数据用于演示降级。
- 降级响应必须标记 `source: "demo_fallback"`，不得冒充实时 AI 分析。
- 示例中的风险级别是 Demo 测试预期，不是对真实合同效力的确定结论。
