import { matchLabels } from './tournamentData.js'

const tone = status => (/complete|finish/i.test(status) ? 'completed' : /ongoing|progress/i.test(status) ? 'ongoing' : /bye/i.test(status) ? 'bye' : 'scheduled')

export default function TournamentBracket({ rounds }) {
  if (!rounds.length) return <p className="tournaments-empty">Ban tổ chức chưa tạo nhánh đấu.</p>
  return <div className="tournaments-bracket-scroll" aria-label="Sơ đồ nhánh đấu"><div className="tournaments-bracket">{rounds.map((round, roundIndex) => <section key={`${round.label}-${roundIndex}`} className="tournaments-round"><h4>{round.label}</h4>{round.matches.map((match, index) => <article key={match.id || index} className={`tournaments-match ${tone(match.status)}`}><header><strong>Trận {match.order || index + 1}</strong><span>{matchLabels[match.status] || match.status || '—'}</span></header>{[[match.a, match.scoreA], [match.b, match.scoreB]].map(([side, score], sideIndex) => side.name
    ? <div key={sideIndex} className={`tournaments-bracket-side${match.winnerId && match.winnerId === side.id ? ' winner' : ''}`}><span>{side.name}</span><strong>{score ?? '—'}</strong></div>
    : <p key={sideIndex} className="tournaments-bracket-placeholder">{roundIndex === 0 ? 'Miễn vòng' : 'Chờ người thắng vòng trước'}</p>)}</article>)}</section>)}</div></div>
}
