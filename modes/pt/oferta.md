# Modo: oferta -- Avaliação Completa A-F

Quando o candidato cola uma oferta de emprego (texto ou URL), entregar SEMPRE os 6 blocos:

## Passo 0 -- Detecção de Arquétipo

Classificar a oferta num dos 6 arquétipos (ver `_shared.md`). Se for híbrido, indicar os 2 mais próximos. Isto determina:
- Quais proof points priorizar no bloco B
- Como reescrever o summary no bloco E
- Quais histórias STAR preparar no bloco F

## Bloco A -- Resumo da Oferta de Emprego

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
3. **Plano de Enquadramento**: avaliar se a oferta é estágio profissional (ex: IEFP nível 6), posição júnior ou mid-level. Se a oferta pedir 1-2 anos de experiência, mostrar como os projetos práticos end-to-end e papel de Tech Lead cobrem essa lacuna.

## Bloco D -- Remuneração e Procura de Mercado

Aplica integralmente as **Regras Salariais Portugal (PT-PT)**: vencimento a 14 meses, Subsídio de Alimentação, Ajudas de Custo, Seguro de Saúde, B2B vs Contrato Sem Termo.

Usar WebSearch (orçamento estrito de até 5 queries combinadas com o Bloco G) para:
- Salários atuais da função no mercado português (Teamlyzer, Glassdoor PT, Hays Guia Salarial Portugal, Levels.fyi)
- Reputação de remuneração e estabilidade da empresa
- Tendência de procura da função

Antes de interpretar qualquer valor salarial, classifica a tipologia da empresa empregadora:

**Classificação da Empresa e Fiabilidade Salarial (obrigatório):**

| Tipologia de Empresa | Fiabilidade Salarial Típica | Sinais de Reconhecimento |
|---|---|---|
| Hub Tecnológico Multinacional em Portugal (Lisboa/Porto) | Alta a Média | Centro de engenharia próprio (ex: Cloudflare, Revolut, Datadog), bandas salariais estruturadas sob lei laboral PT |
| Big Tech / Multinacional de Produto | Alta a Média | Empresa de produto internacional cotada ou de grande dimensão, processos repetíveis |
| Scale-up / Startup com Financiamento VC | Média | Startup com capital de risco, pacotes competitivos que podem conjugar base + bónus + stock options |
| Empresa Tradicional / Grande Empresa Nacional | Média | Banca, seguradoras, telecomunicações; processos formais de RH, base estável, bónus discricionário |
| Consultora / Outsourcing Nacional (PT) | Média a Baixa | Alocação a clientes externos, pressão de faturação/taxa de ocupação; forte dependência de "ajudas de custo" para simular líquido alto |
| PME Nacional / Empresa de Serviços Local | Baixa | Pequena dimensão, função abrangente, RH informal, ausência de bandas públicas |
| Empresa de Trabalho Temporário (ETT) / Staffing | Baixa a Média | Terceirização de mão de obra; verificar obrigatoriamente licenciamento no IEFP |
| Setor Público / Ensino / Instituto de Investigação | Média a Alta | Tabelas salariais e carreiras públicas tabeladas (Tabela Remuneratória Única - TRU); progressão por escalões |

Se o tipo de empresa for incerto, marcar como `Unknown` e atribuir fiabilidade `Low` por defeito.

**Decomposição de Componentes Salariais (quando existir valor anunciado):**

Primeira linha da tabela sempre com o valor textual anunciado no JD (ou "não indicado"):
```markdown
| Anunciado (JD) | {valor exato ou "não indicado"} | JD |
```

Decompor em:
- **Salário Base Garantido:** valor fixo bruto mensal a constar do contrato de trabalho (pago a 14 meses no regime Sem Termo).
- **Subsídio de Alimentação:** valor diário x ~22 dias úteis/mês (isento de IRS/SS até ao limite legal quando pago em cartão de refeição).
- **Ajudas de Custo / Deslocações:** parcelas isentas de IRS/SS (se mencionadas, isolar e alertar expressamente).
- **Prémio / Bónus Variável:** valor dependente de desempenho ou objetivos.
- **Benefícios Não Monetários:** seguro de saúde (com/sem copagamento e extensão ao agregado), formação, equipamento, dias extra de férias.

**Perguntas de Verificação de RH Obrigatórias (adaptadas a Portugal):**
Incluir 3 a 5 questões concretas para o candidato colocar na entrevista de screening:
1. "Qual é o salário base fixo mensal escrito no contrato de trabalho (a 14 meses)?"
2. "O Subsídio de Alimentação está incluído no pacote anunciado ou é pago em separado? Qual é o valor diário e a modalidade (dinheiro ou cartão refeição)?"
3. "A proposta inclui qualquer parcela em ajudas de custo, subsídio de transporte ou despesas não sujeitas a retenção na fonte?"
4. "Qual é a duração do período experimental previsto para a função e que acompanhamento é feito?"
5. "A empresa disponibiliza seguro de saúde desde o primeiro dia? Abrange consultas, estomatologia ou o agregado familiar?"

**Comparação Estruturada B2B vs. Contrato Sem Termo (obrigatória quando ambos os regimes são possíveis):**

| Componente | B2B (Trabalhador Independente / Recibos Verdes) | Contrato Sem Termo (Efetivo) |
|---|---|---|
| Valor Mensal Bruto | {valor faturado mensal} | {salário base contratual} |
| 14 Meses (Subsídios de Férias e Natal) | ❌ Inexistente (apenas o faturado) | ✅ +2 salários base completos por ano |
| Subsídio de Alimentação | A suportar pelo próprio | Geralmente €6 a €10+/dia útil (~€130-220/mês líquidos) |
| Segurança Social | 21,4% sobre 70% da faturação (após 1.º ano de isenção) | 11% retido na fonte (entidade patronal paga TSU 23,75%) |
| IRS | Regime Simplificado (coeficiente 0,75 tributável) | Retenção mensal na fonte por escalão |
| Seguro de Acidentes de Trabalho | Obrigatório a cargo do próprio (~€15-30/mês) | Obrigatório a cargo da entidade patronal |
| Despesas de Gestão / Contabilidade | ~€40-80/mês se recorrer a contabilista | €0 |
| Férias Pagas | ❌ 0 dias (dias não trabalhados = não faturados) | ✅ 22 dias úteis remunerados |
| **Equivalente Anual Real** | **{Faturação mensal x meses faturados}** | **{Salário base x 14 + Subsídio Alimentação x 11 + Benefícios}** |

> Regra de paridade PT: uma tarifa mensal B2B deve ser **pelo menos 35% a 50% superior** ao salário base de um Contrato Sem Termo para compensar a ausência de 14 meses, férias remuneradas, proteção no desemprego e encargos autónomos.

**Regime IRS Jovem (art. 12.º-B do CIRS):**
Se o candidato for elegível (< 35 anos, nos primeiros anos de trabalho após conclusão do ciclo de estudos):
> ℹ️ **IRS Jovem:** O candidato pode beneficiar da isenção parcial de IRS aplicável aos primeiros anos de rendimentos de trabalho dependente (categoria A). Simular o salário líquido considerando esta bonificação fiscal, que eleva substantivamente o rendimento líquido disponível nos escalões de entrada.

## Bloco E -- Plano de Personalização

| # | Secção | Estado atual | Mudança proposta | Porquê |
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
- 1 case study recomendado (VisitAR ou Oportunia conforme o foco da oferta).
- Perguntas desafiantes / red-flag e como respondê-las (ex: "Qual foi o maior desafio técnico no VisitAR?", "Como geriste conflitos ou prazos na equipa do Oportunia?", "Como aprendes rapidamente uma stack nova?").

## Bloco G -- Legitimidade da Oferta e Conformidade Laboral (Portugal)

Avaliar a oferta relativamente a sinais de autenticidade e conformidade com a legislação portuguesa:

### Sinais a examinar:

1. **Frescura da Oferta:** data de publicação, estado do botão de candidatura, indícios de repost repetido em `data/scan-history.tsv`.
2. **Qualidade da Descrição:** especificidade da stack técnica, realismo dos requisitos vs senioridade, rácio de texto substantivo vs chavões genéricos.
3. **Estabilidade da Empresa / Layoffs:** pesquisa rápida de notícias sobre despedimentos coletivos ou congelamento de contratações no ano corrente.
4. **Licenciamento de Empresas de Trabalho Temporário (IEFP):** Se a oferta provier de uma agência de trabalho temporário ou colocação de pessoal, verificar `templates/agency-licensing.yml`. Informar que em Portugal as ETT carecem de autorização prévia obrigatória do IEFP (Lei n.º 19/2007 e DL n.º 260/2009) e disponibilizar a ligação ao registo oficial do IEFP (`https://www.iefp.pt/empresas-de-trabalho-temporario`).
5. **Conteúdo Proibido / Não Discriminação:** Verificar `templates/jurisdiction-prohibited-content.yml`. O art. 24.º do Código do Trabalho proíbe anúncios discriminatórios por idade ("até 35 anos"), estado civil, ausência de filhos ou encargos familiares, gravidez, etnia ou religião. Assinalar factualmente qualquer exigência restritiva encontrada.
6. **Exigência Indevida de Cidadania / Nacionalidade:** Verificar `templates/immigration-status-requirements.yml`. No setor privado em Portugal, exigir "cidadania portuguesa obrigatória" constitui discriminação ilícita por nacionalidade (art. 24.º CT e Reg. UE 492/2011). Perguntas sobre autorização legal de residência/trabalho são legítimas e legais.
7. **Triagem por IA e Decisões Automatizadas:** Verificar `templates/jurisdiction-ai-screening-disclosure.yml`. Ao abrigo do art. 22.º do RGPD e orientações da CNPD, candidatos sujeitos a avaliação automatizada com efeitos relevantes têm direito a informação prévia sobre a lógica do tratamento e direito a intervenção humana.
8. **Ajudas de Custo como Parcela Salarial:** Se a JD referir ajudas de custo, kms ou deslocações como atrativo remuneratório regular, emitir o alerta sobre a perda de direitos sociais (baixas, pensão, subsídios de férias e Natal).
9. **Consultora sem Revelação de Cliente:** Se for intermediário sem identificação do cliente final ("o nosso cliente"), classificar tipo como consultora, fiabilidade `Low` e recomendar apurar a entidade de colocação antes de testes técnicos exaustivos.
10. **Estágio Profissional IEFP Disfarçado:** Se referir estágio profissional ou medida ATIVAR.PT, explicitar o valor tabelado por lei (fixado no IAS) e questionar a perspetiva de conversão em Contrato Sem Termo.
11. **Limites do Período Experimental:** Se estipular período experimental superior aos limites imperativos do art. 112.º do Código do Trabalho (máx. 90 dias geral; 180 dias primeiro emprego / elevada complexidade; 240 dias quadros superiores), assinalar a nulidade do excesso temporal.

---

## Pós-avaliação

**SEMPRE** após gerar os blocos A-G:

### 1. Guardar relatório .md

Gravar avaliação completa em `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = próximo número sequencial (3 dígitos, zero-padded). Reservar atomicamente via `node reserve-report-num.mjs`, escrever o relatório, e libertar o sentinel via `node reserve-report-num.mjs --release {###}`.
- `{company-slug}` = nome da empresa em minúsculas, com hífen em vez de espaços.
- `{YYYY-MM-DD}` = data atual.

**Formato do report:**

```markdown
# Avaliação: {Empresa} -- {Cargo/Função}

**Data:** {YYYY-MM-DD}
**Arquétipo:** {detectado}
**Score:** {X/5}
**URL:** {URL da oferta}
**PDF:** {caminho ou pendente}

---

## A) Resumo da Oferta
(conteúdo completo do bloco A)

## B) Match com o Currículo
(conteúdo completo do bloco B)

## C) Nível e Estratégia
(conteúdo completo do bloco C)

## D) Remuneração e Procura de Mercado
(conteúdo completo do bloco D, incluindo decomposição e comparação B2B vs CST)

## E) Plano de Personalização
(conteúdo completo do bloco E)

## F) Plano de Entrevistas
(conteúdo completo do bloco F)

## G) Legitimidade e Conformidade Laboral (Portugal)
(conteúdo completo do bloco G com sinais observados)

## H) Rascunhos de Respostas para Candidatura
(apenas se score >= 4.5 -- rascunhos de respostas estruturadas para o formulário de candidatura)

---

## Keywords extraídas
(lista de 15-20 keywords do JD para otimização ATS)
```

### 2. Registar no tracker

Registar no tracker através do canal canónico TSV em `batch/tracker-additions/` e executar `node merge-tracker.mjs`.

Formato da linha no ficheiro TSV:
- Header com nomes das colunas: `#\tData\tEmpresa\tVaga\tScore\tStatus\tPDF\tReport`
- Linha de dados: `{###}\t{YYYY-MM-DD}\t{Empresa}\t{Vaga}\t{Score}\tEvaluated\t—\t[{###}](reports/{filename})`
