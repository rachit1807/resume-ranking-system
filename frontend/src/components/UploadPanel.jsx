import { FileCheck2, FilePlus2, LoaderCircle, Play, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'

export default function UploadPanel({ description, setDescription, onAnalyze, loading }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)

  const addFiles = (incoming) => {
    const accepted = [...incoming].filter((file) => /\.(pdf|docx)$/i.test(file.name))
    setFiles((current) => [...current, ...accepted].slice(0, 25))
  }
  const submit = () => onAnalyze(files)
  return (
    <section className="setup-grid">
      <div className="panel role-panel"><div className="panel-heading"><div><span className="step">01</span><h2>Define the role</h2></div><span className="status-dot">Ready</span></div><label>Job description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Paste the full role description, responsibilities and required skills…" /></label><div className="input-meta"><span>{description.length.toLocaleString()} characters</span><span>Tip: include skills and experience</span></div></div>
      <div className="panel upload-panel"><div className="panel-heading"><div><span className="step">02</span><h2>Add candidates</h2></div><span className="status-dot">{files.length}/25</span></div>
        <button className={`dropzone ${dragging ? 'dragging' : ''}`} onClick={() => fileRef.current.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}><UploadCloud size={28} /><strong>Drop resumes here</strong><span>or click to browse PDF and DOCX files</span><small>Up to 25 files · 8 MB each</small></button>
        <input ref={fileRef} type="file" accept=".pdf,.docx" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        {files.length > 0 && <div className="file-list">{files.map((file, index) => <div key={`${file.name}-${index}`}><FileCheck2 size={16} /><span>{file.name}</span><small>{(file.size / 1024).toFixed(0)} KB</small><button onClick={() => setFiles(files.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`}><Trash2 size={14} /></button></div>)}</div>}
        {!files.length && <div className="upload-hint"><FilePlus2 size={16} />Demo mode is ready if you want to explore without files.</div>}
      </div>
      <div className="run-card"><div><Sparkles size={21} /><span><strong>Explainable matching</strong><small>Semantic fit + skills + experience + education</small></span></div><button className="button primary" onClick={submit} disabled={loading || description.length < 40}>{loading ? <><LoaderCircle className="spin" size={17} />Analyzing…</> : <><Play size={16} />{files.length ? `Rank ${files.length} candidates` : 'Run demo ranking'}</>}</button></div>
    </section>
  )
}

