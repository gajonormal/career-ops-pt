import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { careerOpsRoot } from "@/lib/career-ops";
import { portalHealthSummary } from "@/lib/portal-health-summary.mjs";

export function PortalHealthPanel() {
  try {
    const root = careerOpsRoot();
    const file = path.join(root, "data", "portal-health.tsv");
    const config = yaml.load(fs.readFileSync(path.join(root, "portals.yml"), "utf8"));
    const rows = portalHealthSummary(config, fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "");
    const checked = rows.filter(row => row.last_checked);
    const labels: Record<string, string> = { reachable: "Respondeu", empty: "Sem ofertas", unverified: "Sem consulta registada", auth: "Acesso recusado", network: "Falha de rede", slug_gone: "Endereço indisponível", server: "Erro do servidor", unknown: "Erro por classificar", unverified_zero: "Resultado vazio não confirmado" };
    return <section className="mt-6 rounded-xl border border-border p-4"><h2 className="font-medium">Saúde e cobertura das fontes</h2><p className="mt-2 text-sm">{rows.length} fontes ativas · {checked.length} com consulta registada · {rows.filter(row => row.mode === "assistida").length} assistidas</p><p className="mt-2 text-xs text-muted">Histórico local; não é uma consulta em tempo real. Responder não comprova vagas adequadas. Fontes sem registo não são apresentadas como saudáveis.</p><details className="mt-3"><summary>Consultar histórico por fonte</summary><ul className="mt-2 space-y-2 text-sm">{rows.map((row, index) => <li key={`${row.name}-${index}`}>{row.name} · {row.mode} · {labels[row.status] || "Estado desconhecido"}{row.last_checked ? ` · ${new Date(row.last_checked).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" })}` : ""}{row.consecutive_failures ? ` · ${row.consecutive_failures} falhas consecutivas` : ""}</li>)}</ul></details></section>;
  } catch { return <p role="alert" className="mt-4 text-sm">Não foi possível ler a configuração ou o histórico das fontes.</p>; }
}
