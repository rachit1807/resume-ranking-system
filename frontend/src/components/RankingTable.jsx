import { ArrowDownUp, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import ScoreRing from './ScoreRing'

export default function RankingTable({ candidates, onSelect, query, setQuery, filter, setFilter }) {
  const visible = candidates.filter((candidate) => {
    const matchesQuery = candidate.name.toLowerCase().includes(query.toLowerCase()) || candidate.matched_skills.join(' ').toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'All' || (filter === 'Top matches' ? candidate.score >= 80 : candidate.score >= 65 && candidate.score < 80)
    return matchesQuery && matchesFilter
  })
  return (
    <section className="panel ranking-panel">
      <div className="panel-heading ranking-heading"><div><span className="eyebrow">Live shortlist</span><h2>Candidate ranking</h2><p>{visible.length} of {candidates.length} candidates shown</p></div><button className="button secondary"><ArrowDownUp size={15} />Highest score</button></div>
      <div className="table-tools"><label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or skill" /></label><div className="filter-pills"><SlidersHorizontal size={15} />{['All', 'Top matches', 'Good matches'].map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div>
      <div className="candidate-table">
        <div className="table-row table-header"><span>Rank</span><span>Candidate</span><span>Matched skills</span><span>Experience</span><span>Match</span><span /></div>
        {visible.map((candidate) => <button className="table-row candidate-row" key={candidate.id} onClick={() => onSelect(candidate)}>
          <span className="rank-number">{String(candidate.rank).padStart(2, '0')}</span>
          <span className="candidate-cell"><i className="avatar">{candidate.initials}</i><span><strong>{candidate.name}</strong><small>{candidate.education}</small></span></span>
          <span className="mini-tags">{candidate.matched_skills.slice(0, 3).map((skill) => <b key={skill}>{skill}</b>)}{candidate.matched_skills.length > 3 && <em>+{candidate.matched_skills.length - 3}</em>}</span>
          <span className="experience"><strong>{candidate.experience_years || '—'}</strong><small>years</small></span>
          <span className="score-cell"><ScoreRing score={candidate.score} /><span><strong>{candidate.recommendation}</strong><small>{Math.round(candidate.score)}% overall fit</small></span></span>
          <span className="row-arrow"><ChevronRight size={18} /></span>
        </button>)}
        {!visible.length && <div className="empty-state"><Search size={24} /><strong>No candidates found</strong><span>Try another search or filter.</span></div>}
      </div>
    </section>
  )
}

