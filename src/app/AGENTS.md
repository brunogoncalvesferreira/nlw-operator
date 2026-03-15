# App Router — Pages e Layouts

## Estrutura

```
src/app/
  layout.tsx              # Layout raiz (navbar, fonts, TRPCReactProvider)
  page.tsx                # Homepage (server component)
  globals.css             # Tailwind v4 + @theme tokens
  home-stats.tsx          # Client component — stats com NumberFlow
  code-input-form.tsx     # Client component — form do code editor
  api/trpc/[trpc]/        # HTTP handler do tRPC
  leaderboard/page.tsx    # Leaderboard (server component, caller direto)
  roasts/[id]/page.tsx    # Detalhe do roast (server component, caller direto)
  components/page.tsx     # Showcase de componentes (dev only)
```

## Regras

### Server components por padrao

Toda page eh server component. Usar `"use client"` apenas para componentes que precisam de:
- Estado (`useState`, `useReducer`)
- Efeitos (`useEffect`)
- Eventos de browser (`onClick`, `onChange`)
- Hooks client (ex: `useTRPC`, `useQuery`)

### Data fetching

Duas estrategias conforme o caso (ver `src/trpc/AGENTS.md` para detalhes):

| Cenario | Estrategia | Exemplo |
|---|---|---|
| Pagina server, dado renderizado no HTML | `caller` direto | `/leaderboard`, `/roasts/[id]` |
| Client component, dado reativo/animado | `useTRPC` + `useQuery` | `home-stats.tsx` (NumberFlow) |
| Server prefetch + client hydration | `prefetch` + `HydrateClient` | Quando precisa de dado no server E interatividade no client |

**IMPORTANTE**: NAO usar prefetch quando o objetivo eh animar a transicao de "sem dado" para "com dado" (ex: NumberFlow). Prefetch faz o dado chegar hydratado e a animacao nao acontece.

### Homepage

A homepage (`page.tsx`) busca dados reais do banco para todas as secoes:
- **Leaderboard preview**: `HomeLeaderboard` (async server component) busca top 3 via `caller.roast.getLeaderboard({ limit: 3 })`, renderizado dentro de `<Suspense>` com `HomeLeaderboardSkeleton`.
- **Stats**: `HomeStats` (client component) busca via `useTRPC` + `useQuery` para permitir animacao com NumberFlow.

**IMPORTANTE**: NAO usar prefetch para `HomeStats` — o dado precisa chegar via client fetch para NumberFlow animar de 0 ao valor real.

### Metadata

- Pages com dados estaticos usam `export const metadata: Metadata`
- Pages com dados dinamicos usam `export async function generateMetadata()`

```tsx
// Estatico
export const metadata: Metadata = {
  title: "shame_leaderboard | devroast",
};

// Dinamico
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const roast = await caller.roast.getById({ id });
  return {
    title: `roast_result (${roast.score.toFixed(1)}/10) | devroast`,
  };
}
```

### Not found

Para paginas dinamicas, verificar se o dado existe e chamar `notFound()` do `next/navigation`:

```tsx
import { notFound } from "next/navigation";

const roast = await caller.roast.getById({ id });
if (!roast) {
  notFound();
}
```

### Params em Next.js 16

No Next.js 16, `params` eh uma **Promise**. Sempre usar `await`:

```tsx
type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
}
```

### Layout

O `layout.tsx` raiz contem:
- Fonts (JetBrains Mono + IBM Plex Mono) via `next/font/google`
- Navbar compartilhada
- `TRPCReactProvider` envolvendo `{children}`

### Composicao

Composicoes de pagina ficam direto na page, NAO viram componente separado. Componentes extraidos da page ficam no mesmo diretorio (ex: `home-stats.tsx` ao lado de `page.tsx` em `app/`).

Componentes reutilizaveis entre paginas ficam em `src/components/ui/` (ver `ui/AGENTS.md`).

### Linguagens e shiki

O campo `language` do banco eh uma string (ex: `"javascript"`, `"typescript"`). Para usar com shiki, fazer cast:

```tsx
import type { BundledLanguage } from "shiki";
<LeaderboardCodeBlock language={entry.language as BundledLanguage} />
```

### Derivacao de dados no render

Dados derivados (ex: verdict a partir do score) sao funcoes utilitarias definidas no topo do arquivo da page, NAO em arquivos separados:

```tsx
function getVerdict(score: number) {
  if (score <= 2) return "absolute_disaster";
  if (score <= 4) return "needs_serious_help";
  // ...
}
```
