# Modo: pipeline -- Inbox de URLs (Second Brain)

Processa URLs de ofertas acumuladas em `data/pipeline.md`. O candidato adiciona URLs quando desejar e depois executa `/career-ops pipeline` para processar todas em lote.

## Workflow

1. **Ler** `data/pipeline.md` → procurar itens `- [ ]` na secção "Pendentes" (ou "Pending")
2. **Para cada URL pendente**:
   a. Reservar o próximo `REPORT_NUM` sequencial de forma atómica executando `node reserve-report-num.mjs` (e libertar o sentinel executando `node reserve-report-num.mjs --release <num>` após a gravação do relatório)
   b. **Extrair JD** usando Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch
   c. Se o URL não for acessível → marcar como `- [!]` com nota e continuar
   d. **Executar auto-pipeline completa**: Avaliação A-F → Report .md → PDF (se score >= 3.0) → Tracker
   e. **Mover de "Pendentes" para "Processadas"**: `- [x] #NNN | URL | Empresa | Vaga | Score/5 | PDF ✅/❌`
3. **Se houver 3+ URLs pendentes**, lançar agentes em paralelo apenas para etapas sem Playwright (ex.: organização, WebSearch/WebFetch).
   Se a extração exigir Playwright, processar serialmente (1 vaga por vez) para evitar conflito de sessão.
4. **Ao terminar**, mostrar tabela resumo:

```
| # | Empresa | Vaga | Score | PDF | Ação recomendada |
```

## Formato de pipeline.md

```markdown
## Pendentes
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — Erro: login necessário

## Processadas
- [x] #143 | https://jobs.example.com/posting/789 | Acme Corp | AI PM | 4.2/5 | PDF ✅
- [x] #144 | https://boards.greenhouse.io/xyz/jobs/012 | BigCo | SA | 2.1/5 | PDF ❌
```

> Nota: Os títulos das secções podem estar em EN ("Pending"/"Processed"), ES ("Pendientes"/"Procesadas"), DE ("Offen"/"Verarbeitet") ou PT-PT ("Pendentes"/"Processadas"). Ao ler, ser flexível; ao escrever, manter o estilo do ficheiro existente.

## Detecção inteligente de JD a partir do URL

1. **Playwright (preferido):** `browser_navigate` + `browser_snapshot`. Funciona com todas as SPAs.
   - **Opcional — extrator CLI (`scan.extractor: cli` em `config/profile.yml`):** executa `node browser-extract.mjs <url>` (`--mode jd`) em vez disso — `{ "url", "title", "text" }` compacto, menos tokens (depende do portal). **Recorre em silêncio** a `browser_navigate` + `browser_snapshot` em caso de erro ou ausência.
2. **WebFetch (fallback):** Para páginas estáticas ou quando Playwright não está disponível.
3. **WebSearch (último recurso):** Buscar em portais secundários que indexam o JD.

**Casos especiais:**
- **LinkedIn**: Pode exigir login → marcar com `[!]` e pedir ao candidato para colar o texto
- **PDF**: Se o URL aponta para um PDF, ler diretamente com o Read tool
- **`local:` prefix**: Ler ficheiro local. Exemplo: `local:jds/linkedin-pm-ai.md` → ler `jds/linkedin-pm-ai.md`
- **LinkedIn / Greenhouse / Lever**: Plataformas comuns no Portugal. Playwright funciona bem com todas
- **ITJobs / NetEmpregos / Teamlyzer**: Portais portugueses, geralmente acessíveis via WebFetch
- **LinkedIn**: Mesmas restrições do LinkedIn global — pode exigir login

## Numeração automática

1. Executar `node reserve-report-num.mjs` para reservar o próximo número sequencial de forma atômica (a saída retornará `{###}`).
2. Gravar o ficheiro de relatório usando esse número.
3. Liberar o sentinel executando `node reserve-report-num.mjs --release {###}` após a gravação do relatório.

## Sincronização de fontes

Antes de processar qualquer URL, verificar sincronização:

```bash
node cv-sync-check.mjs
```

Se houver dessincronização, avisar o candidato antes de continuar.
