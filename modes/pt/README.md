# Mercado português — career-ops-pt

Esta distribuição adapta o career-ops ao mercado de Portugal. O projeto original e os seus autores mantêm a atribuição e licença MIT.

## Configuração

No perfil do candidato:

```yaml
language:
  output: pt-PT
  modes_dir: modes/pt
```

O idioma de saída é independente da jurisdição. Uma oferta em inglês para trabalhar em Portugal usa as regras PT. Uma oferta remota estrangeira exige confirmar elegibilidade e enquadramento contratual.

Os avaliadores Gemini, OpenAI-compatible, Ollama e OpenRouter usam `lib/market-context.mjs`. Na utilização interativa, o router carrega os modos base e os suplementos portugueses. Os modos sem suplemento continuam a usar o contrato base, mantendo idioma e contexto de mercado.

## Estrutura

- `_shared.md`: suplemento de remuneração, contratos, fiscalidade e fontes oficiais, sem dados pessoais.
- `oferta.md`: estende o formato canónico A–H e os dados estruturados, sem duplicar o schema.
- `apply.md`: respostas de candidatura baseadas exclusivamente nas fontes do candidato.
- `aplicar.md`: alias de compatibilidade para `apply`.
- `pipeline.md`: suplemento do fluxo canónico de processamento.
- `interview/`: preparação, prática e balanço de entrevistas.

Os estados persistidos e nomes de campos mantêm-se canónicos; traduzir a apresentação. Os arquétipos e preferências pertencem a `modes/_profile.md` e `config/profile.yml`; as regras pessoais de trabalho pertencem a `modes/_custom.md`.

## Instalação e atualizações

Clonar `https://github.com/gajonormal/career-ops-pt.git` e executar `npm ci`. O pacote npm oficial instala o projeto original, não este fork. O atualizador desta distribuição consulta apenas o fork; integrações do upstream são revistas e testadas separadamente. Nunca executar um update para corrigir configuração pessoal.

## Validação

Executar `node doctor.mjs --json`, `node validate-portals.mjs`, `node test-all.mjs` e, para a interface web, os testes e typecheck em `web/`. Validar pelo menos um fluxo com dados de teste, incluindo relatório com JD arquivada, CV/PDF e transições do tracker.

As referências fiscais exigem confirmação do ano e da situação individual. Os benchmarks PT não incluem taxas sem suporte documental; os números do candidato são medidos pelo seu histórico real.
