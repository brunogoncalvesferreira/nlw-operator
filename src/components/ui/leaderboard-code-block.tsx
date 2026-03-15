import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { twMerge } from "tailwind-merge";

type LeaderboardCodeBlockProps = {
	code: string;
	language: BundledLanguage;
	className?: string;
};

async function LeaderboardCodeBlock({
	code,
	language,
	className,
}: LeaderboardCodeBlockProps) {
	const lines = code.split("\n");

	const html = await codeToHtml(code, {
		lang: language,
		theme: "vesper",
	});

	return (
		<div
			className={twMerge(
				"flex overflow-hidden border border-border-primary bg-bg-input",
				className,
			)}
		>
			{/* Line Numbers Gutter */}
			<div className="flex flex-col gap-1.5 bg-bg-surface px-2.5 py-3.5 border-r border-border-primary w-10 shrink-0 items-end">
				{lines.map((line, idx) => (
					<span
						key={`ln-${line}`}
						className="font-mono text-xs text-text-tertiary leading-[1.3]"
					>
						{idx + 1}
					</span>
				))}
			</div>

			{/* Code Content */}
			<div
				className="flex-1 py-3.5 px-4 font-mono text-xs overflow-x-auto [&_pre]:m-0 [&_pre]:p-0 [&_pre]:bg-transparent [&_code]:bg-transparent [&_.line]:leading-[1.3] [&_.line+.line]:mt-1.5"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: shiki outputs sanitized HTML for syntax highlighting
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
}

export { LeaderboardCodeBlock, type LeaderboardCodeBlockProps };
