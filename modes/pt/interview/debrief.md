# Mode: interview/debrief — Debrief pós-entrevista

Após uma entrevista real, regista o que foi perguntado, avalia o que funcionou e o que não funcionou, fecha lacunas antes da próxima ronda e atualiza a question bank.

---

## When to Run This Skill

- Imediatamente após uma entrevista real (enquanto a memória está fresca)
- Após uma chamada com o recrutador que trouxe novas informações sobre o processo
- Quando o candidato descobre o formato da próxima ronda e o entrevistador

---

## Inputs

1. **Debrief do candidato** — quais perguntas foram feitas, como ele respondeu, o que pareceu forte ou fraco
2. **Nome e cargo do entrevistador** — orienta a previsão da próxima ronda
3. **Resultado da ronda** (se souberes) — avançou / rejeitado / pendente
4. **Detalhes da próxima ronda** (se souberes) — formato, entrevistadores, prazos
5. **Question bank** em `interview-prep/question-bank.md` — atualiza com dados reais
6. **Story bank** em `interview-prep/story-bank.md` — adiciona novas histórias se surgirem
7. **CV** em `cv.md` + `article-digest.md` (se existir) — para ancorar respostas sugeridas em experiência real
8. **Alegações retiradas** em `interview-prep/retracted-claims.md` (se existir) — barreira rígida; nunca uses uma alegação retirada numa resposta sugerida, mesmo que o candidato a tenha dito na entrevista
9. **Ficheiro de preparação específico da oportunidade** — acrescenta as notas do debrief

---

## Step 1 — Capture What Was Asked

Pede ao candidato que liste todas as perguntas de que se lembra, por ordem se possível. Não sugiras opções — deixa-o recordar livremente primeiro.

Para cada pergunta registada:
- O que disse?
- Como o entrevistador reagiu (sinal positivo, neutro, contestou, seguiu adiante rapidamente)?
- Sentiu-se confiante ou inseguro?

Se a memória estiver incompleta, faz perguntas direcionadas:
- "Houve alguma pergunta que te apanhou de surpresa?"
- "Houve algo que tu gostarias de ter respondido de forma diferente?"
- "O entrevistador fez alguma pergunta de seguimento ou aprofundamento — isso normalmente significa que queria mais detalhes?"

---

## Step 2 — Honest Assessment Per Question

Para cada pergunta, produz:

```markdown
**Q: [pergunta]**
- What was said: [resumo da resposta dele]
- What landed: [o que foi bom — sê específico]
- What was missing: [lacuna — termo técnico preciso, resultado ausente, sem reflection, etc.]
- Correct/complete answer: [o que a resposta completa deveria incluir]
- Status: ✅ Strong / 🟡 Solid / 🔴 Gap
```

Sê direto. Se o candidato errou o conceito central que a pergunta testava, diz isso. Se uma resposta foi genuinamente forte, diz isso também. O debrief é o momento de aprendizagem mais valioso — a imprecisão desperdiça-o.

---

## Step 3 — Update Question Bank

Para cada pergunta do debrief, atualiza `interview-prep/question-bank.md`:
- Altera o estado para ✅ / 🟡 / 🔴 com base no desempenho real
- Acrescenta notas de lacuna a partir do debrief
- Acrescenta quaisquer novas perguntas que apareceram e ainda não estavam na bank

Se a question bank não existir, cria-a usando as perguntas desta entrevista como base.

---

## Step 4 — Close the Gaps

Para cada lacuna 🔴 identificada:

1. **Explica a resposta correta** — clara, concisa, com um exemplo resolvido (código, cálculo, diagrama) onde ajudar
2. **Conecta a uma história real** se possível — "na verdade tens isto na tua [história existente da story bank] — vê como usá-la"
3. **Acrescenta ao ficheiro de preparação da oportunidade** sob uma secção "Gaps to Close Before Round N"
4. **Acrescenta a `interview-prep/interview-prep-guide.md`** (se o candidato mantiver um) quando for um princípio reutilizável que se aplica além desta oportunidade

---

## Step 5 — Extract New Stories

Às vezes uma entrevista real revela uma história que o candidato não havia preparado. Se o candidato descreveu uma experiência que não havia formalizado:

> "Mencionaste [X] na tua resposta — parece que isso se poderia transformar numa história STAR+R completa. Queres estruturá-la agora enquanto está fresca?"

Se sim, monta-a como uma história STAR+R (Situation, Task, Action, Result, Reflection) e acrescenta-a a `interview-prep/story-bank.md`.

---

## Step 6 — Next Round Intelligence

Se o candidato sabe o formato da próxima ronda:

1. **Prevê perguntas prováveis** com base em:
   - Cargo do próximo entrevistador (ex.: especialista sénior → profundidade na competência central, design; par multifuncional → colaboração, fronteiras de domínio; executivo → estratégia, impacto no negócio)
   - O que foi coberto nesta ronda (a próxima ronda normalmente vai mais fundo, não mais amplo)
   - Aquilo em que o entrevistador desta ronda pareceu mais interessado

   Rotula toda a previsão como `[inferred]` — nunca apresentes uma pergunta prevista como se tivesse origem em candidatos reais ou fontes internas.

2. **Monta uma lista de prioridades** para a preparação da próxima ronda — ordenada por gravidade da lacuna e probabilidade de ser testada

3. **Sugere executar** `interview/plan` com os detalhes da próxima ronda para montar um plano de preparação completo

---

## Step 7 — Probability Assessment (Optional)

Se o candidato pedir uma leitura honesta das chances dele:

Avalia com base em:
- Número e gravidade das lacunas (🔴 em fundamentos = risco maior do que 🔴 em tópicos avançados)
- Sinais do entrevistador (deu detalhes específicos da próxima ronda = positivo; vago = neutro; chamada curta = risco)
- Fit da função/oferta (anos de experiência, correspondência de domínio, localização)
- Diferenciais (coisas que o candidato disse que a maioria dos candidatos não diria)

Sê honesto. Um intervalo de probabilidade com raciocínio claro é mais útil do que falsa confiança.

---

## Step 8 — Save Debrief

Acrescenta a `interview-prep/{company-slug}-{role-slug}.md`:

```markdown
## Round [N] Debrief — [YYYY-MM-DD]

**Interviewer:** [nome, cargo]
**Round type:** [screening / technical / design-case-study / behavioral]
**Outcome:** [pending / moved forward / rejected]

### Questions Asked
[lista]

### Gaps Identified
[lista com respostas corretas]

### Next Round
**Format:** [se souberes]
**Interviewers:** [se souberes]
**Priority prep:** [3 principais tópicos a colmatar antes da próxima ronda]

### Process Intel (recruiter / HM screens — omit if not applicable)
**Comp discussed:** [sim / não — se sim, o que foi dito e o que foi ancorado]
**Timeline:** [quaisquer datas ou prazos mencionados]
**Other candidates:** [se revelado]
**Next steps:** [o que o entrevistador disse que acontece a seguir e até quando]
```

---

## Step 9 — Write Session Transcript

Após o debrief, escreve também uma transcrição da sessão legível por máquina em `interview-prep/sessions/{company-slug}-{role-slug}-{round}-{YYYY-MM-DD}.md`. Este é um registo estruturado da ronda para modos de análise posteriores; os turnos com rótulo de quem fala permitem que um consumidor leia qualquer um dos lados sem reinferir quem falou. O contrato completo está em `interview-prep/sessions/README.md`.

Formato:

```markdown
---
company: [company]
role: [role]
round: [screen | hiring-manager | technical | system-design | behavioral | onsite | final]
date: YYYY-MM-DD
interviewer_role: [role, if known]
source: debrief
---

## Q1
**Interviewer:** [pergunta como foi feita]
<!-- competency: tag[, tag...] -->
**Candidate:** [resposta como foi dada / reconstruída neste debrief]

## Q2
...
```

Regras para a transcrição:

- **Mapeia o tipo de ronda para o enum** acima (ex.: triagem com recrutador → `screen`, triagem com gestor → `hiring-manager`, aprofundamento técnico → `technical`, design/estudo de caso → `system-design`).
- **Marca cada resposta.** Na linha diretamente acima de cada linha `**Candidate:**`, emite `<!-- competency: tag[, tag...] -->` — em lowercase-kebab-case, separada por vírgulas para respostas com múltiplas competências (ex.: `system-design`, `people-leadership`, `incident-response`). Já avaliaste cada resposta no Step 2, então marca a partir dessa avaliação, sem reler. As tags são livres; escolhe a competência que a pergunta realmente testou.
- **Reconstrói o turno do candidato fielmente.** Usa o que o candidato relatou ter dito no Step 1, não uma resposta idealizada. A "correct/complete answer" do Step 2 pertence ao ficheiro de debrief, nunca à transcrição — a transcrição regista o que aconteceu.
- **`source: debrief`.**
- O ficheiro da sessão fica numa pasta no gitignore (nomes/empresas reais nunca entram no controlo de versões); escreve-o sem censurar.

---

## Rules

- **Faz o debrief imediatamente.** A memória dos detalhes da entrevista degrada rápido — em horas, perguntas e reações específicas são esquecidas. Executa este modo no mesmo dia.
- **Não suavizes as lacunas.** Uma lacuna 🔴 chamada de 🟡 por gentileza vai reaparecer na próxima ronda.
- **Nunca coloques alegações inventadas na boca do candidato.** As respostas corretas/completas podem recorrer a conhecimento geral da área, mas qualquer alegação pessoal ou métrica sugerida deve vir do que o candidato disse, de `cv.md`, `article-digest.md` ou da story bank.
- **Alegações retiradas são uma barreira rígida.** Se uma alegação aparecer em `interview-prep/retracted-claims.md`, nunca sugiras que o candidato a use — mesmo que a tenha dito na entrevista real. Sinaliza-a: "Essa alegação está na tua lista de retiradas — não é defensável sob pressão. Aqui está uma versão que não depende dela."
- **Regista novas retratações.** Se o debrief revelar uma alegação que o candidato usou na entrevista real e que agora concorda não ser defensável, oferece-te para acrescentá-la a `interview-prep/retracted-claims.md`: `**"[claim]"** ([context]). Reason: [one-line reason + correct framing if applicable].`
- **Extrai lacunas de vocabulário explicitamente.** Se o candidato usou um termo impreciso onde existe um preciso, acrescenta-o a `interview-prep/interview-prep-guide.md` na secção de vocabulário (se o candidato mantiver uma).
- **Uma lacuna = uma correção.** Não sobrecarregues com um plano de estudo completo para cada lacuna. Prioriza as 1–2 com maior probabilidade de serem testadas na próxima ronda.
- **Celebra o que funcionou.** O debrief não é só sobre lacunas. Nomeia o que foi forte — isso reforça o comportamento certo e constrói confiança para a próxima ronda.
