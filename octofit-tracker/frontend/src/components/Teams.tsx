import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { StatusMessage } from './StatusMessage.js';

type Team = { name: string; mascot?: string; members: unknown[] };
type TeamsResponse = { teams: Team[] };
type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: Team[] };

export default function Teams() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<TeamsResponse>('/api/teams')
      .then((data) => { if (active) setState({ status: 'ready', items: data.teams }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, []);

  return (
    <section>
      <h2>Equipes</h2>
      <p>Gerencie equipes e integrantes.</p>
      {state.status === 'loading' && <StatusMessage tone="status">Carregando equipes...</StatusMessage>}
      {state.status === 'error' && <StatusMessage tone="alert">Não foi possível carregar as equipes.</StatusMessage>}
      {state.status === 'ready' && state.items.length === 0 && <p>Sem equipes cadastradas ainda.</p>}
      {state.status === 'ready' && state.items.length > 0 && (
        <ul className="list-group">
          {state.items.map((team) => (
            <li key={team.name} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <strong>{team.name}</strong>
                {team.mascot && <span className="text-body-secondary"> · mascote {team.mascot}</span>}
              </span>
              <span className="badge text-bg-secondary">{team.members.length} integrantes</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
