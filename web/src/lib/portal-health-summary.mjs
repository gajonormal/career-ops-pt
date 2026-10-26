export function portalHealthSummary(config, history) {
  const records = String(history || '').split(/\r?\n/).map(line => line.split('\t')).filter(row => row.length >= 3 && Number.isFinite(Date.parse(row[0]))).sort((a, b) => Date.parse(b[0]) - Date.parse(a[0]));
  return [...(config?.tracked_companies || []), ...(config?.job_boards || [])].filter(entry => entry?.enabled !== false).map(entry => {
    const previous = records.filter(row => row[1] === entry.name);
    const latest = previous[0];
    let failures = 0;
    for (const row of previous) { if (['reachable', 'empty'].includes(row[2])) break; failures++; }
    const assisted = ['websearch', 'browser', 'agent'].includes(String(entry.method || entry.scan_method || '').toLowerCase());
    return { name: entry.name, mode: assisted ? 'assistida' : 'automática ou a verificar', last_checked: latest?.[0] || null, status: latest?.[2] || 'unverified', consecutive_failures: failures };
  });
}
