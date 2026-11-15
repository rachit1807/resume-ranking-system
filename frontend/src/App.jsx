import {
  ArrowRight, ChevronRight, CircleHelp, Download, FileCheck2,
  Filter, LoaderCircle, Moon, Search, ShieldCheck, Sparkles, Sun, Trash2, Upload,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import CandidateDrawer from './components/CandidateDrawer'
import { demoCandidates, demoDescription } from './data/demo'

const scoreWeights = [
  ['Semantic alignment', 45, 'Full resume and role language'],
  ['Skills coverage', 35, 'Required capabilities detected'],
  ['Experience', 15, 'Years compared with requirement'],
  ['Education', 5, 'Only when the role specifies it'],
]

function initialTheme() {
  return localStorage.getItem('rankwise-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [view, setView] = useState('workbench')
  const [description, setDescription] = useState(demoDescription)
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [candidates, setCandidates] = useState(demoCandidates)
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [notice, setNotice] = useState('Demo evidence is loaded. Add resumes to run a live ranking.')
  const fileRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rankwise-theme', theme)
  }, [theme])

  const refreshHistory = async () => {
    try {
      const response = await fetch('/api/runs?limit=8')
      if (response.ok) setHistory(await response.json())
    } catch {
      // The archive remains optional while the frontend is used without the API.
    }
  }

  useEffect(() => { refreshHistory() }, [])

  const visible = useMemo(() => candidates.filter((candidate) => {
    const matchesQuery = `${candidate.name} ${candidate.matched_skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'strong' ? candidate.score >= 80 : candidate.score >= 65 && candidate.score < 80)
    return matchesQuery && matchesFilter
  }), [candidates, filter, query])

  const summary = useMemo(() => ({
    average: Math.round(candidates.reduce((sum, candidate) => sum + candidate.score, 0) / candidates.length),
    strong: candidates.filter((candidate) => candidate.score >= 80).length,
    skills: new Set(candidates.flatMap((candidate) => candidate.matched_skills)).size,
  }), [candidates])

  const addFiles = (incoming) => {
    const accepted = [...incoming].filter((file) => /\.(pdf|docx)$/i.test(file.name))
    setFiles((current) => [...current, ...accepted].slice(0, 25))
  }

  const runRanking = async () => {
    if (!files.length) {
      setCandidates(demoCandidates)
      setNotice('Demo ranking refreshed with five sample candidates.')
      return
    }
    setLoading(true)
    setNotice('Reading resumes and comparing evidence…')
    const body = new FormData()
    body.append('job_description', description)
    files.forEach((file) => body.append('resumes', file))
    try {
      const response = await fetch('/api/rank', { method: 'POST', body })
      const payload = await response.json()
      if (!response.ok) throw new Error(typeof payload.detail === 'string' ? payload.detail : 'The resumes could not be analyzed.')
      setCandidates(payload.candidates)
      await refreshHistory()
      setNotice(`${payload.processed} candidates ranked${payload.failed ? ` · ${payload.failed} files need attention` : ' · all files processed'}.`)
    } catch (error) {
      setNotice(`${error.message} Check that the FastAPI service is running.`)
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    const rows = [['Rank', 'Candidate', 'Score', 'Recommendation', 'Experience', 'Matched skills'], ...candidates.map((candidate) => [candidate.rank, candidate.name, candidate.score, candidate.recommendation, candidate.experience_years, candidate.matched_skills.join('; ')])]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'candidate-ranking.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return <div className="studio-shell">
    <header className="masthead">
      <button className="wordmark" onClick={() => setView('workbench')} aria-label="Open workbench"><span>R/F</span><div><strong>RANKFORM</strong><small>EVIDENCE STUDIO</small></div></button>
      <nav aria-label="Primary navigation">{[['workbench', 'Workbench'], ['rankings', 'Rankings'], ['method', 'Scoring notes']].map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</nav>
      <div className="mast-actions"><span className="privacy-mark"><ShieldCheck size={14} />Local review</span><button className="theme-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle color theme">{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button><button className="operator"><span>RT</span><strong>Rachit</strong></button></div>
    </header>
    <div className="signal-line"><span><i />SYSTEM READY</span><span>PDF + DOCX</span><span>25 FILE BATCH</span><span>FILES NOT STORED</span><b>ASSIGNMENT / 01</b></div>

    {view === 'workbench' && <main>
      <section className="editorial-intro"><div><span className="kicker">OPEN SEARCH · ROLE 04</span><h1>Find the signal<br />in every <em>résumé.</em></h1></div><div className="intro-copy"><p>A structured review surface for comparing candidate evidence against one role—without hiding the reasoning.</p><div><span><b>{candidates.length}</b> profiles</span><span><b>{summary.average}</b> avg. fit</span><span><b>{summary.strong}</b> strong</span></div></div></section>
      <section className="workbench">
        <aside className="brief-column">
          <div className="section-cap"><span>01</span><div><b>ROLE BRIEF</b><small>Define the comparison target</small></div></div>
          <label className="field-label">POSITION DESCRIPTION <small>{description.length} CHARACTERS</small></label>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} aria-label="Position description" />
          <div className="upload-section"><div className="section-cap"><span>02</span><div><b>CANDIDATE FILES</b><small>PDF or DOCX · 8 MB max</small></div></div><button className={`file-drop ${dragging ? 'dragging' : ''}`} onClick={() => fileRef.current.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files) }}><Upload size={19} /><span><b>Drop files or browse</b><small>{files.length ? `${files.length} of 25 selected` : 'Run demo with no files'}</small></span><ArrowRight size={16} /></button><input ref={fileRef} type="file" accept=".pdf,.docx" multiple hidden onChange={(event) => addFiles(event.target.files)} />{files.length > 0 && <div className="compact-files">{files.map((file, index) => <div key={`${file.name}-${index}`}><FileCheck2 size={13} /><span>{file.name}</span><button onClick={() => setFiles(files.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`}><Trash2 size={12} /></button></div>)}</div>}</div>
          <button className="run-button" onClick={runRanking} disabled={loading || description.length < 40}>{loading ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}<span><b>{loading ? 'ANALYZING EVIDENCE' : files.length ? `RANK ${files.length} CANDIDATES` : 'RUN DEMO RANKING'}</b><small>Transparent four-part scoring</small></span><ArrowRight size={18} /></button>
          <p className="run-notice"><i />{notice}</p>
        </aside>
        <section className="ranking-field">
          <div className="field-head"><div><span className="kicker">LIVE ORDER / {String(visible.length).padStart(2, '0')}</span><h2>Evidence ranking</h2></div><button onClick={exportCsv}><Download size={15} />EXPORT</button></div>
          <div className="ranking-tools"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search candidate or skill" /></label><div><Filter size={14} />{[['all', 'All'], ['strong', '80+'], ['good', '65–79']].map(([id, label]) => <button className={filter === id ? 'active' : ''} onClick={() => setFilter(id)} key={id}>{label}</button>)}</div></div>
          <div className="ranking-list">{visible.map((candidate) => <button className="evidence-row" onClick={() => setSelected(candidate)} key={candidate.id}><span className="ordinal">{String(candidate.rank).padStart(2, '0')}</span><span className="identity"><i>{candidate.initials}</i><span><b>{candidate.name}</b><small>{candidate.experience_years || '—'} yrs · {candidate.education}</small></span></span><span className="evidence-tags">{candidate.matched_skills.slice(0, 3).map((skill) => <i key={skill}>{skill}</i>)}{candidate.matched_skills.length > 3 && <i>+{candidate.matched_skills.length - 3}</i>}</span><span className="score-track"><i style={{ width: `${candidate.score}%` }} /></span><span className="score-number"><b>{Math.round(candidate.score)}</b><small>/100</small></span><ChevronRight size={17} /></button>)}{!visible.length && <div className="no-results"><Search size={22} /><b>No matching profiles</b><span>Change the search or score filter.</span></div>}</div>
          <footer className="list-footer"><span>Scores support review; they do not make hiring decisions.</span><button onClick={() => setView('method')}><CircleHelp size={14} />HOW SCORING WORKS</button></footer>
        </section>
        <aside className="method-column"><div className="method-head"><span>MODEL CARD</span><b>v1.0 / EXPLAINABLE</b></div><h3>How this list<br />is ordered.</h3><p>Each profile is measured against the same role text using four visible factors.</p><div className="weight-list">{scoreWeights.map(([label, weight, note]) => <div key={label}><span style={{ '--weight': `${weight}%` }}><i /></span><div><b>{label}</b><small>{note}</small></div><strong>{weight}%</strong></div>)}</div><div className="band-key"><span>FIT BANDS</span><div><i className="high" />80–100 <b>Strong</b></div><div><i className="mid" />65–79 <b>Good</b></div><div><i className="low" />0–64 <b>Review</b></div></div><div className="method-note"><ShieldCheck size={18} /><p><b>Human decision required.</b> Names and protected traits are excluded from scoring. Verify every extracted claim.</p></div></aside>
      </section>
    </main>}

    {view === 'rankings' && <main className="archive-page"><header><span className="kicker">SHORTLIST ARCHIVE</span><h1>Current evidence set.</h1><p>{history.length ? `${history.length} saved ranking runs` : 'Demo evidence'} · {candidates.length} visible profiles · every explanation in one place.</p></header>{history.length > 0 && <section className="run-history"><span>SAVED RUNS</span><div>{history.map((run) => <button key={run.id} onClick={() => { setCandidates(run.candidates); setNotice(`Loaded saved ranking for ${run.job_title}.`) }}><small>{new Date(run.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</small><b>{run.job_title}</b><em>{run.processed} profiles · {Math.round(run.average_score)} avg.</em></button>)}</div></section>}<section className="archive-stats"><div><span>AVERAGE FIT</span><b>{summary.average}</b></div><div><span>STRONG MATCHES</span><b>{summary.strong}</b></div><div><span>UNIQUE SKILLS</span><b>{summary.skills}</b></div><button onClick={exportCsv}><Download size={16} />EXPORT SHORTLIST</button></section><div className="archive-grid">{candidates.map((candidate) => <button key={candidate.id} onClick={() => setSelected(candidate)}><span>{String(candidate.rank).padStart(2, '0')}</span><div><i>{candidate.initials}</i><h3>{candidate.name}</h3><p>{candidate.summary}</p></div><strong>{candidate.score}<small>/100</small></strong><ArrowRight size={18} /></button>)}</div></main>}

    {view === 'method' && <main className="notes-page"><header><span className="kicker">SCORING NOTES / READ BEFORE USE</span><h1>Visible inputs.<br />Auditable reasoning.</h1><p>The ranking is a structured comparison of resume text and a supplied role description. It is not a prediction of job performance.</p></header><section className="notes-grid">{scoreWeights.map(([label, weight, note], index) => <article key={label}><span>0{index + 1}</span><b>{weight}%</b><h2>{label}</h2><p>{note}. This component is normalized to a 0–100 score before its weight is applied.</p></article>)}</section><section className="guardrail"><ShieldCheck size={25} /><div><span>REVIEW GUARDRAIL</span><h2>Keep the person in the process.</h2><p>Review original resumes, validate parsed facts, accommodate non-standard career paths, and never use this score as the sole basis for rejection.</p></div><button onClick={() => setView('workbench')}>RETURN TO WORKBENCH <ArrowRight size={16} /></button></section></main>}
    <CandidateDrawer candidate={selected} onClose={() => setSelected(null)} />
  </div>
}
