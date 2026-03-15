# tRPC — Padroes e Arquitetura

## Versao

tRPC **v11** com `@trpc/tanstack-react-query`. Essa versao usa APIs diferentes das versoes anteriores (v10):

- **Client**: `createTRPCContext` (de `@trpc/tanstack-react-query`), NAO `createTRPCReact`
- **Server**: `createTRPCOptionsProxy` (de `@trpc/tanstack-react-query`), NAO `createTRPCProxyClient`

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `init.ts` | `initTRPC`, context vazio (sem auth), `baseProcedure`, `createTRPCRouter`, `createCallerFactory` |
| `query-client.ts` | Factory `makeQueryClient` (staleTime 30s, dehydrate pending queries) |
| `routers/_app.ts` | `appRouter` (root router) + export do tipo `AppRouter` |
| `routers/roast.ts` | Sub-router do dominio roast (procedures) |
| `client.tsx` | `"use client"` — `TRPCReactProvider`, `useTRPC` hook, `TRPCProvider` |
| `server.tsx` | `"server-only"` — `trpc` proxy, `prefetch`, `HydrateClient`, `caller` |

## Dois modos de consumo

### 1. Server components — `caller` direto

Para paginas server que precisam do dado renderizado no HTML. Chamada direta, sem React Query.

```tsx
import { caller } from "@/trpc/server";

export default async function Page() {
  const data = await caller.roast.getLeaderboard({ limit: 20 });
  return <div>{/* renderiza data */}</div>;
}
```

Usar quando: paginas server puras sem interatividade client (leaderboard, roast detail).

### 2. Client components — `useTRPC` + `useQuery`

Para componentes client que precisam de dados reativos, animacoes ou interatividade.

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function MyComponent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.roast.getStats.queryOptions());
  return <div>{data?.totalRoasts}</div>;
}
```

Usar quando: o componente precisa de estado client (animacoes, polling, optimistic updates).

### 3. Server prefetch + HydrateClient (streaming)

Para paginas server que prefetcham dados e passam para client components via hydration.

```tsx
// page.tsx (server)
import { prefetch, HydrateClient, trpc } from "@/trpc/server";

export default function Page() {
  prefetch(trpc.roast.getStats.queryOptions());
  return (
    <HydrateClient>
      <ClientComponent />
    </HydrateClient>
  );
}
```

**CUIDADO**: prefetch + HydrateClient faz o dado chegar ja hydratado no client. Isso impede animacoes de transicao (ex: NumberFlow de 0 para N). Se voce quer que o client veja a transicao de "sem dado" para "com dado", NAO use prefetch — deixe o `useQuery` disparar no client.

## Procedures

### Convencoes

- Cada dominio tem seu proprio sub-router em `routers/` (ex: `roast.ts`)
- Input validado com **zod** (`z.object(...)`)
- Queries chamam funcoes de `@/db/queries/*` — procedures NAO acessam o Drizzle direto
- Sem `superjson` — serializacao simples (datas viram strings, numeros ficam numeros)

### Adicionando novo procedure

1. Criar a query/mutation em `src/db/queries/`
2. Adicionar o procedure no sub-router correspondente em `routers/`
3. Se for um novo dominio, criar novo sub-router e registrar em `_app.ts`

## Provider

`TRPCReactProvider` fica no `layout.tsx` raiz, envolvendo `{children}`. Ele configura:

- `QueryClientProvider` (TanStack React Query)
- `TRPCProvider` (tRPC context com o client HTTP)
- `httpBatchLink` apontando para `/api/trpc`

## Biome

- `server.tsx` usa `any` em tipos do `prefetch` helper — necessario `biome-ignore lint/suspicious/noExplicitAny`
- Procedures com parametros nao utilizados (ex: placeholder `submit`) devem omitir o parametro do destructuring para evitar warning de unused variable
