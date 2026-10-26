import { test } from 'node:test';
import assert from 'node:assert/strict';
import { portalHealthSummary } from '../../src/lib/portal-health-summary.mjs';
test('portal health distinguishes no observations, assisted sources and consecutive failures', () => {
  const rows = portalHealthSummary({ tracked_companies: [{ name: 'A' }, { name: 'B', scan_method: 'websearch' }, { name: 'C', enabled: false }] }, 'timestamp\tcompany\tstatus\n2026-10-14T10:00:00Z\tA\treachable\n2026-10-15T10:00:00Z\tA\tnetwork\n2026-10-16T10:00:00Z\tA\tauth\n');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].consecutive_failures, 2);
  assert.equal(rows[1].status, 'unverified');
  assert.equal(rows[1].mode, 'assistida');
});
