# tRPC — Especificacao de Implementacao

> Camada de API type-safe para o devroast, integrada com Next.js 16 App Router e React Server Components.

## Contexto

O devroast ja tem um banco Postgres (Drizzle ORM) com queries prontas em `src/db/queries/roasts.ts`. Hoje as pages consomem dados diretamente via imports dessas queries nos server components. Precisamos de uma camada de API para:

1. Expor procedures tipadas (queries e mutations) que os client components possam consumir
2. Manter prefetch no server para SSR com hydration no client (via TanStack React Query)
3. Preparar o terreno para a mutation de submissao de codigo (formulario da homepage)

O projeto nao tem autenticacao — todas as submissions sao anonimas. Isso simplifica o context do tRPC (sem session/user).

---

## Stack

| Camada | Tecnologia | Versao |
|---|---|---|
| API layer | tRPC | 11.x |
| Client integration | @trpc/tanstack-react-query | 11.x |
| Data fetching | TanStack React Query | latest (v5) |
| Validation | zod | latest |
| Framework | Next.js 16 App Router | 16.1.6 |
| Boundary guards | `server-only`, `client-only` | latest |

---

## Dependencias a Instalar

```bash
npm install @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod client-only server-only
```

> `zod` sera usado para validacao de input nas procedures. `client-only` e `server-only` sao guards de import para evitar vazamento de codigo entre server/client.

---

## Estrutura de Arquivos

```
src/
  trpc/
    init.ts             # initTRPC, context, baseProcedure, createTRPCRouter
    routers/
      _app.ts           # appRouter (merge de todos os sub-routers) + export type AppRouter
      roast.ts          # sub-router: getById, getLeaderboard, getStats, submit
    query-client.ts     # makeQueryClient (factory compartilhada server/client)
    client.tsx          # "use client" — TRPCReactProvider, useTRPC, TRPCProvider
    server.tsx          # "server-only" — trpc proxy, getQueryClient, HydrateClient, prefetch, caller
  app/
    api/
      trpc/
        [trpc]/
          route.ts      # fetch adapter (GET + POST)
    layout.tsx          # monta TRPCReactProvider envolvendo {children}
```

---

## Especificacao

### 1. `src/trpc/init.ts` — Server init e context

```typescript
import { initTRPC } from "@trpc/server";
import { cache } from "react";

export const createTRPCContext = cache(async () => {
	// Sem autenticacao. Expandir no futuro se necessario.
	return {};
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
```

**Decisao**: context vazio (sem `headers`) porque o devroast nao tem autenticacao. Se no futuro adicionar auth, basta expandir o context para aceitar `headers` e extrair session.

### 2. `src/trpc/routers/roast.ts` — Sub-router de roasts

Reaproveita as queries existentes de `src/db/queries/roasts.ts`:

```typescript
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import {
	createRoast,
	getLeaderboard,
	getRoastById,
	getStats,
} from "@/db/queries/roasts";

export const roastRouter = createTRPCRouter({
	getById: baseProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(({ input }) => getRoastById(input.id)),

	getLeaderboard: baseProcedure
		.input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
		.query(({ input }) => getLeaderboard(input?.limit)),

	getStats: baseProcedure.query(() => getStats()),

	submit: baseProcedure
		.input(
			z.object({
				code: z.string().min(1).max(10000),
				language: z.string().max(50),
				roastMode: z.boolean().default(true),
			}),
		)
		.mutation(async ({ input }) => {
			// TODO: chamar AI para gerar o roast, depois salvar no banco
			// Por enquanto, placeholder que sera implementado na feature de AI
			throw new Error("not implemented");
		}),
});
```

### 3. `src/trpc/routers/_app.ts` — App router

```typescript
import { createTRPCRouter } from "../init";
import { roastRouter } from "./roast";

export const appRouter = createTRPCRouter({
	roast: roastRouter,
});

export type AppRouter = typeof appRouter;
```

### 4. `src/app/api/trpc/[trpc]/route.ts` — HTTP handler

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: createTRPCContext,
	});

export { handler as GET, handler as POST };
```

### 5. `src/trpc/query-client.ts` — QueryClient factory

```typescript
import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000,
			},
			dehydrate: {
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
		},
	});
}
```

**Nota**: sem `superjson` — nao temos tipos complexos (Date, Map, etc.) que precisem de serializer customizado. O Drizzle retorna `timestamp` como `Date`, mas o JSON nativo do tRPC lida com isso adequadamente via `.toISOString()` no transporte. Se surgir necessidade, adicionar `superjson` como transformer no tRPC init + `serializeData`/`deserializeData` no query client.

### 6. `src/trpc/client.tsx` — Client provider e hooks

```typescript
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	}
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

function getUrl() {
	const base = (() => {
		if (typeof window !== "undefined") return "";
		if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
		return "http://localhost:3000";
	})();
	return `${base}/api/trpc`;
}

export function TRPCReactProvider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [httpBatchLink({ url: getUrl() })],
		}),
	);
	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
```

### 7. `src/trpc/server.tsx` — Server-side caller + prefetch helpers

```typescript
import "server-only";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
});

// Helper: prefetch sem await (streaming)
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
	queryOptions: T,
) {
	const queryClient = getQueryClient();
	if (queryOptions.queryKey[1]?.type === "infinite") {
		void queryClient.prefetchInfiniteQuery(queryOptions as any);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}

// Helper: wrapper de HydrationBoundary
export function HydrateClient(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{props.children}
		</HydrationBoundary>
	);
}

// Caller direto para server components que precisam do dado no server
export const caller = appRouter.createCaller(createTRPCContext);
```

### 8. `src/app/layout.tsx` — Montar provider

Envolver `{children}` com `TRPCReactProvider`:

```tsx
import { TRPCReactProvider } from "@/trpc/client";

// ... fonts, metadata existentes ...

export default function RootLayout({ children }: ...) {
	return (
		<html lang="pt-BR">
			<body className={...}>
				<nav>...</nav>
				<TRPCReactProvider>
					{children}
				</TRPCReactProvider>
			</body>
		</html>
	);
}
```

---

## Padrao de Uso

### Server component com prefetch (SSR + streaming)

```tsx
// src/app/leaderboard/page.tsx
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { LeaderboardClient } from "./leaderboard-client";

export default function LeaderboardPage() {
	prefetch(trpc.roast.getLeaderboard.queryOptions({ limit: 20 }));
	prefetch(trpc.roast.getStats.queryOptions());

	return (
		<HydrateClient>
			<LeaderboardClient />
		</HydrateClient>
	);
}
```

### Client component consumindo dados prefetchados

```tsx
// src/app/leaderboard/leaderboard-client.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function LeaderboardClient() {
	const trpc = useTRPC();
	const { data: entries } = useQuery(trpc.roast.getLeaderboard.queryOptions({ limit: 20 }));
	const { data: stats } = useQuery(trpc.roast.getStats.queryOptions());

	// ... render
}
```

### Server component com caller direto (sem hydration)

```tsx
// Para pages que nao precisam de interatividade no client
import { caller } from "@/trpc/server";

export default async function RoastPage({ params }: { params: { id: string } }) {
	const roast = await caller.roast.getById({ id: params.id });
	// ... render server-only
}
```

---

## Gotchas

### staleTime > 0
Com SSR, `staleTime` deve ser > 0 (usamos 30s) para evitar refetch imediato no client apos hydration.

### shouldDehydrateQuery com pending
Estendemos `shouldDehydrateQuery` para incluir queries com status `pending`. Isso permite iniciar o prefetch no server sem `await` e streamar o resultado para o client.

### QueryClient por request no server
`getQueryClient` usa `cache()` do React para garantir uma unica instancia por request no server. No browser, usamos um singleton.

### Sem superjson
Nao usamos data transformer. `Date` do Postgres chega como string ISO no client (via JSON). Se precisar de Date objects no client, converter manualmente ou adicionar `superjson` depois.

### import type para AppRouter
Sempre usar `import type { AppRouter }` no client para evitar importar codigo server-side no bundle do client.

---

## TODOs

### Infra

- [ ] Instalar deps: `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/react-query`, `zod`, `client-only`, `server-only`
- [ ] Criar `src/trpc/init.ts` (context + baseProcedure + createTRPCRouter)
- [ ] Criar `src/trpc/query-client.ts` (makeQueryClient factory)

### Routers

- [ ] Criar `src/trpc/routers/roast.ts` (getById, getLeaderboard, getStats, submit placeholder)
- [ ] Criar `src/trpc/routers/_app.ts` (appRouter + export type AppRouter)

### HTTP handler

- [ ] Criar `src/app/api/trpc/[trpc]/route.ts` (fetch adapter, GET + POST)

### Client

- [ ] Criar `src/trpc/client.tsx` (TRPCReactProvider, useTRPC)
- [ ] Montar `TRPCReactProvider` no `src/app/layout.tsx` envolvendo `{children}`

### Server

- [ ] Criar `src/trpc/server.tsx` (trpc proxy, prefetch, HydrateClient, caller)

### Validacao

- [ ] `npx next build` compila sem erros
- [ ] `npx biome check` passa sem warnings
- [ ] Testar chamada via `curl http://localhost:3000/api/trpc/roast.getStats` retorna JSON valido

---

## Referencias

- [tRPC v11 — Next.js App Router Setup](https://trpc.io/docs/client/nextjs/app-router-setup)
- [tRPC v11 — Server Components](https://trpc.io/docs/client/tanstack-react-query/server-components)
- [tRPC v11 — TanStack React Query Setup](https://trpc.io/docs/client/tanstack-react-query/setup)
- [TanStack Query — Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
