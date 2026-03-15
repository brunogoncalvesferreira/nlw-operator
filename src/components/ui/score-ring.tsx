import { type ComponentProps, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type ScoreRingProps = ComponentProps<"div"> & {
	className?: string;
	score: number;
	max?: number;
};

const ScoreRing = forwardRef<HTMLDivElement, ScoreRingProps>(
	({ score, max = 10, className, ...props }, ref) => {
		const size = 180;
		const strokeWidth = 4;
		const radius = (size - strokeWidth) / 2;
		const circumference = 2 * Math.PI * radius;
		const percentage = Math.min(score / max, 1);
		const strokeDashoffset = circumference * (1 - percentage);

		return (
			<div
				ref={ref}
				className={twMerge(
					"relative inline-flex items-center justify-center",
					className,
				)}
				style={{ width: size, height: size }}
				{...props}
			>
				<svg
					width={size}
					height={size}
					viewBox={`0 0 ${size} ${size}`}
					className="absolute inset-0 -rotate-90"
					aria-hidden="true"
				>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke="#2A2A2A"
						strokeWidth={strokeWidth}
					/>
					<defs>
						<linearGradient
							id="score-gradient"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="0%"
						>
							<stop offset="0%" stopColor="#10B981" />
							<stop offset="100%" stopColor="#F59E0B" />
						</linearGradient>
					</defs>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke="url(#score-gradient)"
						strokeWidth={strokeWidth}
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
					/>
				</svg>

				<div className="flex flex-col items-center justify-center gap-0.5">
					<span className="font-mono text-5xl font-bold leading-none text-[#FAFAFA]">
						{score}
					</span>
					<span className="font-mono text-base text-[#4B5563]">/{max}</span>
				</div>
			</div>
		);
	},
);

ScoreRing.displayName = "ScoreRing";

export { ScoreRing, type ScoreRingProps };
