# Pipeline — suplemento português

Executar integralmente `modes/pipeline.md`, preservando blacklist, agência, reserva/libertação de números, extração e liveness, deduplicação, relatório, arquivo de JD e escrita TSV. Ler `modes/_shared.md` e `modes/pt/_shared.md`.

A avaliação usa `modes/oferta.md` com `modes/pt/oferta.md`, mesmo quando a JD está em inglês. `language.output` controla a prosa. Manter os estados e cabeçalhos estruturais canónicos. Respeitar secções existentes de Pending/Processed ou Pendentes/Processadas.

Portais portugueses podem exigir sessão ou proteção contra automação. Falha de acesso não prova oferta expirada; usar os fallbacks canónicos ou pedir o texto da oferta, registando a limitação. Não alegar suporte verificado sem extração bem-sucedida.

Se `scan.extractor: cli` estiver configurado, usar `node browser-extract.mjs <url> --mode jd` para extração apenas de leitura, com os fallbacks do modo base em caso de erro. Não usar o extrator para preencher ou enviar formulários.
