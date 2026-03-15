import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { SectionTitle } from "@/components/ui/section-title";
import { CodeInputForm } from "./code-input-form";

const sampleCode = `function calculateTotal(items) {
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
}`;

const leaderboardData = [
	{
		rank: 1,
		rankColor: "text-accent-amber",
		score: "1.2",
		lines: [
			'eval(prompt("enter code"))',
			"document.write(response)",
			"// trust the user lol",
		],
		commentIndex: 2,
		lang: "javascript",
	},
	{
		rank: 2,
		rankColor: "text-text-secondary",
		score: "1.8",
		lines: [
			"if (x == true) { return true; }",
			"else if (x == false) { return false; }",
			"else { return !false; }",
		],
		commentIndex: -1,
		lang: "typescript",
	},
	{
		rank: 3,
		rankColor: "text-text-secondary",
		score: "2.1",
		lines: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"],
		commentIndex: 1,
		lang: "sql",
	},
];

export default async function Home() {
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

			{/* Code Editor Window */}
			<div className="w-[780px] overflow-hidden border border-border-primary bg-bg-input">
				{/* Window Chrome */}
				<div className="flex items-center h-10 px-4 border-b border-border-primary">
					<div className="flex items-center gap-2">
						<span className="block w-3 h-3 rounded-full bg-accent-red" />
						<span className="block w-3 h-3 rounded-full bg-accent-amber" />
						<span className="block w-3 h-3 rounded-full bg-accent-green" />
					</div>
				</div>

				{/* Code Content */}
				<div className="flex h-[360px]">
					{/* Line Numbers */}
					<div className="flex flex-col items-end gap-2 py-4 px-3 w-12 bg-bg-surface border-r border-border-primary shrink-0">
						{sampleCode.split("\n").map((_, i) => {
							const lineNum = i + 1;
							return (
								<span
									key={`ln-${lineNum}`}
									className="font-mono text-xs text-text-tertiary leading-[1.7]"
								>
									{lineNum}
								</span>
							);
						})}
					</div>

					{/* Code */}
					<CodeBlock
						code={sampleCode}
						language="javascript"
						className="border-none rounded-none bg-bg-input flex-1 [&_pre]:leading-[1.7]"
					/>
				</div>
			</div>

			{/* Actions Bar */}
			<CodeInputForm />

			{/* Footer Stats */}
			<div className="flex items-center justify-center gap-6">
				<span className="font-body text-xs text-text-tertiary">
					2,847 codes roasted
				</span>
				<span className="font-mono text-xs text-text-tertiary">·</span>
				<span className="font-body text-xs text-text-tertiary">
					avg score: 4.2/10
				</span>
			</div>

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

				{/* Table */}
				<div className="flex flex-col border border-border-primary w-full">
					{/* Table Header */}
					<div className="flex items-center h-10 px-5 bg-bg-surface border-b border-border-primary">
						<span className="w-[50px] font-mono text-xs font-medium text-text-tertiary">
							#
						</span>
						<span className="w-[70px] font-mono text-xs font-medium text-text-tertiary">
							score
						</span>
						<span className="flex-1 font-mono text-xs font-medium text-text-tertiary">
							code
						</span>
						<span className="w-[100px] font-mono text-xs font-medium text-text-tertiary">
							lang
						</span>
					</div>

					{/* Rows */}
					{leaderboardData.map((row, idx) => (
						<div
							key={row.rank}
							className={`flex items-start px-5 py-4 ${
								idx < leaderboardData.length - 1
									? "border-b border-border-primary"
									: ""
							}`}
						>
							<span className={`w-[50px] font-mono text-xs ${row.rankColor}`}>
								{row.rank}
							</span>
							<span className="w-[70px] font-mono text-xs font-bold text-accent-red">
								{row.score}
							</span>
							<div className="flex flex-col gap-[3px] flex-1">
								{row.lines.map((line, lineIdx) => (
									<span
										key={line}
										className={`font-mono text-xs ${
											lineIdx === row.commentIndex
												? "text-[#8B8B8B]"
												: "text-text-primary"
										}`}
									>
										{line}
									</span>
								))}
							</div>
							<span className="w-[100px] font-mono text-xs text-text-secondary">
								{row.lang}
							</span>
						</div>
					))}
				</div>

				{/* Fade Hint */}
				<p className="text-center font-body text-xs text-text-tertiary py-4">
					{"showing top 3 of 2,847 · view full leaderboard >>"}
				</p>
			</section>

			{/* Bottom Padding */}
			<div className="h-16" />
		</main>
	);
}
