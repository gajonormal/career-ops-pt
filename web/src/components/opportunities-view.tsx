"use client";
import { useEffect, useState } from "react";

type Row = { url: string; title: string; company: string; location: string; discovery_pass: boolean; seniority: { level: string; requirements: { evidence: string }[] }; eligibility: { status: string; evidence: string }; liveness: { result: string; checked_at?: string }; geography: { matched_places: string[]; routes?: { origin: string; destination: string; driving_url: string; transit_url: string }[] } };
type Feedback = { decision: string; reason: string };
const levels: Record<string, string> = { junior: "Júnior", stretch: "Mais exigente", experienced: "Experiente", conflicting: "Título e requisitos em conflito", unknown: "Senioridade por confirmar" };
const live: Record<string, string> = { active: "Aberto na última consulta", expired: "Expirado", uncertain: "Verificação inconclusiva", unverified: "Por verificar" };
const decisions: Record<string, string> = { interested: "Interessa", "not-interested": "Não interessa", review: "Rever mais tarde" };

export function OpportunitiesView() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  async function load() {
    setError("");
    try { const res = await fetch("/api/opportunities"); const data = await res.json(); if (!res.ok) throw Error(); setRows(data.review?.rows || []); setFeedback(data.feedback || {}); }
    catch { setError("Não foi possível carregar as oportunidades."); }
  }
  useEffect(() => { void load(); }, []);
  async function save(row: Row, decision: string) {
    setBusy(row.url); setError("");
    try { const res = await fetch("/api/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: row.url, decision, reason: reasons[row.url] ?? feedback[row.url]?.reason ?? "" }) }); const data = await res.json(); if (!res.ok || data.ok !== true || !data.entry) throw Error(); setFeedback(old => ({ ...old, [row.url]: data.entry })); }
    catch { setError("A decisão não foi guardada. Tenta novamente."); }
    finally { setBusy(""); }
  }
  const unique = new Set(rows?.map(row => row.url));
  const reviewed = Object.entries(feedback).filter(([url]) => unique.has(url)).map(([, entry]) => entry);
  return <div className="mt-6 space-y-4">
    {error && <p role="alert" className="text-red-600">{error} <button onClick={load} className="underline">Voltar a carregar</button></p>}
    {!rows && !error && <p role="status">A carregar…</p>}
    {rows?.length === 0 && <p>Ainda não há revisão guardada. Executa a revisão de anúncios com a opção <code>--save</code>.</p>}
    {!!rows?.length && <p className="text-sm text-muted">{unique.size} anúncios únicos · {reviewed.length} com decisão · {reviewed.filter(entry => entry.decision === "interested").length} com interesse · {reviewed.filter(entry => entry.decision === "not-interested").length} sem interesse · {reviewed.filter(entry => entry.decision === "review").length} para rever. Estes números refletem as tuas decisões, não a precisão dos filtros nem candidaturas enviadas.</p>}
    {!!rows?.length && <label className="flex gap-2 text-sm"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />Mostrar também anúncios fora dos filtros, experientes, incompatíveis ou expirados</label>}
    {rows?.filter(row => showAll || (row.discovery_pass && row.eligibility.status !== "ineligible" && row.liveness.result !== "expired" && !["experienced", "conflicting"].includes(row.seniority.level))).map((row, index) => <article key={`${row.url}-${index}`} className="rounded-xl border border-border p-4 space-y-2">
      <h2 className="font-medium"><a href={/^https?:\/\//i.test(row.url) ? row.url : undefined} target="_blank" rel="noreferrer" className="text-brand underline">{row.title}</a> · {row.company}</h2>
      <p className="text-sm">{row.location || "Localização por confirmar"} · {levels[row.seniority.level] || "Por confirmar"} · {live[row.liveness.result] || "Por verificar"}</p>
      <p className="text-sm">{row.eligibility.status === "eligible" ? "Compatibilidade com Portugal preliminar" : row.eligibility.status === "ineligible" ? "Restrição incompatível" : "Elegibilidade por confirmar"}{row.eligibility.evidence ? `: ${row.eligibility.evidence}` : ""}</p>
      {row.seniority.requirements.map((item, i) => <p key={i} className="text-xs text-muted">Requisito publicado: {item.evidence}</p>)}
      {row.liveness.checked_at && <p className="text-xs text-muted">Última consulta: {new Date(row.liveness.checked_at).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" })}</p>}
      {row.geography.matched_places.length > 0 && <p className="text-xs">Localidades preferidas: {row.geography.matched_places.join(", ")}. Deslocação por confirmar.</p>}
      {!!row.geography.routes?.length && <details className="text-sm"><summary>Comparar deslocações por carro ou transportes</summary><p className="text-xs text-muted">Referências entre cidades; confirmar a morada do escritório. Os mapas apresentam os percursos disponíveis no momento.</p>{row.geography.routes.map(route => <p key={`${route.origin}-${route.destination}`}>{route.origin} → {route.destination}: <a href={route.driving_url} target="_blank" rel="noreferrer" className="underline">Carro</a> · <a href={route.transit_url} target="_blank" rel="noreferrer" className="underline">Transportes</a></p>)}</details>}
      <label className="block text-sm">Motivo da decisão<input aria-label={`Motivo: ${row.title}`} maxLength={1000} value={reasons[row.url] ?? feedback[row.url]?.reason ?? ""} onChange={e => setReasons(old => ({ ...old, [row.url]: e.target.value }))} className="ml-2 rounded border border-border bg-surface p-2" /></label>
      <div className="flex flex-wrap gap-2">{Object.entries(decisions).map(([key, label]) => <button key={key} disabled={!!busy} onClick={() => save(row, key)} className="rounded border border-border px-3 py-2 text-sm disabled:opacity-50">{label}</button>)}</div>
      {feedback[row.url] && <p role="status" className="text-sm text-brand">Guardado: {decisions[feedback[row.url].decision]}{feedback[row.url].reason ? ` — ${feedback[row.url].reason}` : ""}</p>}
    </article>)}
    <p className="text-xs text-muted">As decisões ficam no histórico local. Não alteram automaticamente o perfil, os filtros ou o estado de uma candidatura.</p>
  </div>;
}
