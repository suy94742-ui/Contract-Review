# 示例合同目录

## 文件说明

| 文件 | 说明 | 责任人 |
|---|---|---|
| `rental-risky.txt` | 主 Demo 合同：租房合同，含 6 个典型风险 | 员工 4 |
| `rental-risky.expected.json` | 期望 AI 识别结果 | 员工 4 |
| `employment-risky.txt` | 备用 Demo：劳动合同/Offer | 员工 4 |
| `employment-risky.expected.json` | 期望结果 | 员工 4 |
| `user-agreement-risky.txt` | 备用 Demo：APP 用户协议 | 员工 4 |
| `user-agreement-risky.expected.json` | 期望结果 | 员工 4 |

## 使用方式

1. 主 Demo 联调时，使用 `rental-risky.txt` 作为输入
2. `*.expected.json` 中的 `expectedOriginalText` 必须能在对应 `.txt` 中逐字找到
3. AI 输出不必与 expected 完全一致，但 category 和 level 应对应

## 主 Demo 合同风险速览（rental-risky.txt）

1. **押金不退**（high）— 无论任何原因退租，押金均不予退还
2. **高额违约金**（high）— 提前退租需付全部剩余租金
3. **房东随时进入**（high）— 仅提前 2 小时通知
4. **过度免责**（medium）— 设施老化导致损失不承担责任
5. **自动续期**（medium）— 期满自动续期一年，涨幅无上限
6. **偏向仲裁**（medium）— 甲方所在地仲裁，终局裁决
