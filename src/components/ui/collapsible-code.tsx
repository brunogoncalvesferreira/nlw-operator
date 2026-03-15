"use client";

import { type ComponentProps, forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

type CollapsibleCodeProps = ComponentProps<"div"> & {
	className?: string;
	totalLines: number;
	collapsedLines?: number;
};

const CollapsibleCode = forwardRef<HTMLDivElement, CollapsibleCodeProps>(
	({ totalLines, collapsedLines = 3, className, children, ...props }, ref) => {
		const [expanded, setExpanded] = useState(false);
		const isCollapsible = totalLines > collapsedLines;

		// Each line: leading-[1.3] = 1.3 * 12px(text-xs) ≈ 15.6px
		// Gap between lines: mt-1.5 = 6px (but gutter uses gap-1.5 = 6px)
		// Padding: py-3.5 = 14px top + 14px bottom
		// Line height with gap: ~21.6px per line, first line no gap
		// Collapsed height: 14px(top) + collapsedLines * 15.6px + (collapsedLines - 1) * 6px + 14px(bottom)
		const collapsedHeight =
			14 + collapsedLines * 15.6 + (collapsedLines - 1) * 6 + 14;

		return (
			<div ref={ref} className={twMerge("relative", className)} {...props}>
				<div
					className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
					style={
						isCollapsible && !expanded
							? { maxHeight: `${collapsedHeight}px` }
							: undefined
					}
				>
					{children}
				</div>

				{isCollapsible && (
					<button
						type="button"
						onClick={() => setExpanded((prev) => !prev)}
						className={twMerge(
							"flex items-center justify-center w-full h-8 font-mono text-xs cursor-pointer transition-colors",
							"border-t border-border-primary bg-bg-surface text-text-tertiary hover:text-text-secondary",
						)}
					>
						{expanded ? "$ collapse ↑" : `$ show all ${totalLines} lines ↓`}
					</button>
				)}
			</div>
		);
	},
);

CollapsibleCode.displayName = "CollapsibleCode";

export { CollapsibleCode, type CollapsibleCodeProps };
