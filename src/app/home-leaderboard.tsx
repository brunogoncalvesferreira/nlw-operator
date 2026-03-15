import type { BundledLanguage } from "shiki";
import { CollapsibleCode } from "@/components/ui/collapsible-code";
import { LeaderboardCodeBlock } from "@/components/ui/leaderboard-code-block";
import { caller } from "@/trpc/server";

export async function HomeLeaderboard() {
	const [entries, stats] = await Promise.all([
		caller.roast.getLeaderboard({ limit: 3 }),
		caller.roast.getStats(),
	]);

	return (
		<>
			{/* Leaderboard Entries */}
			<div className="flex flex-col gap-5">
				{entries.length > 0 ? (
					entries.map((entry, idx) => (
						<article
							key={entry.id}
							className="flex flex-col border border-border-primary"
						>
							{/* Meta Row */}
							<div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
								<div className="flex items-center gap-4">
									{/* Rank */}
									<div className="flex items-center gap-1.5">
										<span className="font-mono text-xs text-text-tertiary">
											#
										</span>
										<span
											className={`font-mono text-sm font-bold ${
												idx === 0 ? "text-accent-amber" : "text-text-secondary"
											}`}
										>
											{idx + 1}
										</span>
									</div>

									{/* Score */}
									<div className="flex items-center gap-1.5">
										<span className="font-mono text-xs text-text-tertiary">
											score:
										</span>
										<span className="font-mono text-sm font-bold text-accent-red">
											{entry.score.toFixed(1)}
										</span>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<span className="font-mono text-xs text-text-secondary">
										{entry.language}
									</span>
									<span className="font-mono text-xs text-text-tertiary">
										{entry.lineCount} lines
									</span>
								</div>
							</div>

							{/* Code Block — collapsible to 3 lines */}
							<CollapsibleCode totalLines={entry.lineCount} collapsedLines={3}>
								<LeaderboardCodeBlock
									code={entry.code}
									language={entry.language as BundledLanguage}
									className="border-0"
								/>
							</CollapsibleCode>
						</article>
					))
				) : (
					<div className="flex items-center justify-center h-32 border border-border-primary">
						<span className="font-body text-xs text-text-tertiary">
							no roasts yet — be the first
						</span>
					</div>
				)}
			</div>

			{/* Fade Hint */}
			<p className="text-center font-body text-xs text-text-tertiary py-4">
				{entries.length > 0
					? `showing top 3 of ${stats.totalRoasts.toLocaleString()} · view full leaderboard >>`
					: "submit your code above to start the shame board"}
			</p>
		</>
	);
}
