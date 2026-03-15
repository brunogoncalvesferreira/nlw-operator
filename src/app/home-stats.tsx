"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function HomeStats() {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.roast.getStats.queryOptions());

	return (
		<div className="flex items-center justify-center gap-6">
			<span className="font-body text-xs text-text-tertiary">
				<NumberFlow value={data?.totalRoasts ?? 0} /> codes roasted
			</span>
			<span className="font-mono text-xs text-text-tertiary">&middot;</span>
			<span className="font-body text-xs text-text-tertiary">
				avg score:{" "}
				<NumberFlow
					value={data?.avgScore ?? 0}
					format={{
						minimumFractionDigits: 1,
						maximumFractionDigits: 1,
					}}
				/>
				/10
			</span>
		</div>
	);
}
