export default function ScoreRing({ score, size = 48 }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const tone = score >= 80 ? 'excellent' : score >= 65 ? 'good' : score >= 50 ? 'fair' : 'low'
  return (
    <div className={`score-ring ${tone}`} style={{ width: size, height: size }} aria-label={`${score}% match`}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="ring-track" cx="22" cy="22" r={radius} />
        <circle className="ring-value" cx="22" cy="22" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
      </svg>
      <strong>{Math.round(score)}</strong>
    </div>
  )
}

