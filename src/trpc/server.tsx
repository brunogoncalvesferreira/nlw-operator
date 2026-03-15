import "server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
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
// biome-ignore lint/suspicious/noExplicitAny: tRPC's TRPCQueryOptions requires generic any for flexible typing
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
	queryOptions: T,
) {
	const queryClient = getQueryClient();
	if (queryOptions.queryKey[1]?.type === "infinite") {
		// biome-ignore lint/suspicious/noExplicitAny: required cast for infinite query compatibility
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
