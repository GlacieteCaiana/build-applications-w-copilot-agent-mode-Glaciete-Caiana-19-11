import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { StatusMessage } from './StatusMessage.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };
type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: LeaderboardEntry[] };

export default function Leaderboard() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then((data) => { if (active) setState({ status: 'ready', items: data.leaderboard }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, []);

  return (
    <section>
      <h2>Placar</h2>
      <p>Compare a pontuação total das equipes.</p>
      {state.status === 'loading' && <StatusMessage tone="status">Carregando o placar...</StatusMessage>}
      {state.status === 'error' && <StatusMessage tone="alert">Não foi possível carregar o placar.</StatusMessage>}
      {state.status === 'ready' && state.items.length === 0 && <p>Sem pontuação registrada ainda.</p>}
      {state.status === 'ready' && state.items.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead><tr><th scope="col">Posição</th><th scope="col">Equipe</th><th scope="col">Pontos</th></tr></thead>
            <tbody>
              {state.items.map((entry) => (
                <tr key={entry.teamName}>
                  <td>{entry.rank}</td>
                  <td>{entry.teamName}</td>
                  <td>{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
