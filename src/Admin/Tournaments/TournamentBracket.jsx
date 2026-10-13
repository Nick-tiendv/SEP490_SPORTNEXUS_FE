import { matchLabels } from './tournamentData.js'

export default function TournamentBracket({ tournament, onParticipant }) {
  if (!tournament.bracket) return <p className="tournaments-empty">Chưa có nhánh đấu. Cần ít nhất 2 người đăng ký để tạo nhánh đấu minh họa.</p>
  const byId = new Map(tournament.participants.map(player => [player.id, player]))
  return <div className="tournaments-bracket-scroll" aria-label="Sơ đồ nhánh đấu minh họa"><div className="tournaments-bracket">{tournament.bracket.rounds.map((round, roundIndex) => <section key={round.label} className="tournaments-round"><h4>{round.label}</h4>{round.matches.map(match => <article key={match.id} className={`tournaments-match ${match.status.toLowerCase()}`}><header><strong>Trận {match.id}</strong><span>{matchLabels[match.status]}</span></header>{[match.a, match.b].map((id, index) => {
    const participant = byId.get(id)
    return participant ? <button key={index} className={match.winnerId === id ? 'winner' : ''} onClick={() => onParticipant(participant)}><span>{participant.name}<small>Hạt giống {participant.seed}</small></span><strong>{match.score ? match.score[index] : match.winnerId === id && match.status === 'Bye' ? 'Miễn vòng' : '—'}</strong></button> : <p key={index} className="tournaments-bracket-placeholder">{roundIndex === 0 ? 'Không có đối thủ · Miễn vòng' : `Chờ người thắng trận vòng trước`}</p>
  })}</article>)}</section>)}</div></div>
}
