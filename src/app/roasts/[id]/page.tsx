import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiffLine } from "@/components/ui/diff-line";
import { LeaderboardCodeBlock } from "@/components/ui/leaderboard-code-block";
import { ScoreRing } from "@/components/ui/score-ring";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata: Metadata = {
	title: "roast_result | devroast",
	description:
		"your code has been judged. see the brutal analysis, score, and suggested improvements.",
};

const roastData = {
	score: 3.5,
	verdict: "needs_serious_help" as const,
	quote:
		'"this code looks like it was written during a power outage... in 2005."',
	language: "javascript",
	lineCount: 7,
	code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
	issues: [
		{
			severity: "critical" as const,
			title: "using var instead of const/let",
			description:
				"var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
		},
		{
			severity: "warning" as const,
			title: "imperative loop pattern",
			description:
				"for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
		},
		{
			severity: "good" as const,
			title: "clear naming conventions",
			description:
				"calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
		},
		{
			severity: "good" as const,
			title: "single responsibility",
			description:
				"the function does one thing well \u2014 calculates a total. no side effects, no mixed concerns, no hidden complexity.",
		},
	],
	diff: {
		fileName: "your_code.ts \u2192 improved_code.ts",
		lines: [
			{ type: "context" as const, code: "function calculateTotal(items) {" },
			{ type: "removed" as const, code: "  var total = 0;" },
			{
				type: "removed" as const,
				code: "  for (var i = 0; i < items.length; i++) {",
			},
			{
				type: "removed" as const,
				code: "    total = total + items[i].price;",
			},
			{ type: "removed" as const, code: "  }" },
			{ type: "removed" as const, code: "  return total;" },
			{
				type: "added" as const,
				code: "  return items.reduce((sum, item) => sum + item.price, 0);",
			},
			{ type: "context" as const, code: "}" },
		],
	},
};

export default function RoastResultPage() {
	return (
		<main className="flex flex-col gap-10 px-20 py-10">
			{/* Score Hero Section */}
			<section className="flex items-center gap-12">
				<ScoreRing score={roastData.score} />

				<div className="flex flex-1 flex-col gap-4">
					<Badge variant="critical">verdict: {roastData.verdict}</Badge>

					<p className="font-body text-xl leading-relaxed text-text-primary">
						{roastData.quote}
					</p>

					<div className="flex items-center gap-4">
						<span className="font-mono text-xs text-text-tertiary">
							lang: {roastData.language}
						</span>
						<span className="font-mono text-xs text-text-tertiary">
							{"\u00B7"}
						</span>
						<span className="font-mono text-xs text-text-tertiary">
							{roastData.lineCount} lines
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

				<LeaderboardCodeBlock code={roastData.code} language="javascript" />
			</section>

			{/* Divider */}
			<div className="h-px bg-border-primary" />

			{/* Detailed Analysis Section */}
			<section className="flex flex-col gap-6">
				<SectionTitle>detailed_analysis</SectionTitle>

				<div className="flex flex-col gap-5">
					{/* Row 1 */}
					<div className="flex gap-5">
						{roastData.issues.slice(0, 2).map((issue) => (
							<div
								key={issue.title}
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

					{/* Row 2 */}
					<div className="flex gap-5">
						{roastData.issues.slice(2, 4).map((issue) => (
							<div
								key={issue.title}
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
				</div>
			</section>

			{/* Divider */}
			<div className="h-px bg-border-primary" />

			{/* Suggested Fix Section */}
			<section className="flex flex-col gap-6">
				<SectionTitle>suggested_fix</SectionTitle>

				<div className="overflow-hidden border border-border-primary bg-bg-input">
					{/* Diff Header */}
					<div className="flex h-10 items-center border-b border-border-primary px-4">
						<span className="font-mono text-xs font-medium text-text-secondary">
							{roastData.diff.fileName}
						</span>
					</div>

					{/* Diff Body */}
					<div className="flex flex-col py-1">
						{roastData.diff.lines.map((line) => (
							<DiffLine
								key={`${line.type}-${line.code}`}
								type={line.type}
								code={line.code}
							/>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
