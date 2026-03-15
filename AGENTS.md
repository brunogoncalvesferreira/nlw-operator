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
- **tRPC v11** + **TanStack React Query** (API layer — ver `src/trpc/AGENTS.md`)
- **Drizzle ORM** + **PostgreSQL** (banco de dados — ver `src/db/AGENTS.md`)
- **zod** (validacao de input nos procedures tRPC)
- **@number-flow/react** (animacao de numeros)

## Estrutura

```
src/
  app/                  # Pages e layouts (App Router) — ver app/AGENTS.md
    api/trpc/[trpc]/    # HTTP handler do tRPC (GET + POST)
    layout.tsx          # Layout raiz (navbar, fonts, TRPCReactProvider)
    page.tsx            # Homepage (server component)
    globals.css         # Tailwind v4 + @theme tokens
  components/
    ui/                 # Componentes reutilizaveis (ver ui/AGENTS.md)
  db/                   # Drizzle ORM (ver db/AGENTS.md)
    queries/            # Funcoes de query reutilizaveis
    schema.ts           # Schema do banco (tabelas, enums, indexes)
  trpc/                 # tRPC layer (ver trpc/AGENTS.md)
    routers/            # Sub-routers por dominio
    client.tsx          # Provider + hook para client components
    server.tsx          # Helpers para server components
```

## Design

- Arquivo fonte: `/home/bruno/Documentos/pencil/devroast.json` (Pencil MCP)
- Frame `9qwc9` = Homepage, frame `Wbm4d` = Component Library

## Padroes Globais

- **Server components por padrao**. Usar `"use client"` apenas quando necessario (estado, eventos, hooks de browser).
- **Data fetching via tRPC**. Paginas server usam `caller` direto. Componentes client usam `useTRPC` + `useQuery`.
- **Homepage**: leaderboard preview e stats na home ainda usam dados estaticos/hardcoded (a homepage eh a unica pagina assim). Paginas dedicadas (`/leaderboard`, `/roasts/[id]`) buscam do banco via tRPC.
- **Fonts**: JetBrains Mono (`font-mono`) para titulos/codigo, IBM Plex Mono (`font-body`) para texto corrido.
- **Cores**: definidas como tokens Tailwind em `globals.css` (`bg-page`, `bg-surface`, `text-primary`, `accent-green`, etc.).
- **Navbar no layout**, compartilhada entre todas as paginas.
- **Componentes UI**: pequenos e reutilizaveis. Composicoes de pagina ficam direto na page, nao viram componente.
- **Sem inline styles**. Apenas classes Tailwind.
- **Sem superjson**. Serializacao simples nos procedures tRPC.
- **Validacao**: `npx next build` + `npx biome check` devem passar sem erros.
