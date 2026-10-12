# Mode: interview/plan — Planeador de preparação para entrevista

Dada uma descrição da oferta e a data/hora da entrevista, monta um plano de preparação estruturado e dividido em blocos de tempo, ajustado às lacunas específicas do candidato.

---

## Inputs

1. **Descrição da oferta** (obrigatório) — cola aqui ou fornece o URL
2. **Data e hora da entrevista** (obrigatório) — para calcular as horas disponíveis
3. **Nome e cargo do entrevistador** (se souberes) — definem a profundidade e o tom da preparação
4. **Tipo de ronda** (se souberes) — triagem, técnica/específica da área, design/estudo de caso, painel comportamental
5. **CV** em `cv.md` + `article-digest.md` (se existir) — lê para experiência, competências, pontos de prova
6. **Perfil** em `config/profile.yml` + `modes/_profile.md` — lê para narrativa, arquétipos e objetivos
7. **Story bank** em `interview-prep/story-bank.md` — histórias STAR+R já existentes
8. **Question bank** em `interview-prep/question-bank.md` — lacunas já conhecidas (se o ficheiro existir)

---

## Step 1 — Fit Assessment

Lê o CV e a descrição da oferta. Produz uma avaliação em duas colunas:

**Pontos fortes para ancorar:** experiência, cargos, domínio e pontos de prova que correspondem diretamente à oferta de emprego.

**Lacunas a colmatar:** competências, ferramentas ou experiências exigidas na oferta que estão ausentes ou frágeis no CV. Ordena pela probabilidade de serem testadas neste tipo específico de ronda.

Sê honesto. Uma lacuna é uma lacuna — sinaliza-a com clareza, para que o tempo de preparação vá aos lugares certos.

---

## Step 2 — Round Intelligence

Identifica o que esta ronda realmente avalia, com base em:
- Cargo do entrevistador (gestor = comunicação + motivação + fundamentos; especialista da área = profundidade + julgamento)
- Rótulo da ronda (triagem, técnica/domínio, design/estudo de caso, final)
- Sinais da descrição da oferta (aquilo que enfatizam)

**Triagem com o recrutador:**
- Verificação de requisitos: fit, alinhamento de remuneração, logística, comunicação
- Não é um teste técnico — as perguntas de profundidade vêm com o responsável pela contratação e nas rondas seguintes
- Provável: apresentação da trajetória, "porquê nós / porquê esta função", expectativa de remuneração, prazos, uma pergunta logística
- Trata isto como o ponto de controlo fácil; usa o tempo de preparação para construir a base do que vem depois

**Triagem com o responsável pela contratação (hiring manager):**
- Comunicação, motivação, fit — além de filosofia de liderança e discernimento
- Fundamentos da competência central da função — não os detalhes internos aprofundados
- 1–2 histórias comportamentais
- Provável: trajetória, "porquê nós", um conceito central da função, uma história de liderança, uma pergunta situacional orientada para o futuro

**Aprofundamento técnico/de domínio com um especialista:**
- Profundidade na competência central da função (ex.: detalhes internos de runtime para engenharia, escolhas de modelação para dados, métodos de avaliação para finanças)
- Cenários aplicados do dia a dia da função
- Possível exercício ao vivo ou walkthrough guiado
- Histórias usadas como evidência, não como evento principal

**Painel de design / estudo de caso:**
- Solução completa — restrições, componentes, trade-offs, modos de falha
- As dimensões de qualidade que a oferta enfatiza (ex.: escalabilidade, conformidade, mensurabilidade)
- Nível sénior: define restrições, faz perguntas de esclarecimento, conduz a conversa

Calibra o plano à ronda. Preparar profundidade em excesso para uma triagem desperdiça tempo e cria a mentalidade errada.

---

## Step 3 — Build the Time-Blocked Plan

Calcula as horas disponíveis de agora até ao horário da entrevista. Divide em blocos:

Antes de dimensionar os blocos, verifica `interview-prep/question-bank.md` (se existir). Qualquer pergunta marcada com 🔴 numa ronda anterior é uma lacuna comprovada — ela ganha um bloco dedicado, independentemente de como a análise CV-vs-oferta a classifique. Dados reais de desempenho superam o risco inferido.

**Template (ajusta a dimensão dos blocos conforme o total de horas disponíveis):**

```text
Bloco 1 — Fixa a tua narrativa (primeiro, sempre)
  - Escreve de forma explícita a linha do tempo da tua trajetória
  - Prepara o "porquê desta empresa" com uma conexão específica ao teu percurso
  - Prepara a história do teu ponto de prova mais forte (versão de 30 segundos)
  - Tempo: ~15% das horas disponíveis

Bloco 2 — Tópico de domínio prioritário (primeiro a lacuna de maior risco)
  - Um tópico por bloco — não mistures
  - Para cada um: conceito → gancho com a tua história → prováveis perguntas de seguimento
  - Tempo: ~25% das horas disponíveis

Bloco 3 — Tópico de domínio secundário
  - Segunda lacuna de maior risco
  - Tempo: ~20% das horas disponíveis

Bloco 4 — Histórias comportamentais
  - Mapeia as histórias existentes para os prováveis tipos de pergunta
  - Pratica a versão verbal de 2 minutos de cada uma
  - Prepara a Reflection de cada uma — o diferencial do candidato sénior
  - Tempo: ~15% das horas disponíveis

Bloco 5 — Pesquisa sobre a empresa
  - Páginas de produto relevantes para a função
  - Conexão entre o teu percurso e o domínio específico deles
  - 3–4 perguntas pertinentes para lhes colocar
  - Tempo: ~10% das horas disponíveis

Bloco 6 — Simulação prática (se o tempo permitir)
  - Uma pergunta por tópico provável — em voz alta, cronometrada
  - Tempo: ~10% das horas disponíveis

Bloco 7 — Folga + descanso
  - Pára de estudar 60–90 minutos antes da entrevista
  - Estudar na última hora acrescenta ruído, não sinal
  - Tempo: o restante
```

Ajusta o tamanho dos blocos conforme a gravidade das lacunas e o tipo de ronda. Se for uma triagem, o Bloco 4 (comportamental) e o Bloco 5 (pesquisa sobre a empresa) são mais importantes do que os blocos de domínio aprofundado.

---

## Step 4 — Priority Quick-Reference

No final do plano, produz um resumo de uma página que o candidato possa rever 15 minutos antes da entrevista:

```markdown
## 15-Minute Pre-Interview Review

**Your anchor sentence:** [uma frase que resume porque és a pessoa certa para esta função]

**Top 3 things to remember:**
1. [a mensagem mais importante a deixar com o entrevistador]
2. [a pergunta mais provável e a primeira frase da tua resposta]
3. [a conexão entre o teu percurso e o domínio deles]

**Your questions to ask:**
1. [pergunta 1]
2. [pergunta 2]
3. [pergunta 3]
```

---

## Step 5 — Save Output

Guarda o plano em `interview-prep/{company-slug}-{role-slug}.md` se o ficheiro não existir, ou acrescenta uma secção `## Prep Plan` se já existir.

---

## Rules

- **Calibra à ronda.** Um plano de preparação para triagem é muito diferente de um para painel de design. Não uses profundidade máxima por padrão em toda a entrevista.
- **Lacunas primeiro.** O tempo é finito. Os pontos fortes do candidato não precisam de preparação — as lacunas dele, sim.
- **Lacunas 🔴 da question bank têm prioridade sobre lacunas inferidas.** Dados reais de desempenho vencem a análise CV-vs-oferta. Se o candidato já sabe que tem dificuldade num tópico, não o enterres.
- **Um tópico por bloco.** Misturar tópicos num único bloco reduz a retenção.
- **Inclui sempre tempo de descanso.** Um candidato descansado tem melhor desempenho do que um que estuda até ao último minuto.
- **Nunca geres informações falsas sobre a empresa.** Se não tens pesquisa, diz isso — não inventes alegações sobre a cultura ou detalhes técnicos da empresa.
- **Nunca inventes alegações para o candidato.** A frase-âncora e os pontos de fala pré-entrevista do resumo (Step 4) devem basear-se no que o candidato realmente tem — `cv.md`, `article-digest.md` ou a story bank. Não redijas alegações que dependam de experiências ou métricas que o candidato não possui. Se uma alegação aparecer em `interview-prep/retracted-claims.md`, nunca a incluas.
