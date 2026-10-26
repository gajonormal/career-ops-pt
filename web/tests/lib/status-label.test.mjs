import assert from 'node:assert/strict';
import { test } from 'node:test';
import { statusLabel } from '../../src/lib/status-label.mjs';

test('PT display labels preserve unknown values and accept canonical statuses', () => {
  for (const [state, label] of [['Applied', 'Enviada'], ['Evaluated', 'Avaliada'], ['Interview', 'Entrevista'], ['INBOX', 'Por avaliar'], ['ALL', 'Todas']]) assert.equal(statusLabel(state), label);
  assert.equal(statusLabel('Applied', { plural: true }), 'Enviadas');
  assert.equal(statusLabel('Awaiting custom review'), 'Awaiting custom review');
});
