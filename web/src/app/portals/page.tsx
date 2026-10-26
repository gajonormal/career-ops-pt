import { Radar } from "lucide-react";
import { PortalsView } from "@/components/portals-view";
import { PortalHealthPanel } from "@/components/portal-health-panel";

export const dynamic = "force-dynamic";

export default function PortalsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center gap-3">
        <Radar className="size-6 text-brand" />
        <h1 className="font-display text-2xl tracking-tight text-landing">Portais</h1>
      </div>
      <p className="mt-1.5 max-w-xl text-sm text-muted">
        Fontes configuradas para descobrir novas ofertas. Verifica a disponibilidade dos portais e distingue
        integrações automáticas de fontes que precisam de pesquisa assistida.
      </p>
      <p className="mt-1.5 text-xs text-faint">
        Configuração em <code className="text-muted">portals.yml</code> — podes editá-la ou pedir ajuda ao assistente.
      </p>
      <div className="mt-6">
        <PortalHealthPanel />
        <PortalsView />
      </div>
    </div>
  );
}
