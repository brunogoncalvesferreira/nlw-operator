import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { CodeInputForm } from "./code-input-form";
import { HomeLeaderboard } from "./home-leaderboard";
import { HomeLeaderboardSkeleton } from "./home-leaderboard-skeleton";
import { HomeStats } from "./home-stats";

export default function Home() {
	return (
		<main className="flex flex-col items-center gap-8 px-10 pt-20 pb-16">
			{/* Hero */}
			<section className="flex flex-col items-center gap-3">
				<div className="flex items-center gap-3">
					<span className="font-mono text-4xl font-bold text-accent-green">
						$
					</span>
					<h1 className="font-mono text-4xl font-bold text-text-primary">
						paste your code. get roasted.
					</h1>
				</div>
				<p className="font-body text-sm text-text-secondary">
					{
						"// drop your code below and we'll rate it — brutally honest or full roast mode"
					}
				</p>
			</section>

			{/* Code Editor + Actions */}
			<CodeInputForm />

			{/* Footer Stats */}
			<HomeStats />

			{/* Spacer */}
			<div className="h-16" />

			{/* Leaderboard Preview */}
			<section className="flex flex-col gap-6 w-[960px]">
				{/* Title Row */}
				<div className="flex items-center justify-between w-full">
					<SectionTitle size="sm">shame_leaderboard</SectionTitle>
					<Button variant="link" size="sm">
						{"$ view_all >>"}
					</Button>
				</div>

				{/* Subtitle */}
				<p className="font-body text-[13px] text-text-tertiary">
					{"// the worst code on the internet, ranked by shame"}
				</p>

				{/* Table + Footer — streamed via Suspense */}
				<Suspense fallback={<HomeLeaderboardSkeleton />}>
					<HomeLeaderboard />
				</Suspense>
			</section>

			{/* Bottom Padding */}
			<div className="h-16" />
		</main>
	);
}
