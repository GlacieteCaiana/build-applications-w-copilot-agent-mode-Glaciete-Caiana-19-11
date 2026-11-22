import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { StatusMessage } from './StatusMessage.js';

type Activity = { type: string; minutes: number; points: number; occurredAt?: string };
type ActivitiesResponse = { activities: Activity[] };
type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: Activity[] };

const TYPE_LABELS: Record<string, string> = {
  run: 'Corrida',
  cycle: 'Ciclismo',
  walk: 'Caminhada',
  swim: 'Natação',
  strength: 'Força',
  mobility: 'Mobilidade',
  yoga: 'Ioga',
};

export default function Activities() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<ActivitiesResponse>('/api/activities')
      .then((data) => { if (active) setState({ status: 'ready', items: data.activities }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, []);

  return (
    <section>
      <h2>Atividades</h2>
      <p>Acompanhe os minutos de atividade e os pontos das pessoas participantes.</p>
      {state.status === 'loading' && <StatusMessage tone="status">Carregando atividades...</StatusMessage>}
      {state.status === 'error' && <StatusMessage tone="alert">Não foi possível carregar as atividades.</StatusMessage>}
      {state.status === 'ready' && state.items.length === 0 && <p>Sem atividades registradas ainda.</p>}
      {state.status === 'ready' && state.items.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead><tr><th scope="col">Tipo</th><th scope="col">Minutos</th><th scope="col">Pontos</th></tr></thead>
            <tbody>
              {state.items.map((activity, index) => (
                <tr key={index}>
                  <td>{TYPE_LABELS[activity.type] ?? activity.type}</td>
                  <td>{activity.minutes}</td>
                  <td>{activity.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
