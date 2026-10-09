# Modo: oferta -- Avaliação Completa A-F

Quando o candidato cola uma vaga (texto ou URL), entregar SEMPRE os 6 blocos:

## Passo 0 -- Detecção de Arquétipo

Classificar a vaga num dos 6 arquétipos (ver `_shared.md`). Se for híbrido, indicar os 2 mais próximos. Isto determina:
- Quais proof points priorizar no bloco B
- Como reescrever o summary no bloco E
- Quais histórias STAR preparar no bloco F

## Bloco A -- Resumo da Vaga

Tabela com:
- Arquétipo detectado
- Domínio (platform/agentic/LLMOps/ML/enterprise)
- Função (build/consult/manage/deploy)
- Senioridade
- Remoto (full/híbrido/presencial)
- Dimensão da equipa (se mencionada)
- TL;DR numa frase

## Bloco B -- Match com o Currículo

Ler `cv.md`. Criar tabela com cada requisito do JD mapeado para linhas exatas do currículo.

**Adaptado ao arquétipo (consultar `modes/_profile.md`):**
- Ler SEMPRE os arquétipos e proof points do candidato em `modes/_profile.md` (Junior Full-Stack, Cloud/DevOps, Backend, AI/ML, Mobile Flutter, Data Engineer).
- Se Full-Stack / Frontend / Web → priorizar React, Next.js, TypeScript e projetos do portfólio.
- Se Cloud / DevOps → priorizar Azure (Functions, CosmosDB, Bicep, App Service), Docker e CI/CD do Oportunia.
- Se Backend → priorizar APIs REST, Flask/Python, Node.js e agregação de dados.
- Se AI / ML → priorizar Azure OpenAI GPT-4o, análise semântica e algoritmos de compatibilidade do Oportunia.
- Se Mobile → priorizar arquitetura offline-first em Flutter/Firebase, geofencing e Haversine do VisitAR.
- Se Data Engineering / Analytics → priorizar CosmosDB, MongoDB, Neo4j (Cypher) e bases de dados relacionais.

Secção de **gaps** com estratégia de mitigação para cada um. Para cada gap:
1. É um hard blocker ou um nice-to-have?
2. O candidato consegue demonstrar experiência adjacente?
3. Existe um projeto do portfolio que cubra esse gap?
4. Plano de mitigação concreto (frase para carta de apresentação, projeto rápido, etc.)

## Bloco C -- Nível e Estratégia

1. **Nível detectado** no JD vs **nível natural do candidato para esse arquétipo**
2. **Plano de Posicionamento ("Projetos Reais vs Apenas Teoria")**: frases específicas adaptadas ao arquétipo, conquistas concretas a destacar dos projetos do `cv.md` (VisitAR, Oportunia, Portfólio), como posicionar funções de liderança técnica (Tech Lead) e rigor de engenharia como diferencial de entrada.
3. **Plano de Enquadramento**: avaliar se a vaga é estágio profissional (ex: IEFP nível 6), posição júnior ou mid-level. Se a vaga pedir 1-2 anos de experiência, mostrar como os projetos práticos end-to-end e papel de Tech Lead cobrem essa lacuna.

## Bloco D -- Remuneração e Demanda

Usar WebSearch para:
- Salários atuais da vaga (Glassdoor PT, Teamlyzer, Levels.fyi, Blind)
- Reputação de remuneração da empresa
- Tendência de procura da vaga

Tabela com dados e fontes citadas. Se não houver dados, dizer isso em vez de inventar.

**Mercado Português -- Checks obrigatórios:**
- Contrato Sem Termo ou B2B / Recibos Verdes? Se Contrato Sem Termo: considerar Subsídio de Férias e de Natal (14 meses), Segurança Social, seguro de saúde, Subsídio de Alimentação na comparação.
- Se B2B / Recibos Verdes: qual o valor mensal? Calcular o equivalente a Contrato Sem Termo.
- Prémio Anual / Bónus mencionado? Quantos salários extra?
- Stock options / VSOP? Avaliar vesting, cliff e liquidez.
- Subsídio de Alimentação / Cartão Refeição? Valor diário/mensal? Isento em cartão ou pago em dinheiro?
- Seguro de saúde? Com copagamento ou cobertura total?

## Bloco E -- Plano de Personalização

| # | Secção | Estado atual | Mudança proposta | Por que |
|---|-------|-------------|------------------|---------|
| 1 | Summary | ... | ... | ... |
| ... | ... | ... | ... | ... |

Top 5 mudanças no currículo + Top 5 mudanças no LinkedIn para maximizar o match.

## Bloco F -- Plano de Entrevistas

6-10 histórias STAR+R mapeadas para requisitos do JD (STAR + **Reflection**):

| # | Requisito do JD | História STAR+R | S | T | A | R | Reflection |
|---|----------------|-----------------|---|---|---|---|------------|

A coluna **Reflection** captura o que foi aprendido ou o que seria feito de forma diferente. Isto sinaliza senioridade — candidatos juniores descrevem o que aconteceu, candidatos seniores extraem lições.

**Story Bank:** Se `interview-prep/story-bank.md` existir, verificar se alguma dessas histórias já está lá. Se não, adicionar as novas. Com o tempo, isso constrói um banco reutilizável de 5-10 histórias-mestre que podem ser adaptadas para qualquer pergunta de entrevista.

**Selecionadas e enquadradas conforme o arquétipo (ver `modes/_profile.md`):**
- Full-Stack / Web → enfatizar qualidade de código, tipagem robusta (TypeScript) e design clean.
- Cloud / DevOps → enfatizar automação de infraestrutura como código (IaC / Bicep), pipelines CI/CD e serverless.
- Backend → enfatizar escalabilidade de APIs, agregação de fontes de dados e persistência.
- AI / ML → enfatizar integração prática de LLMs (Azure OpenAI GPT-4o), engenharia de prompts e matching semântico.
- Mobile → enfatizar resiliência offline-first, otimização de geolocalização e gestão de mudança de âmbito.
- Liderança / Teamwork → enfatizar o papel de Tech Lead no Oportunia: coordenação de equipa de 3, desbloqueio de tarefas e cumprimento de prazos.

Incluir também:
- 1 case study recomendado (VisitAR ou Oportunia conforme o foco da vaga).
- Perguntas desafiantes / red-flag e como respondê-las (ex: "Qual foi o maior desafio técnico no VisitAR?", "Como geriste conflitos ou prazos na equipa do Oportunia?", "Como aprendes rapidamente uma stack nova?").

---

## Pós-avaliação

**SEMPRE** após gerar os blocos A-F:

### 1. Salvar report .md

Salvar avaliação completa em `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = próximo número sequencial (3 dígitos, zero-padded). Para alocar de forma atômica e evitar condições de corrida, tu DEVE executar `node reserve-report-num.mjs` para reservar o número (a saída retornará `{###}`), escrever o relatório, e em seguida executar `node reserve-report-num.mjs --release {###}` para liberar o sentinel.
- `{company-slug}` = nome da empresa em lowercase, sem espaços (usar hifens)
- `{YYYY-MM-DD}` = data atual

**Formato do report:**

```markdown
# Avaliação: {Empresa} -- {Vaga}

**Data:** {YYYY-MM-DD}
**Arquétipo:** {detectado}
**Score:** {X/5}
**URL:** {URL da vaga}
**PDF:** {caminho ou pendente}

---

## A) Resumo da Vaga
(conteúdo completo do bloco A)

## B) Match com o Currículo
(conteúdo completo do bloco B)

## C) Nível e Estratégia
(conteúdo completo do bloco C)

## D) Remuneração e Demanda
(conteúdo completo do bloco D)

## E) Plano de Personalização
(conteúdo completo do bloco E)

## F) Plano de Entrevistas
(conteúdo completo do bloco F)

## G) Rascunhos de Respostas para Candidatura
(apenas se score >= 4.5 -- rascunhos de respostas para o formulário de candidatura)

---

## Keywords extraídas
(lista de 15-20 keywords do JD para otimização ATS)
```

### 2. Registrar no tracker

**SEMPRE** registrar em `data/applications.md`:
- Próximo número sequencial
- Data atual
- Empresa
- Vaga
- Score: média do match (1-5)
- Status: `Evaluated`
- PDF: ❌ (ou ✅ se a auto-pipeline gerou PDF)
- Report: link relativo ao report .md (ex: `[001](reports/001-company-2026-01-01.md)`)

**Formato do tracker:**

```markdown
| # | Data | Empresa | Vaga | Score | Status | PDF | Report |
```
