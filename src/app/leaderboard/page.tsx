import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { LeaderboardCodeBlock } from "@/components/ui/leaderboard-code-block";
import { caller } from "@/trpc/server";

export const metadata: Metadata = {
	title: "shame_leaderboard | devroast",
	description:
		"the most roasted code on the internet. see the worst-scored code submissions ranked by shame.",
};

export default async function LeaderboardPage() {
	const [entries, stats] = await Promise.all([
		caller.roast.getLeaderboard({ limit: 20 }),
		caller.roast.getStats(),
	]);

	return (
		<main className="flex flex-col gap-10 px-20 py-10">
			{/* Hero Section */}
			<section className="flex flex-col gap-4">
				{/* Title Row */}
				<div className="flex items-center gap-3">
					<span className="font-mono text-[32px] font-bold text-accent-green">
						{">"}
					</span>
					<h1 className="font-mono text-[28px] font-bold text-text-primary">
						shame_leaderboard
					</h1>
				</div>

				{/* Subtitle */}
				<p className="font-body text-sm text-text-secondary">
					{"// the most roasted code on the internet"}
				</p>

				{/* Stats Row */}
				<div className="flex items-center gap-2">
					<span className="font-body text-xs text-text-tertiary">
						{stats.totalRoasts.toLocaleString()} submissions
					</span>
					<span className="font-body text-xs text-text-tertiary">{"·"}</span>
					<span className="font-body text-xs text-text-tertiary">
						avg score: {stats.avgScore.toFixed(1)}/10
					</span>
				</div>
			</section>

			{/* Leaderboard Entries */}
			<section className="flex flex-col gap-5">
				{entries.map((entry, index) => (
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
									<span className="font-mono text-sm font-bold text-accent-amber">
										{index + 1}
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

						{/* Code Block */}
						<LeaderboardCodeBlock
							code={entry.code}
							language={entry.language as BundledLanguage}
							className="border-0 h-[120px]"
						/>
					</article>
				))}
			</section>
		</main>
	);
}
