# Modo: oferta — avaliação para Portugal

Este modo **estende integralmente `modes/oferta.md`**, que deve ser lido e executado como contrato canónico. Ler também `modes/_shared.md` e `modes/pt/_shared.md`, depois as fontes e preferências do candidato. Os avaliadores CLI combinam estes ficheiros automaticamente.

## Contrato obrigatório de saída

Manter todos os blocos A–H, os gates de agência/blacklist/liveness, a reserva atómica do número, os limites de pesquisa, a análise de requisitos e o registo TSV definidos no modo canónico. Não reutilizar um perfil de exemplo nem pressupor senioridade, projetos ou formação.

Todos os relatórios incluem:

- Cabeçalho com `**URL:**`, `**Legitimacy:**` e o mesmo score usado no tracker.
- `## Machine Summary`, com YAML e os campos/enums exatos de `batch/batch-prompt.md`; `advertised_comp` literal ou `null`, `risk_summary`, `requirement_importance`, `score_evidence` e `confidence_gaps`.
- `## Risk Summary` e `## Score Evidence`, com evidência/limitações coerentes com a análise.
- `## Job Description (archived verbatim)`, com o texto integral original ou o apontador canónico para captura numerada em `jds/` definido em `modes/oferta.md`. Não traduzir nem resumir o arquivo.
- Respostas de candidatura no Bloco H; o Bloco G mantém exclusivamente a avaliação de legitimidade.

Traduzir a prosa conforme `language.output`, preservando estes cabeçalhos de máquina. As adições ao tracker seguem AGENTS.md, com cabeçalho TSV, `url` e estados canónicos. Executar os verificadores do fluxo canónico; uma avaliação PT tem os mesmos requisitos de integridade.

Os leitores continuam a aceitar o cabeçalho legado português abaixo; preservar o esquema de trackers existentes. Novas adições usam o TSV canónico de AGENTS.md, incluindo `url`.

| # | Data | Empresa | Vaga | Score | Status | PDF | Report |
|---|------|---------|------|-------|--------|-----|--------|

## Bloco D — comparação portuguesa

Aplicar as regras e condições de `modes/pt/_shared.md`. Perguntar ao recrutador apenas o que estiver por esclarecer:

1. Qual a base mensal e anual bruta, e os subsídios estão incluídos no anual? São pagos separadamente ou em duodécimos?
2. Qual o tipo/duração do contrato e a entidade empregadora? Existe IRCT aplicável?
3. Qual o valor diário e modalidade do subsídio de alimentação, e em que dias é devido?
4. Existem ajudas de custo, reembolsos, bónus ou parcelas condicionais? Quais os pressupostos e a base garantida?
5. Em B2B, qual a tarifa sem IVA, dias faturáveis, prazo de pagamento, despesas e condições de cessação?

Apresentar componentes em separado: base anual, alimentação por dias elegíveis, variáveis, benefícios e reembolsos. Não somar IVA à remuneração, não duplicar os subsídios e não apresentar um líquido sem pressupostos fiscais completos. Em comparação B2B/trabalho dependente, mostrar receita e custos anuais para o mesmo horizonte, com riscos identificados; não impor uma percentagem universal de paridade.

## Bloco G — sinais portugueses

Examinar contrato a termo/sem termo, eventual prestação subordinada apresentada como B2B, composição remuneratória, período experimental, elegibilidade de estágios e licenciamento ETT quando aplicável. Distinguir um sinal observado de uma conclusão jurídica; consultar fontes oficiais atuais antes de afirmar um incumprimento.

Não penalizar automaticamente consultoras, PME, ausência de seguro de saúde ou estágios. Uma medida IEFP deve ser comparada com os objetivos reais do candidato e o regulamento concreto. Se a relação com agência estiver por confirmar, parar antes de persistir artefactos conforme o gate canónico.

## Block F — Interview Plan

Aplicar o plano de entrevistas canónico, com histórias do candidato e proveniência verificada. Não exigir um número de histórias que obrigue a inventar experiências; explicitar lacunas sem fabricar realizações.

## Keywords extracted
(15-20 keywords da JD, mantendo este cabeçalho estrutural para o verificador ATS.)
