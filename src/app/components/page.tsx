import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { SectionTitle } from "@/components/ui/section-title";
import { ToggleShowcase } from "./toggle-showcase";

const buttonVariantList = ["primary", "secondary", "link", "danger"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

const sampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; ...) {
    total = total + items[i].price;
  }
}`;

export default function ComponentsPage() {
	return (
		<div className="min-h-screen bg-[#0A0A0A] p-12 space-y-16">
			<SectionTitle size="lg">component_library</SectionTitle>

			{/* Buttons */}
			<section className="space-y-6">
				<SectionTitle>buttons</SectionTitle>
				<div className="space-y-8">
					{buttonVariantList.map((variant) => (
						<div key={variant} className="space-y-3">
							<h3 className="text-sm font-mono text-[#4B5563]">
								variant=&quot;{variant}&quot;
							</h3>
							<div className="flex items-center gap-4">
								{buttonSizes.map((size) => (
									<Button key={size} variant={variant} size={size}>
										{size}
									</Button>
								))}
								<Button variant={variant} disabled>
									disabled
								</Button>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Toggle */}
			<section className="space-y-6">
				<SectionTitle>toggle</SectionTitle>
				<ToggleShowcase />
			</section>

			{/* Badge */}
			<section className="space-y-6">
				<SectionTitle>badge_status</SectionTitle>
				<div className="flex items-center gap-6">
					<Badge variant="critical">critical</Badge>
					<Badge variant="warning">warning</Badge>
					<Badge variant="good">good</Badge>
					<Badge variant="critical">needs_serious_help</Badge>
				</div>
			</section>

			{/* Code Block */}
			<section className="space-y-6">
				<SectionTitle>code_block</SectionTitle>
				<CodeBlock
					code={sampleCode}
					language="javascript"
					className="w-[560px]"
				/>
			</section>

			{/* Diff Line */}
			<section className="space-y-6">
				<SectionTitle>diff_line</SectionTitle>
				<div className="flex flex-col w-[560px]">
					<DiffLine type="removed" code="var total = 0;" />
					<DiffLine type="added" code="const total = 0;" />
					<DiffLine
						type="context"
						code="for (let i = 0; i < items.length; i++) {"
					/>
				</div>
			</section>

			{/* Score Ring */}
			<section className="space-y-6">
				<SectionTitle>score_ring</SectionTitle>
				<div className="flex items-center gap-8">
					<ScoreRing score={3.5} />
					<ScoreRing score={7.2} />
					<ScoreRing score={2.1} />
				</div>
			</section>
		</div>
	);
}
