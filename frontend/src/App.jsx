import { useEffect, useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, BookOpen, Bot, Check, ChevronLeft,
  ChevronRight, CircleGauge, Download, Headphones, LoaderCircle, MessageSquare,
  Play, RotateCcw, Save, Send, Trash2, Upload, UserRound,
} from 'lucide-react'
import {
  BarChart, Bar, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { api } from './api'

const NAV_ITEMS = [
  { id: 'console', label: 'Live Console', icon: Headphones },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: CircleGauge },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

function Spinner({ text = 'Working...' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      {text}
    </div>
  )
}

function RiskBadge({ risk = 'low' }) {
  const colors = {
    low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    high: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    critical: 'bg-red-500/10 text-red-300 border-red-500/30',
  }
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${colors[risk] || colors.low}`}>
      {risk}
    </span>
  )
}

function ChatBubble({ message }) {
  const agent = message.role === 'assistant'
  const analysis = message.analysis
  return (
    <div className={`flex ${agent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${agent ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-700 bg-slate-800/80 text-slate-100'}`}>
        <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70">
          {agent ? <Bot className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
          {agent ? 'Support agent' : 'Customer'}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        {analysis && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-600/40 pt-2 text-[11px]">
            <span className="rounded bg-slate-950/25 px-2 py-1">{analysis.intent?.replaceAll('_', ' ')}</span>
            <span className="rounded bg-slate-950/25 px-2 py-1">{analysis.sentiment}</span>
            <span className="rounded bg-slate-950/25 px-2 py-1">Frustration {analysis.frustration_level}/10</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CoachingPanel({ analysis, loading }) {
  if (loading) {
    return <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><Spinner text="Analyzing message..." /></div>
  }
  if (!analysis) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
        <Activity className="mx-auto mb-3 h-7 w-7 text-slate-600" />
        <p className="text-sm text-slate-500">Coaching analytics appear after a customer message.</p>
      </div>
    )
  }

  const risk = (analysis.escalation_risk || 'low').toLowerCase()
  const evaluation = analysis.response_evaluation

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div>
          <p className="text-xs text-slate-500">Escalation risk</p>
          <p className="mt-1 text-sm text-slate-300">{analysis.escalation_reasoning}</p>
        </div>
        <RiskBadge risk={risk} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Intent', analysis.intent?.replaceAll('_', ' ') || 'N/A'],
          ['Emotion', analysis.emotion || 'N/A'],
          ['Sentiment', analysis.sentiment || 'N/A'],
          ['Frustration', `${analysis.frustration_level ?? 0}/10`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-100">{value}</p>
          </div>
        ))}
      </div>
      {analysis.suggested_action && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-300">Suggested action</p>
          <p className="text-sm leading-6 text-slate-300">{analysis.suggested_action}</p>
        </div>
      )}
      {analysis.suggested_response && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-300">Suggested response</p>
          <p className="text-sm leading-6 text-slate-300">{analysis.suggested_response}</p>
        </div>
      )}
      {analysis.communication_tips?.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Communication tips</p>
          <ul className="space-y-2">
            {analysis.communication_tips.map((tip, index) => (
              <li key={`${tip}-${index}`} className="flex gap-2 text-sm text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      {evaluation && (
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(evaluation).map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-center">
              <p className="text-[10px] capitalize text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-bold text-slate-200">{value}/5</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KnowledgePanel({ recommendations, loading }) {
  if (loading) return <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><Spinner text="Retrieving knowledge..." /></div>
  if (!recommendations?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
        <BookOpen className="mx-auto mb-3 h-7 w-7 text-slate-600" />
        <p className="text-sm text-slate-500">Knowledge recommendations appear after a customer message.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {recommendations.map((item, index) => (
        <article key={`${item.document_name}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{item.category}</span>
              <h3 className="mt-1 text-sm font-semibold text-slate-100">{item.title}</h3>
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{Math.round(item.score * 100)}%</span>
          </div>
          {item.actionable_summary && <p className="mt-3 text-sm leading-6 text-slate-300">{item.actionable_summary}</p>}
          <p className="mt-2 text-xs leading-5 text-slate-500">{item.snippet}</p>
          <p className="mt-3 text-[11px] text-slate-500">
            {item.document_name}{item.page_number ? ` · page ${item.page_number}` : ''}
          </p>
        </article>
      ))}
    </div>
  )
}

function EmptyChat() {
  return (
    <div className="flex h-full min-h-80 items-center justify-center text-center">
      <div>
        <MessageSquare className="mx-auto h-9 w-9 text-slate-700" />
        <p className="mt-3 text-sm text-slate-500">The conversation will appear here.</p>
      </div>
    </div>
  )
}

function Console({ setReport }) {
  const [tab, setTab] = useState('simulator')
  const [loading, setLoading] = useState(false)

  const [manualMessages, setManualMessages] = useState([])
  const [manualSpeaker, setManualSpeaker] = useState('customer')
  const [manualInput, setManualInput] = useState('')
  const [manualAnalysis, setManualAnalysis] = useState(null)
  const [manualRecommendations, setManualRecommendations] = useState([])

  const [simMessages, setSimMessages] = useState([])
  const [simConversationId, setSimConversationId] = useState(null)
  const [simAnalysis, setSimAnalysis] = useState(null)
  const [simRecommendations, setSimRecommendations] = useState([])
  const [simAgentInput, setSimAgentInput] = useState('')
  const [simConfig, setSimConfig] = useState({
    persona: 'frustrated',
    scenario: 'Refund Request',
    initial_emotion: 'frustrated',
    current_emotion: 'frustrated',
    issue_severity: 'high',
    patience_level: 'low',
    expected_resolution: 'Immediate refund',
  })

  const [replayMessages, setReplayMessages] = useState([])
  const [replayIndex, setReplayIndex] = useState(-1)
  const [replayAnalysis, setReplayAnalysis] = useState(null)
  const [replayRecommendations, setReplayRecommendations] = useState([])
  const [replayLoading, setReplayLoading] = useState(false)
  const [error, setError] = useState('')

  async function submitManual() {
    const content = manualInput.trim()
    if (!content) return
    setError('')
    setLoading(true)
    try {
      if (manualSpeaker === 'agent') {
        setManualMessages((current) => [...current, { role: 'assistant', content }])
      } else {
        const history = manualMessages.map(({ role, content: text }) => ({ role, content: text }))
        const [analysisResult, recommendationResult] = await Promise.all([
          api.analyze({ message: content, history }),
          api.recommendations({ message: content, history, top_k: 4 }),
        ])
        const analysis = analysisResult.analysis
        setManualAnalysis(analysis)
        setManualRecommendations(recommendationResult.recommendations || [])
        setManualMessages((current) => [...current, { role: 'user', content, analysis }])
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
      setManualInput('')
    }
  }

  async function startSimulator() {
    setError('')
    setLoading(true)
    try {
      const result = await api.simulatorTurn({
        conversation_id: simConversationId,
        agent_message: '',
        config: simConfig,
      })
      setSimConversationId(result.conversation_id)
      setSimAnalysis(result.analysis)
      setSimRecommendations(result.knowledge_recommendations || [])
      setSimMessages([{ role: 'user', content: result.customer_message, analysis: result.analysis }])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitSimulator() {
    const content = simAgentInput.trim()
    if (!content) return
    setError('')
    setLoading(true)
    try {
      const result = await api.simulatorTurn({
        conversation_id: simConversationId,
        agent_message: content,
        config: { ...simConfig, current_emotion: simAnalysis?.emotion || simConfig.current_emotion },
      })
      setSimConversationId(result.conversation_id)
      setSimAnalysis(result.analysis)
      setSimRecommendations(result.knowledge_recommendations || [])
      setSimMessages((current) => [
        ...current,
        { role: 'assistant', content },
        { role: 'user', content: result.customer_message, analysis: result.analysis },
      ])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
      setSimAgentInput('')
    }
  }

  async function loadReplay(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data) || data.length === 0) throw new Error('Transcript must be a non-empty JSON array.')
      if (data.some((message) => !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string')) {
        throw new Error('Each message must include role ("user" or "assistant") and content.')
      }
      setReplayMessages(data)
      setReplayIndex(0)
      setReplayAnalysis(null)
      setReplayRecommendations([])
      if (data[0].role === 'user') {
        setReplayLoading(true)
        Promise.all([
          api.analyze({ message: data[0].content, history: [] }),
          api.recommendations({ message: data[0].content, history: [], top_k: 4 }),
        ]).then(([analysisResult, recommendationResult]) => {
          const analysis = analysisResult.analysis
          const recommendations = recommendationResult.recommendations || []
          setReplayAnalysis(analysis)
          setReplayRecommendations(recommendations)
          setReplayMessages((current) => current.map((item, index) => (
            index === 0 ? { ...item, analysis, knowledge_recommendations: recommendations } : item
          )))
        }).catch((requestError) => setError(requestError.message))
          .finally(() => setReplayLoading(false))
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function analyzeReplayTurn(nextIndex) {
    const message = replayMessages[nextIndex]
    if (!message || message.role !== 'user') {
      setReplayAnalysis(null)
      setReplayRecommendations([])
      return
    }
    if (message.analysis) {
      setReplayAnalysis(message.analysis)
      setReplayRecommendations(message.knowledge_recommendations || [])
      return
    }
    setReplayLoading(true)
    try {
      const history = replayMessages.slice(0, nextIndex).map(({ role, content }) => ({ role, content }))
      const [analysisResult, recommendationResult] = await Promise.all([
        api.analyze({ message: message.content, history }),
        api.recommendations({ message: message.content, history, top_k: 4 }),
      ])
      const analysis = analysisResult.analysis
      const recommendations = recommendationResult.recommendations || []
      setReplayAnalysis(analysis)
      setReplayRecommendations(recommendations)
      setReplayMessages((current) => current.map((item, index) => (
        index === nextIndex ? { ...item, analysis, knowledge_recommendations: recommendations } : item
      )))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setReplayLoading(false)
    }
  }

  function changeReplayIndex(nextIndex) {
    setReplayIndex(nextIndex)
    if (tab === 'replay') analyzeReplayTurn(nextIndex)
  }

  async function generateReport(conversation, sessionId = '') {
    setError('')
    setLoading(true)
    try {
      const result = await api.postInteraction({ session_id: sessionId, conversation })
      setReport(result.report)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const activeMessages = tab === 'simulator' ? simMessages : tab === 'manual' ? manualMessages : replayMessages.slice(0, replayIndex + 1)
  const activeAnalysis = tab === 'simulator' ? simAnalysis : tab === 'manual' ? manualAnalysis : replayAnalysis
  const activeRecommendations = tab === 'simulator' ? simRecommendations : tab === 'manual' ? manualRecommendations : replayRecommendations

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-slate-800 bg-slate-900/70 p-1">
          {[
            ['simulator', 'Simulator'],
            ['manual', 'Manual'],
            ['replay', 'Replay'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab !== 'replay' && (
          <button
            onClick={() => generateReport(
              tab === 'simulator' ? simMessages : manualMessages,
              tab === 'simulator' && simConversationId ? String(simConversationId) : '',
            )}
            disabled={loading || activeMessages.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CircleGauge className="h-4 w-4" />}
            End session
          </button>
        )}
      </div>

      {tab === 'simulator' && (
        <div className="grid gap-4 xl:grid-cols-[240px_minmax(320px,1.15fr)_minmax(280px,.85fr)_minmax(280px,.85fr)]">
          <aside className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Persona setup</p>
            {[
              ['scenario', 'Scenario', 'text'],
              ['expected_resolution', 'Expected resolution', 'text'],
            ].map(([key, label, type]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-xs text-slate-400">{label}</span>
                <input value={simConfig[key]} type={type} onChange={(event) => setSimConfig((current) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" />
              </label>
            ))}
            {[
              ['persona', 'Persona', ['calm', 'polite', 'confused', 'frustrated', 'impatient', 'angry']],
              ['initial_emotion', 'Starting emotion', ['neutral', 'calm', 'worried', 'confused', 'frustrated', 'impatient', 'angry']],
              ['issue_severity', 'Severity', ['low', 'medium', 'high']],
              ['patience_level', 'Patience', ['low', 'medium', 'high']],
            ].map(([key, label, options]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-xs text-slate-400">{label}</span>
                <select value={simConfig[key]} onChange={(event) => setSimConfig((current) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500">
                  {options.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            ))}
            <button onClick={startSimulator} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start session
            </button>
          </aside>
          <section className="flex min-h-[520px] flex-col rounded-xl border border-slate-800 bg-slate-900/40">
            <header className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-300">Conversation</header>
            <div className="panel-scroll flex-1 space-y-3 overflow-y-auto p-4">
              {activeMessages.length ? activeMessages.map((message, index) => <ChatBubble key={index} message={message} />) : <EmptyChat />}
            </div>
            <div className="flex gap-2 border-t border-slate-800 p-3">
              <textarea value={simAgentInput} onChange={(event) => setSimAgentInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitSimulator() } }} placeholder="Enter the support agent response..." className="min-h-11 flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" />
              <button onClick={submitSimulator} disabled={!simMessages.length || loading} className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </div>
          </section>
          <section className="min-h-[520px] rounded-xl border border-slate-800 bg-slate-950/30 p-3"><CoachingPanel analysis={activeAnalysis} loading={loading && simMessages.length === 0} /></section>
          <section className="min-h-[520px] rounded-xl border border-slate-800 bg-slate-950/30 p-3"><KnowledgePanel recommendations={activeRecommendations} loading={loading && simMessages.length === 0} /></section>
        </div>
      )}

      {tab === 'manual' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(320px,1.2fr)_minmax(280px,.8fr)_minmax(280px,.8fr)]">
          <section className="flex min-h-[600px] flex-col rounded-xl border border-slate-800 bg-slate-900/40">
            <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="text-sm font-semibold text-slate-300">Manual conversation</span>
              <button onClick={() => { setManualMessages([]); setManualAnalysis(null); setManualRecommendations([]) }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-300"><Trash2 className="h-4 w-4" /></button>
            </header>
            <div className="panel-scroll flex-1 space-y-3 overflow-y-auto p-4">
              {activeMessages.length ? activeMessages.map((message, index) => <ChatBubble key={index} message={message} />) : <EmptyChat />}
            </div>
            <div className="border-t border-slate-800 p-3">
              <div className="mb-2 flex rounded-lg bg-slate-950 p-1">
                {[['customer', 'Customer'], ['agent', 'Support agent']].map(([id, label]) => (
                  <button key={id} onClick={() => setManualSpeaker(id)} className={`flex-1 rounded-md py-1.5 text-xs font-bold ${manualSpeaker === id ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>{label}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea value={manualInput} onChange={(event) => setManualInput(event.target.value)} placeholder={`Enter ${manualSpeaker === 'customer' ? 'the customer' : 'an agent'} message...`} className="min-h-11 flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" />
                <button onClick={submitManual} disabled={loading || !manualInput.trim()} className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </section>
          <section className="min-h-[600px] rounded-xl border border-slate-800 bg-slate-950/30 p-3"><CoachingPanel analysis={activeAnalysis} loading={loading} /></section>
          <section className="min-h-[600px] rounded-xl border border-slate-800 bg-slate-950/30 p-3"><KnowledgePanel recommendations={activeRecommendations} loading={loading} /></section>
        </div>
      )}

      {tab === 'replay' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(320px,1.2fr)_minmax(280px,.8fr)_minmax(280px,.8fr)]">
          <section className="flex min-h-[600px] flex-col rounded-xl border border-slate-800 bg-slate-900/40">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <span className="text-sm font-semibold text-slate-300">Replay transcript</span>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-600">
                <Upload className="h-3.5 w-3.5" /> Upload JSON
                <input type="file" accept=".json,application/json" className="hidden" onChange={loadReplay} />
              </label>
            </header>
            {replayMessages.length > 0 && replayIndex >= 0 ? (
              <>
                <div className="panel-scroll flex-1 space-y-3 overflow-y-auto p-4">
                  {activeMessages.map((message, index) => <ChatBubble key={index} message={message} />)}
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-slate-800 p-3">
                  <button onClick={() => changeReplayIndex(Math.max(0, replayIndex - 1))} disabled={replayIndex === 0} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-300 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
                  <button onClick={() => changeReplayIndex(0)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-300"><RotateCcw className="h-4 w-4" /> Restart</button>
                  <button onClick={() => changeReplayIndex(Math.min(replayMessages.length - 1, replayIndex + 1))} disabled={replayIndex === replayMessages.length - 1} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-300 disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
                </div>
                {replayIndex === replayMessages.length - 1 && (
                  <button onClick={() => generateReport(replayMessages)} disabled={loading} className="m-3 mt-0 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white"><CircleGauge className="h-4 w-4" /> Generate replay report</button>
                )}
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <Upload className="mx-auto h-9 w-9 text-slate-700" />
                  <p className="mt-3 text-sm text-slate-400">Upload a JSON array of user and assistant messages.</p>
                  <code className="mt-3 block rounded-lg bg-slate-950 px-3 py-2 text-xs text-slate-500">{'[{"role":"user","content":"..."}]'}</code>
                  <p className="mt-3 text-xs text-slate-600">Replay state is temporary and exists only in this browser tab.</p>
                </div>
              </div>
            )}
          </section>
          <section className="min-h-[600px] rounded-xl border border-slate-800 bg-slate-950/30 p-3"><CoachingPanel analysis={activeAnalysis} loading={replayLoading} /></section>
          <section className="min-h-[600px] rounded-xl border border-slate-800 bg-slate-950/30 p-3"><KnowledgePanel recommendations={activeRecommendations} loading={replayLoading} /></section>
        </div>
      )}
    </div>
  )
}

function KnowledgePage() {
  const [file, setFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversationId, setConversationId] = useState(null)

  async function uploadDocument() {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      setUploadResult(await api.uploadDocument(file))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitQuery() {
    const value = query.trim()
    if (!value) return
    setLoading(true)
    setError('')
    try {
      const result = await api.chat({ conversation_id: conversationId, query: value, top_k: 5 })
      setConversationId(result.conversation_id)
      setMessages((current) => [
        ...current,
        { role: 'user', content: value },
        { role: 'assistant', content: result.answer, results: result.results },
      ])
      setQuery('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Document ingestion</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">Upload PDF, TXT, or MD files to the existing ChromaDB knowledge base.</p>
        </div>
        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-5 text-center hover:border-indigo-500">
          <Upload className="mb-3 h-7 w-7 text-slate-500" />
          <span className="text-sm text-slate-300">{file ? file.name : 'Choose a document'}</span>
          <span className="mt-1 text-xs text-slate-600">PDF, TXT, or MD</span>
          <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        </label>
        <button onClick={uploadDocument} disabled={!file || loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload and index
        </button>
        {uploadResult && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-sm font-semibold text-emerald-300">{uploadResult.filename}</p>
            <p className="mt-1 text-xs text-slate-400">{uploadResult.chunks} chunks indexed</p>
          </div>
        )}
        {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      </aside>

      <section className="flex min-h-[650px] flex-col rounded-xl border border-slate-800 bg-slate-900/40">
        <header className="border-b border-slate-800 px-4 py-3">
          <p className="text-sm font-semibold text-slate-300">RAG Knowledge Chat</p>
          {conversationId && <p className="mt-1 text-xs text-slate-500">Conversation {conversationId}</p>}
        </header>
        <div className="panel-scroll flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <BookOpen className="mx-auto h-9 w-9 text-slate-700" />
                <p className="mt-3 text-sm text-slate-500">Ask a support-policy question.</p>
              </div>
            </div>
          ) : messages.map((message, index) => (
            <div key={index}>
              {message.role === 'user' ? (
                <ChatBubble message={message} />
              ) : (
                <div className="mr-10 rounded-2xl rounded-bl-md border border-slate-700 bg-slate-800/80 px-4 py-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-400">Knowledge answer</p>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{message.content}</p>
                  {message.results?.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-slate-700 pt-3">
                      {message.results.slice(0, 3).map((result, resultIndex) => (
                        <div key={`${result.chunk_id}-${resultIndex}`} className="rounded-lg bg-slate-950/60 p-3">
                          <div className="flex justify-between gap-3 text-xs">
                            <span className="truncate font-semibold text-slate-400">{result.filename || result.document_name}</span>
                            <span className="text-cyan-400">{Math.round(result.score * 100)}%</span>
                          </div>
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{result.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-slate-800 p-3">
          <textarea value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitQuery() } }} placeholder="Ask about refunds, cancellation, delivery..." className="min-h-11 flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" />
          <button onClick={submitQuery} disabled={loading || !query.trim()} className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white disabled:opacity-40">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </section>
    </div>
  )
}

function ReportsPage({ report }) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function saveReport() {
    if (!report) return
    setLoading(true)
    setError('')
    try {
      await api.saveSession(report)
      setSaved(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  function downloadReport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `coaching-report-${report.session_id || 'session'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (!report) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
        <div>
          <CircleGauge className="mx-auto h-10 w-10 text-slate-700" />
          <h2 className="mt-4 text-lg font-semibold text-slate-300">No report generated</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">End a Simulator or Manual session, or complete a Replay, to generate a report with the existing summary API.</p>
        </div>
      </div>
    )
  }

  const quality = report.resolution_quality || {}
  const journey = report.sentiment_journey || []

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <div className="flex items-center gap-3">
            <RiskBadge risk={report.final_escalation_risk} />
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold capitalize text-slate-300">{report.resolution_status?.replaceAll('_', ' ')}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">Post-Interaction Report</h1>
          <p className="mt-1 text-sm text-slate-500">Session {report.session_id}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadReport} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300"><Download className="h-4 w-4" /> Export</button>
          <button onClick={saveReport} disabled={loading || saved} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved' : 'Save session'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Resolution quality', `${quality.total ?? 0}/100`, 'Issue resolution'],
          ['Customer turns', report.customer_turns ?? 0, 'Detected customer messages'],
          ['Max frustration', `${report.max_frustration ?? 0}/10`, report.final_sentiment || 'neutral'],
          ['Dominant intent', report.dominant_intent?.replaceAll('_', ' ') || 'General inquiry', `${report.total_turns ?? 0} total turns`],
        ].map(([title, value, subtitle]) => (
          <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-500">{title}</p>
            <p className="mt-2 text-xl font-bold capitalize text-slate-100">{value}</p>
            <p className="mt-1 text-xs capitalize text-slate-500">{subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-bold text-slate-200">Conversation summary</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">{report.conversation_summary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-950/50 p-3"><p className="text-xs text-slate-500">Primary issue</p><p className="mt-1 text-sm text-slate-300">{report.primary_issue}</p></div>
            <div className="rounded-lg bg-slate-950/50 p-3"><p className="text-xs text-slate-500">Final resolution</p><p className="mt-1 text-sm text-slate-300">{report.final_resolution}</p></div>
          </div>
        </section>
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-bold text-slate-200">Resolution quality</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['Issue resolution', quality.issue_resolution],
              ['Communication', quality.communication_quality],
              ['Empathy', quality.empathy_shown],
              ['Guidelines', quality.guideline_adherence],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-800 p-3">
                <div className="flex justify-between text-xs"><span className="text-slate-500">{label}</span><span className="font-bold text-slate-300">{value ?? 0}%</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${value ?? 0}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {journey.length > 0 && (
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-bold text-slate-200">Sentiment journey</h2>
          <div className="panel-scroll mt-4 flex gap-3 overflow-x-auto pb-2">
            {journey.map((point, index) => (
              <div key={`${point.turn}-${index}`} className="min-w-44 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Turn {point.turn}</span><RiskBadge risk={point.escalation_risk} /></div>
                <p className="mt-2 text-sm font-semibold capitalize text-slate-300">{point.emotion}</p>
                <p className="mt-1 text-xs text-slate-500">Frustration {point.frustration}/10 · {point.sentiment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Strengths', report.agent_strengths],
          ['Weaknesses', report.agent_weaknesses],
          ['Coaching recommendations', report.coaching_recommendations],
        ].map(([title, items]) => (
          <section key={title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-sm font-bold text-slate-200">{title}</h2>
            <ul className="mt-3 space-y-2">
              {(items || []).map((item, index) => (
                <li key={index} className="flex gap-2 text-sm leading-6 text-slate-400"><ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-indigo-400" /> {item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      setDashboard((await api.dashboard()).dashboard)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    api.dashboard()
      .then((result) => {
        if (active) setDashboard(result.dashboard)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  async function clearSessions() {
    if (!window.confirm('Clear all saved analytics sessions?')) return
    try {
      await api.clearSessions()
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (loading) return <div className="flex min-h-[520px] items-center justify-center"><Spinner text="Loading analytics..." /></div>
  if (error) return <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>

  const resolutionData = (dashboard?.resolution_trend || []).map((item) => ({ name: item.session_id, quality: item.quality }))
  const escalationData = Object.entries(dashboard?.escalation_frequency || {}).map(([name, count]) => ({ name, count }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Performance Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Aggregated by the existing backend analytics store.</p>
        </div>
        <button onClick={clearSessions} disabled={!dashboard?.total_sessions} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 disabled:opacity-40"><Trash2 className="h-4 w-4" /> Clear sessions</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Total sessions', dashboard.total_sessions],
          ['Resolved', dashboard.resolved_count],
          ['Avg. quality', `${dashboard.avg_resolution_quality}/100`],
          ['Avg. frustration', dashboard.avg_frustration],
          ['Escalations', dashboard.escalated_count],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{value}</p>
          </div>
        ))}
      </div>
      {dashboard.total_sessions === 0 ? (
        <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-slate-800 text-center">
          <div><BarChart3 className="mx-auto h-9 w-9 text-slate-700" /><p className="mt-3 text-sm text-slate-500">No saved sessions yet.</p></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-bold text-slate-200">Resolution quality trend</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resolutionData}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="quality" stroke="#818cf8" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-bold text-slate-200">Escalation frequency</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={escalationData}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-bold text-slate-200">Common intents</h2>
              <div className="mt-3 space-y-2">{Object.entries(dashboard.common_intents || {}).map(([intent, count]) => <div key={intent} className="flex justify-between rounded-lg bg-slate-950/50 px-3 py-2 text-sm"><span className="capitalize text-slate-400">{intent.replaceAll('_', ' ')}</span><span className="text-slate-200">{count}</span></div>)}</div>
            </section>
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-bold text-slate-200">Knowledge gaps</h2>
              <div className="mt-3 space-y-2">{dashboard.knowledge_gaps?.length ? dashboard.knowledge_gaps.map((item) => <p key={item} className="rounded-lg bg-amber-500/5 px-3 py-2 text-sm text-amber-300">{item}</p>) : <p className="text-sm text-slate-500">No knowledge gaps identified.</p>}</div>
            </section>
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-bold text-slate-200">Top coaching recommendations</h2>
              <ul className="mt-3 space-y-2">{dashboard.top_coaching_recommendations?.map((item, index) => <li key={index} className="text-sm leading-6 text-slate-400">• {item}</li>)}</ul>
            </section>
          </div>
          <section className="overflow-hidden rounded-xl border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Session</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Quality</th><th className="px-4 py-3">Frustration</th><th className="px-4 py-3">Risk</th></tr></thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/30">
                  {[...(dashboard.sessions || [])].reverse().map((session) => (
                    <tr key={session.session_id} className="text-slate-400"><td className="px-4 py-3 font-semibold text-slate-300">{session.session_id}</td><td className="px-4 py-3 capitalize">{session.resolution_status?.replaceAll('_', ' ')}</td><td className="px-4 py-3">{session.resolution_quality_total}</td><td className="px-4 py-3">{session.max_frustration}/10</td><td className="px-4 py-3"><RiskBadge risk={session.final_escalation_risk} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default function App() {
  const [activePage, setActivePage] = useState('console')
  const [report, setReport] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    api.health()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-200">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-slate-800/80 bg-[#091423] lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800/80 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-950/50">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Support Coach</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">AI workspace</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${activePage === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-800/80 p-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div className="flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400' : backendStatus === 'offline' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`} />
              <span className="text-slate-400">Backend</span>
              <span className="ml-auto capitalize text-slate-300">{backendStatus}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:pl-60">
        <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-[#07111f]/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 lg:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-600">Customer support coaching</p>
              <h1 className="mt-1 text-lg font-bold text-white">
                {NAV_ITEMS.find((item) => item.id === activePage)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <select value={activePage} onChange={(event) => setActivePage(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
                {NAV_ITEMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 sm:flex">
              <span className={`h-2 w-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {backendStatus === 'online' ? 'Connected to FastAPI' : 'Backend unavailable'}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1800px] p-4 lg:p-6">
          {activePage === 'console' && <Console setReport={setReport} />}
          {activePage === 'knowledge' && <KnowledgePage />}
          {activePage === 'reports' && <ReportsPage report={report} />}
          {activePage === 'analytics' && <AnalyticsPage />}
        </div>

        <footer className="mx-4 mb-5 rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3 text-xs leading-5 text-slate-500 lg:mx-6">
          <strong className="text-slate-400">Backend limitation:</strong> Manual conversations and Replay transcripts are browser-session state only. They are not permanently stored by the existing backend. Analytics persistence and post-interaction reports use only the available save/report endpoints.
        </footer>
      </main>
    </div>
  )
}
