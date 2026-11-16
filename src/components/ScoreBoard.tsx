interface ScoreBoardProps {
  score: number
  best: number
  scoreDelta: number
}

export const ScoreBoard = ({ score, best, scoreDelta }: ScoreBoardProps) => (
  <div className="scores">
    <div className="score-card" aria-live="polite">
      <span className="label">Счёт</span>
      <span className="value">{score}</span>
      {scoreDelta > 0 ? <span className="score-bump">+{scoreDelta}</span> : null}
    </div>
    <div className="score-card">
      <span className="label">Рекорд</span>
      <span className="value">{best}</span>
    </div>
  </div>
)
