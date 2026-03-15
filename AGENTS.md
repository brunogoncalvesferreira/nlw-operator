# devroast — Guia do Projeto

## O que eh

App de code roasting: o usuario cola codigo, recebe uma analise sarcastica com score e aparece no leaderboard publico.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (PostCSS, `@theme` em `globals.css`)
- **Biome** (lint + format — tabs, double quotes, regras recommended)
- **shiki** (syntax highlighting, tema vesper)
- **@base-ui/react** (primitivos com comportamento: Switch, etc.)
- **tailwind-variants** + **tailwind-merge** (variantes e merge de classes)

## Estrutura

```
src/
  app/                  # Pages e layouts (App Router)
    layout.tsx          # Layout raiz (navbar, fonts, metadata)
    page.tsx            # Homepage (server component)
    globals.css         # Tailwind v4 + @theme tokens
  components/
    ui/                 # Componentes reutilizaveis (ver ui/AGENTS.md)
```

## Design

- Arquivo fonte: `/home/bruno/Documentos/pencil/devroast.json` (Pencil MCP)
- Frame `9qwc9` = Homepage, frame `Wbm4d` = Component Library

## Padroes Globais

- **Dados estaticos**: todo conteudo visivel eh hardcoded, sem API.
- **Server components por padrao**. Usar `"use client"` apenas quando necessario (estado, eventos).
- **Fonts**: JetBrains Mono (`font-mono`) para titulos/codigo, IBM Plex Mono (`font-body`) para texto corrido.
- **Cores**: definidas como tokens Tailwind em `globals.css` (`bg-page`, `bg-surface`, `text-primary`, `accent-green`, etc.).
- **Navbar no layout**, compartilhada entre todas as paginas.
- **Componentes UI**: pequenos e reutilizaveis. Composicoes de pagina ficam direto na page, nao viram componente.
- **Sem inline styles**. Apenas classes Tailwind.
- **Validacao**: `npx next build` + `npx biome check` devem passar sem erros.
