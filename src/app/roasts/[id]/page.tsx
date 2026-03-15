import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiffLine } from "@/components/ui/diff-line";
import { LeaderboardCodeBlock } from "@/components/ui/leaderboard-code-block";
import { ScoreRing } from "@/components/ui/score-ring";
import { SectionTitle } from "@/components/ui/section-title";
import { caller } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

function getVerdict(score: number) {
	if (score <= 2) return "absolute_disaster";
	if (score <= 4) return "needs_serious_help";
	if (score <= 6) return "mediocre_at_best";
	if (score <= 8) return "not_terrible";
	return "actually_decent";
}

function getVerdictVariant(score: number) {
	if (score <= 4) return "critical" as const;
	if (score <= 6) return "warning" as const;
	return "good" as const;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const roast = await caller.roast.getById({ id });

	if (!roast) {
		return { title: "not found | devroast" };
	}

	return {
		title: `roast_result (${roast.score.toFixed(1)}/10) | devroast`,
		description: roast.roastQuote,
	};
}

export default async function RoastResultPage({ params }: Props) {
	const { id } = await params;
	const roast = await caller.roast.getById({ id });

	if (!roast) {
		notFound();
	}

	const verdict = getVerdict(roast.score);
	const verdictVariant = getVerdictVariant(roast.score);

	return (
		<main className="flex flex-col gap-10 px-20 py-10">
			{/* Score Hero Section */}
			<section className="flex items-center gap-12">
				<ScoreRing score={roast.score} />

				<div className="flex flex-1 flex-col gap-4">
					<Badge variant={verdictVariant}>verdict: {verdict}</Badge>

					<p className="font-body text-xl leading-relaxed text-text-primary">
						{`"${roast.roastQuote}"`}
					</p>

					<div className="flex items-center gap-4">
						<span className="font-mono text-xs text-text-tertiary">
							lang: {roast.language}
						</span>
						<span className="font-mono text-xs text-text-tertiary">
							{"\u00B7"}
						</span>
						<span className="font-mono text-xs text-text-tertiary">
							{roast.lineCount} lines
						</span>
					</div>

					<div>
						<Button variant="link" size="sm">
							$ share_roast
						</Button>
					</div>
				</div>
			</section>

			{/* Divider */}
			<div className="h-px bg-border-primary" />

			{/* Submitted Code Section */}
			<section className="flex flex-col gap-4">
				<SectionTitle>your_submission</SectionTitle>

				<LeaderboardCodeBlock
					code={roast.code}
					language={roast.language as import("shiki").BundledLanguage}
				/>
			</section>

			{/* Divider */}
			<div className="h-px bg-border-primary" />

			{/* Detailed Analysis Section */}
			{roast.issues.length > 0 && (
				<section className="flex flex-col gap-6">
					<SectionTitle>detailed_analysis</SectionTitle>

					<div className="flex flex-col gap-5">
						{/* Render issues in rows of 2 */}
						{Array.from(
							{ length: Math.ceil(roast.issues.length / 2) },
							(_, rowIndex) => {
								const rowIssues = roast.issues.slice(
									rowIndex * 2,
									rowIndex * 2 + 2,
								);
								return (
									<div
										key={rowIssues.map((i) => i.id).join("-")}
										className="flex gap-5"
									>
										{rowIssues.map((issue) => (
											<div
												key={issue.id}
												className="flex flex-1 flex-col gap-3 border border-border-primary p-5"
											>
												<Badge variant={issue.severity}>{issue.severity}</Badge>
												<span className="font-mono text-[13px] font-medium text-text-primary">
													{issue.title}
												</span>
												<p className="font-body text-xs leading-relaxed text-text-secondary">
													{issue.description}
												</p>
											</div>
										))}
									</div>
								);
							},
						)}
					</div>
				</section>
			)}

			{/* Divider */}
			{roast.diffLines.length > 0 && <div className="h-px bg-border-primary" />}

			{/* Suggested Fix Section */}
			{roast.diffLines.length > 0 && (
				<section className="flex flex-col gap-6">
					<SectionTitle>suggested_fix</SectionTitle>

					<div className="overflow-hidden border border-border-primary bg-bg-input">
						{/* Diff Header */}
						<div className="flex h-10 items-center border-b border-border-primary px-4">
							<span className="font-mono text-xs font-medium text-text-secondary">
								your_code.{roast.language} → improved_code.{roast.language}
							</span>
						</div>

						{/* Diff Body */}
						<div className="flex flex-col py-1">
							{roast.diffLines.map((line) => (
								<DiffLine key={line.id} type={line.type} code={line.content} />
							))}
						</div>
					</div>
				</section>
			)}
		</main>
	);
}
