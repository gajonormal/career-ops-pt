import { canonStatus } from './status-alias.mjs';

const LABELS = {
  INBOX: 'Por avaliar', ALL: 'Todas', EVALUATED: 'Avaliada',
  APPLIED: 'Enviada', RESPONDED: 'Com resposta', INTERVIEW: 'Entrevista',
  OFFER: 'Proposta', HIRED: 'Contratado', REJECTED: 'Rejeitada',
  DISCARDED: 'Descartada', SKIP: 'Ignorada',
};
const PLURAL = { ...LABELS, EVALUATED: 'Avaliadas', APPLIED: 'Enviadas', INTERVIEW: 'Entrevistas', OFFER: 'Propostas', HIRED: 'Contratados', REJECTED: 'Rejeitadas', DISCARDED: 'Descartadas', SKIP: 'Ignoradas' };

// Presentation only. URL parameters, API payloads and stored states stay canonical.
export function statusLabel(value, { plural = false } = {}) {
  return (plural ? PLURAL : LABELS)[canonStatus(value)] ?? value;
}
