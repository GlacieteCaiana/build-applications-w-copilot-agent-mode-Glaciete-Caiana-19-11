import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { StatusMessage } from './StatusMessage.js';

type Suggestion = { title: string; focus: string; minutes: number; difficulty: string; reason: string };
type SuggestionsResponse = { suggestions: Suggestion[] };
type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: Suggestion[] };

const DEMO_USER_EMAIL = 'mona@example.com';

export default function Workouts() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<SuggestionsResponse>(`/api/workouts/suggestions/${encodeURIComponent(DEMO_USER_EMAIL)}`)
      .then((data) => { if (active) setState({ status: 'ready', items: data.suggestions }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, []);

  return (
    <section>
      <h2>Sugestões de treino</h2>
      <p>Receba recomendações de treino com base nos seus padrões de atividade.</p>
      {state.status === 'loading' && <StatusMessage tone="status">Carregando sugestões...</StatusMessage>}
      {state.status === 'error' && <StatusMessage tone="alert">Não foi possível carregar as sugestões de treino.</StatusMessage>}
      {state.status === 'ready' && state.items.length === 0 && <p>Nenhuma sugestão disponível no momento.</p>}
      {state.status === 'ready' && state.items.map((suggestion) => (
        <article key={suggestion.title} className="card mb-3">
          <div className="card-body">
            <h3 className="h5">{suggestion.title}</h3>
            <p className="mb-1">{suggestion.minutes} min · dificuldade {suggestion.difficulty}</p>
            <p className="text-body-secondary mb-0">{suggestion.reason}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
