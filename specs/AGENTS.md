# specs/ — Formato de Especificacoes

Specs sao documentos de planejamento criados **antes** de implementar uma feature. Servem como contrato entre quem planeja e quem executa (humano ou agente).

## Formato

Arquivo Markdown em `specs/`, nomeado com slug descritivo: `nome-da-feature.md`.

### Secoes

1. **Titulo** (`# Feature — Spec`) + frase de contexto
2. **Contexto** — o que e, por que existe, como se encaixa no projeto
3. **Pesquisa** (quando aplicavel) — abordagens avaliadas com pros/contras e tabela comparativa
4. **Decisao** — qual abordagem foi escolhida e por que
5. **Especificacao** — detalhes tecnicos: estrutura de arquivos, tipos, props, comportamento, queries
6. **Dependencias** — pacotes novos necessarios (com bundle size quando relevante)
7. **Gotchas** — armadilhas conhecidas e cuidados na implementacao
8. **TODOs** — checklist ordenado de tarefas de implementacao (`- [ ]`)

Nem toda spec precisa de todas as secoes. Use apenas o que faz sentido para a complexidade da feature.

## Principios

- **Concreto**: incluir tipos, nomes de arquivo, snippets de codigo. Nao ficar em abstracoes.
- **Decisoes justificadas**: se descartou uma alternativa, dizer por que.
- **Checklist executavel**: os TODOs devem ser actionable, nao vagos.
- **Autocontido**: alguem lendo so a spec deve conseguir implementar sem perguntar nada.
