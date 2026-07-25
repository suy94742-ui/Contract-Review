import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  ErrorPanel,
  Checklist,
  Disclaimer,
  LoadingPanel,
  RiskCard,
  RiskSummary,
} from './ui'
import {
  analyzeContract,
  getAnalyzeErrorMessage,
  isRequestAborted,
} from './lib/api'
import type { AnalyzeResponse, ContractType } from './types/analyze'

type ViewState = 'input' | 'loading' | 'result' | 'error'

const CONTRACT_TYPE_OPTIONS: Array<{ value: ContractType; label: string }> = [
  { value: 'rental', label: '房屋租赁合同' },
  { value: 'employment', label: '劳动合同 / Offer' },
  { value: 'user_agreement', label: '用户协议' },
  { value: 'part_time', label: '兼职协议' },
  { value: 'other', label: '其他合同' },
]

const RENTAL_EXAMPLE = `房屋租赁合同

甲方（出租方）：王某
乙方（承租方）：李某

租赁期为 2024 年 1 月 1 日至 2024 年 12 月 31 日，月租金 5000 元，押金 10000 元。无论任何原因退租，押金均不予退还。
甲方有权在提前 2 小时通知乙方后随时进入房屋进行检查、维修或带人看房。
乙方如提前退租，需支付剩余全部租期租金作为违约金，且押金不退。
因房屋设施老化、自然损耗或不可抗力导致的乙方损失，甲方不承担任何责任。
租赁期满前 30 日如双方未提出书面异议，本合同自动续期一年，租金按当时市场价调整。`

const EMPLOYMENT_EXAMPLE = `劳动合同补充条款

员工离职后两年内不得从事与公司存在竞争关系的任何工作，且不得向任何第三方披露公司全部业务信息。
公司可根据经营需要单方面调整员工岗位、工作地点和薪资结构，员工须无条件接受。
员工违反本协议的，应支付相当于十二个月工资的违约金；公司对因系统故障造成的任何损失不承担责任。`

const USER_AGREEMENT_EXAMPLE = `某某应用用户服务协议（节选）

平台可根据运营需要随时修改本协议，修改后的内容一经发布即自动生效，用户无需另行确认。
用户开通会员后将按月自动续费，平台可从绑定的支付方式中直接扣款；如需取消，须在扣款日前 7 日完成操作。
因网络故障、第三方服务或平台系统维护造成的任何损失，平台均不承担责任。
用户同意平台为提供服务、个性化推荐及商业合作之目的，收集、分析并向合作方共享用户的设备信息、位置及使用记录。`

function App() {
  const [contractType, setContractType] = useState<ContractType>('rental')
  const [region, setRegion] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<ViewState>('input')
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const validationMessage = useMemo(() => {
    const length = text.trim().length
    if (length === 0) return '请粘贴合同正文后再开始体检。'
    if (length < 20) return `合同内容还差 ${20 - length} 个字，请补充完整后再试。`
    if (length > 50_000) return '合同内容超过 50,000 个字符，请删减后再试。'
    return ''
  }, [text])
  const textUsage = Math.min((text.length / 50_000) * 100, 100)
  const contractLabel =
    CONTRACT_TYPE_OPTIONS.find((option) => option.value === contractType)?.label ?? '合同'

  const handleAnalyze = async (event?: FormEvent) => {
    event?.preventDefault()
    if (status === 'loading' || validationMessage) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    setErrorMessage('')
    setResult(null)

    try {
      const response = await analyzeContract(
        {
          contractType,
          region: region.trim() || undefined,
          text: text.trim(),
        },
        { signal: controller.signal },
      )

      if (controller.signal.aborted) return
      setResult(response)
      setStatus('result')
    } catch (error) {
      if (isRequestAborted(error)) return
      setErrorMessage(getAnalyzeErrorMessage(error))
      setStatus('error')
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }

  const fillExample = (example: string, type: ContractType = 'rental') => {
    setContractType(type)
    setRegion(type === 'rental' ? '上海' : '')
    setText(example)
    setStatus('input')
    setResult(null)
    setErrorMessage('')
  }

  const startOver = () => {
    abortRef.current?.abort()
    setStatus('input')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:gap-7 sm:px-6 sm:py-8 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-xl shadow-indigo-950/10">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_300px] lg:items-end lg:p-11">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                <span>Contract Review</span>
                <span className="h-1 w-1 rounded-full bg-indigo-300/70" aria-hidden="true" />
                <span className="tracking-normal text-slate-300">AI 风险提示</span>
              </div>
              <div>
                <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
                  签字之前，先看懂这份合同
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  粘贴合同正文，快速定位押金、违约、自动续约等值得重点确认的条款。
                  结果仅用于风险提示，不替代专业法律意见。
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-indigo-100">
                {['原文引用', '风险分级', '修改建议'].map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur"
                  >
                    <span className="mr-1.5 text-indigo-300">✓</span>
                    {point}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-sm text-slate-200 backdrop-blur lg:block">
              <p className="font-semibold text-white">一份体检，先看三件事</p>
              <div className="mt-4 space-y-3">
                {[
                  ['01', '哪里最不利？', '先看高风险条款'],
                  ['02', '为什么要注意？', '回到合同原文'],
                  ['03', '可以怎么改？', '给出更公平的方向'],
                ].map(([number, title, note]) => (
                  <div key={number} className="flex gap-3">
                    <span className="text-xs font-semibold text-indigo-300">{number}</span>
                    <div>
                      <p className="font-medium text-white">{title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {status === 'input' || status === 'loading' || status === 'error' ? (
          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                  Start here
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  开始一份合同体检
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  先选合同类型，再粘贴完整正文；地区是可选信息，仅用于补充分析语境。
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                通常 25 秒内完成
              </span>
            </div>
            <form className="space-y-5" onSubmit={handleAnalyze}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                  <span>合同类型</span>
                  <select
                    className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    value={contractType}
                    onChange={(event) => setContractType(event.target.value as ContractType)}
                    disabled={status === 'loading'}
                  >
                    {CONTRACT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                  <span className="flex items-center gap-2">
                    地区
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      可选
                    </span>
                  </span>
                  <input
                    className="rounded-xl border border-slate-300 px-3 py-3 font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    placeholder="例如：上海（不填也可以）"
                    disabled={status === 'loading'}
                  />
                  <span className="text-xs font-normal text-slate-400">
                    留空时仍可正常分析
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="contract-text" className="text-sm font-semibold text-slate-800">
                    合同正文
                  </label>
                  <span className="text-xs font-medium text-slate-400">
                    {text.length.toLocaleString()} / 50,000 字
                  </span>
                </div>
                <textarea
                  id="contract-text"
                  className="min-h-72 w-full resize-y rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-4 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="请粘贴合同正文（至少 20 个字）"
                  disabled={status === 'loading'}
                  aria-invalid={Boolean(validationMessage)}
                  aria-describedby="contract-hint"
                />
                <div className="h-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <div
                    className={`h-full rounded-full transition-[width] ${
                      validationMessage && text.length > 50_000 ? 'bg-rose-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${textUsage}%` }}
                  />
                </div>
                <div id="contract-hint" className="flex min-h-5 items-center justify-between gap-3 text-xs">
                  <span className={validationMessage ? 'text-rose-600' : 'text-slate-500'}>
                    {validationMessage || '建议粘贴包含完整条款的合同正文，分析结果会更可靠。'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                <span className="mr-1 text-xs font-medium text-slate-500">没有合同？先看示例：</span>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => fillExample(RENTAL_EXAMPLE)}
                  disabled={status === 'loading'}
                >
                  租赁合同
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => fillExample(EMPLOYMENT_EXAMPLE, 'employment')}
                  disabled={status === 'loading'}
                >
                  劳动合同
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => fillExample(USER_AGREEMENT_EXAMPLE, 'user_agreement')}
                  disabled={status === 'loading'}
                >
                  用户协议
                </button>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:min-w-36"
                  disabled={status === 'loading' || Boolean(validationMessage)}
                >
                  {status === 'loading' ? '正在分析…' : '开始体检'}
                </button>
                {status === 'loading' && (
                  <span className="text-sm text-slate-500" aria-live="polite">
                    正在检查合同风险，请稍候。
                  </span>
                )}
                {status !== 'loading' && (
                  <span className="text-xs text-slate-400">
                    内容只用于本次分析，不会在页面中展示给其他人
                  </span>
                )}
              </div>
            </form>

            {status === 'loading' && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <LoadingPanel />
              </div>
            )}
            {status === 'error' && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <ErrorPanel message={errorMessage} onRetry={() => void handleAnalyze()} />
              </div>
            )}
          </section>
        ) : null}

        {status === 'result' && result ? (
          <section className="space-y-5">
            {result.source === 'demo_fallback' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                当前为演示降级结果：分析服务暂不可用，以下内容来自预设示例。
              </div>
            )}

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                      Analysis complete
                    </p>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      {result.source === 'demo_fallback' ? '演示降级' : 'AI 分析'}
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {contractLabel} · 风险概览
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{result.summary}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
                  onClick={startOver}
                >
                  返回修改
                </button>
              </div>
              <RiskSummary overallRisk={result.overallRisk} riskCount={result.riskCount} />
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">
                    Risk flags
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">重点风险</h2>
                  <p className="mt-1 text-sm text-slate-500">先看高风险，再逐项核对原文和修改建议。</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  {result.risks.length} 项
                </span>
              </div>
              <div className="space-y-3">
                {result.risks.length > 0 ? (
                  result.risks.map((risk) => <RiskCard key={risk.id} risk={risk} />)
                ) : (
                  <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    暂未发现需要重点提示的风险，请结合实际情况继续核对合同。
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Checklist
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">检查清单</h2>
              <p className="mt-1 mb-4 text-sm text-slate-500">逐项确认后，再决定是否需要修改或咨询律师。</p>
              <Checklist items={result.checklist} />
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
              <Disclaimer text={result.disclaimer} />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default App
