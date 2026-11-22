import { Activity, Team, User, Workout } from '../models/index.js';

const OBJECT_ID = /^[a-f\d]{24}$/i;
const FOCUS_BY_ACTIVITY: Record<string, string> = {
  run: 'endurance',
  cycle: 'endurance',
  walk: 'endurance',
  swim: 'endurance',
  strength: 'strength',
  mobility: 'mobility',
  yoga: 'mobility',
};
const FOCUS_LABEL: Record<string, string> = { endurance: 'resistência', strength: 'força', mobility: 'mobilidade' };

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && OBJECT_ID.test(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = (input ?? {}) as Record<string, unknown>;
  if (!isObjectId(userId) || !isObjectId(teamId)) throw httpError(400, 'userId e teamId devem ser identificadores válidos');
  if (typeof type !== 'string' || !type.trim()) throw httpError(400, 'Informe o tipo da atividade');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) throw httpError(400, 'minutes deve ser um número positivo');
  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user) throw httpError(404, 'Pessoa não encontrada');
  if (!team) throw httpError(404, 'Equipe não encontrada');
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: Math.round(minutes),
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members = [] } = (input ?? {}) as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'O nome da equipe é obrigatório');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'Informe o mascote da equipe');
  if (!Array.isArray(members) || !members.every(isObjectId)) throw httpError(400, 'members deve conter identificadores válidos');
  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members });
  return team.toObject();
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([{ $group: { _id: '$team', totalPoints: { $sum: '$points' } } }]),
  ]);
  const pointsByTeam = new Map(totals.map((row) => [String(row._id), row.totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(String(team._id)) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName, 'pt-BR'))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError(404, 'Pessoa não encontrada para este e-mail');
  const recent = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focus = user.fitnessGoal || (recent ? FOCUS_BY_ACTIVITY[recent.type] : undefined) || 'endurance';
  const workouts = await Workout.find().lean();
  const ordered = [...workouts.filter((workout) => workout.focus === focus), ...workouts.filter((workout) => workout.focus !== focus)];
  const goalLabel = FOCUS_LABEL[user.fitnessGoal] ?? user.fitnessGoal;
  const activityText = recent ? `atividade recente de ${recent.type}` : 'nenhuma atividade recente';
  return ordered.slice(0, 3).map((workout) => ({
    ...workout,
    reason: workout.focus === focus
      ? `Indicado para ${FOCUS_LABEL[focus] ?? focus}: meta de ${goalLabel} e ${activityText}.`
      : 'Alternativa para variar o treino, sem relação direta com sua meta.',
  }));
}

export { User };
