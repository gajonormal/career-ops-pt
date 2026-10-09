# career-ops -- Modos em Português (PT-PT) (`modes/pt/`)

Esta pasta contém as traduções e adaptações para português de Portugal dos principais modos do career-ops, desenhadas para candidatos que procuram vagas no mercado português ou em empresas que operam em português.

## Quando usar estes modos?

Usa a pasta `modes/pt/` se pelo menos uma das condições abaixo for verdadeira:

- Candidatas-te principalmente a **vagas em Portugal** (LinkedIn, Landing.Jobs, ITJobs, Teamlyzer, NetEmpregos)
- O **idioma do teu currículo** é o português ou alternas entre PT-PT e EN consoante a vaga
- Precisas de respostas e cartas de apresentação com um **português tecnológico natural**, e não traduções literais geradas por máquina
- Lidas com as **especificidades do mercado português**: Contrato Sem Termo vs B2B (Recibos Verdes), Salário a 14 meses (Subsídios de Férias e Natal), Retenção de IRS, Segurança Social, Prémios Anuais, Subsídio de Alimentação, Seguro de Saúde, Período à Experiência e Código do Trabalho.

Se a maioria das tuas vagas for em inglês, mantém os modos padrão na pasta `modes/`. Os modos em inglês funcionam automaticamente quando o Claude deteta uma vaga em português — mas não conhecem as particularidades do mercado português com o mesmo nível de detalhe e profundidade.

## Como ativar?

O career-ops não tem um simples botão de "mudar idioma" no código. Em vez disso, existem dois caminhos:

### Caminho 1 -- Por sessão, via comando

Diz ao Claude no início da sessão:

> "Usa os modos em português da pasta `modes/pt/`."

ou

> "Avaliação e candidaturas em português -- usa `modes/pt/_shared.md` e `modes/pt/oferta.md`."

O Claude vai ler os ficheiros desta pasta em vez dos originais em `modes/`.

### Caminho 2 -- Permanente, via perfil

Adiciona no ficheiro `config/profile.yml` a tua preferência de idioma:

```yaml
language:
  output: pt-PT
  modes_dir: modes/pt
```

Lembra o Claude na primeira sessão de respeitar esse campo ("Por favor verifica o `profile.yml`, configurei o `language.modes_dir`"). A partir daí, o Claude usará automaticamente os modos portugueses.

> Nota: O campo `language.modes_dir` é uma convenção, não um schema rígido. Se a estrutura evoluir, o campo poderá ser ajustado.

## O que foi traduzido?

Esta adaptação cobre os modos com maior impacto direto:

| Ficheiro | Adaptado de | Finalidade |
|---------|-------------|------------|
| `_shared.md` | `modes/_shared.md` (EN) | Contexto partilhado, arquétipos, regras globais, e especificidades do mercado laboral em Portugal |
| `oferta.md` | `modes/oferta.md` (ES) | Avaliação completa de uma vaga (Blocos A-F) |
| `aplicar.md` | `modes/apply.md` (EN) | Assistente interativo para preenchimento de formulários de candidatura |
| `pipeline.md` | `modes/pipeline.md` (ES) | Caixa de entrada de URLs / Second Brain para vagas acumuladas |

Os restantes modos (`scan`, `batch`, `pdf`, `tracker`, `auto-pipeline`, `deep`, `contacto`, `ofertas`, `project`, `training`) não estão traduzidos de propósito. Eles continuam a funcionar perfeitamente através dos originais em EN, uma vez que o seu conteúdo diz respeito a tooling, caminhos locais e comandos de configuração — que devem ser estritamente independentes do idioma.

Se a comunidade adotar esta vertente portuguesa, mais modos poderão ser traduzidos no futuro.

## O que continua em inglês?

Propositadamente não traduzido, por ser vocabulário de tecnologia enraizado:

- `cv.md`, `pipeline`, `tracker`, `report`, `score`, `archetype`, `proof point`
- Nomes de ferramentas (`Playwright`, `WebSearch`, `WebFetch`, `Read`, `Write`, `Edit`, `Bash`)
- Valores de estado no rastreador (`Evaluated`, `Applied`, `Interview`, `Offer`, `Rejected`)
- Code snippets, caminhos de ficheiros e comandos na linha de comandos

Os modos usam um "português tech", tal como é falado em equipas de engenharia reais em Lisboa, Porto ou Braga: texto fluido em português, com termos técnicos em inglês onde são de uso comum. Nada de traduzir "pipeline" para "tubagem" ou "cv.md" para "curriculo.md".

## Vocabulário de Referência

Se fores adaptar ou expandir os modos, segue este vocabulário para manter a consistência de tom e linguagem:

| Inglês | Português (PT-PT) |
|--------|-------------------------------|
| Job posting | Vaga / Descrição da vaga |
| Application | Candidatura |
| Cover letter | Carta de apresentação |
| Resume / CV | Currículo |
| Salary / Compensation | Salário / Remuneração |
| Skills | Competências |
| Interview | Entrevista |
| Hiring manager | Hiring manager / Diretor da vaga |
| Recruiter | Recrutador(a) |
| AI | IA (Inteligência Artificial) |
| Requirements | Requisitos |
| Career history | Trajetória profissional / Experiência |
| Notice period | Aviso prévio |
| Probation | Período à experiência |
| Vacation | Férias |
| 13th month salary | Subsídios de Férias e Natal (Salário a 14 meses) |
| Formal employment | Contrato Sem Termo |
| Contractor | B2B / Recibos Verdes |
| Profit sharing | Prémio Anual / Bónus |
| Health insurance | Seguro de saúde |
| Meal voucher | Subsídio de alimentação |
| Severance fund | TSU / Segurança Social |
| Stock options | Stock options |

## Como Contribuir

Se quiseres melhorar a linguagem ou expandir um modo adicional:

1. Abre uma issue com a proposta (conforme `CONTRIBUTING.md`)
2. Segue a tabela de vocabulário acima para manter o tom coerente
3. Traduz de forma natural e idiomática de Portugal — sem traduções literais e sem gerúndios desnecessários
4. Mantém os elementos estruturais (Blocos A-F, tabelas, blocos de código, e chamadas a ferramentas) rigorosamente intactos
5. Testa exaustivamente com uma vaga real do mercado português (ex: do LinkedIn) antes de abrires o PR
