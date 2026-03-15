import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { LeaderboardCodeBlock } from "@/components/ui/leaderboard-code-block";

export const metadata: Metadata = {
	title: "shame_leaderboard | devroast",
	description:
		"the most roasted code on the internet. see the worst-scored code submissions ranked by shame.",
};

type LeaderboardEntry = {
	rank: number;
	score: string;
	language: string;
	languageShiki: BundledLanguage;
	lineCount: number;
	code: string;
};

const entries: LeaderboardEntry[] = [
	{
		rank: 1,
		score: "1.2",
		language: "javascript",
		languageShiki: "javascript",
		lineCount: 3,
		code: `eval(prompt("enter code"))\ndocument.write(response)\n// trust the user lol`,
	},
	{
		rank: 2,
		score: "1.8",
		language: "typescript",
		languageShiki: "typescript",
		lineCount: 3,
		code: `if (x == true) { return true; }\nelse if (x == false) { return false; }\nelse { return !false; }`,
	},
	{
		rank: 3,
		score: "2.1",
		language: "sql",
		languageShiki: "sql",
		lineCount: 2,
		code: `SELECT * FROM users WHERE 1=1\n-- TODO: add authentication`,
	},
	{
		rank: 4,
		score: "2.3",
		language: "java",
		languageShiki: "java",
		lineCount: 3,
		code: `catch (e) {\n  // ignore\n}`,
	},
	{
		rank: 5,
		score: "2.5",
		language: "javascript",
		languageShiki: "javascript",
		lineCount: 3,
		code: `const sleep = (ms) =>\n  new Date(Date.now() + ms)\n  while(new Date() < end) {}`,
	},
];

export default function LeaderboardPage() {
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
						2,847 submissions
					</span>
					<span className="font-body text-xs text-text-tertiary">{"·"}</span>
					<span className="font-body text-xs text-text-tertiary">
						avg score: 4.2/10
					</span>
				</div>
			</section>

			{/* Leaderboard Entries */}
			<section className="flex flex-col gap-5">
				{entries.map((entry) => (
					<article
						key={entry.rank}
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
										{entry.rank}
									</span>
								</div>

								{/* Score */}
								<div className="flex items-center gap-1.5">
									<span className="font-mono text-xs text-text-tertiary">
										score:
									</span>
									<span className="font-mono text-sm font-bold text-accent-red">
										{entry.score}
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
							language={entry.languageShiki}
							className="border-0 h-[120px]"
						/>
					</article>
				))}
			</section>
		</main>
	);
}
