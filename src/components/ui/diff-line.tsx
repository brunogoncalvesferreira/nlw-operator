import { type ComponentProps, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
	base: "flex items-center gap-2 font-mono text-[13px] px-4 py-2 w-full",
	variants: {
		type: {
			removed: "bg-[#1A0A0A] text-[#6B7280]",
			added: "bg-[#0A1A0F] text-[#FAFAFA]",
			context: "text-[#6B7280]",
		},
	},
	defaultVariants: {
		type: "context",
	},
});

const prefixVariants = tv({
	base: "font-mono text-[13px] select-none",
	variants: {
		type: {
			removed: "text-[#EF4444]",
			added: "text-[#10B981]",
			context: "text-[#4B5563]",
		},
	},
	defaultVariants: {
		type: "context",
	},
});

type DiffLineVariants = VariantProps<typeof diffLineVariants>;

type DiffLineProps = ComponentProps<"div"> &
	DiffLineVariants & {
		className?: string;
		code: string;
	};

const prefixMap = {
	removed: "-",
	added: "+",
	context: " ",
} as const;

const DiffLine = forwardRef<HTMLDivElement, DiffLineProps>(
	({ type = "context", code, className, ...props }, ref) => {
		const resolvedType = type ?? "context";

		return (
			<div
				ref={ref}
				className={twMerge(diffLineVariants({ type }), className)}
				{...props}
			>
				<span className={prefixVariants({ type })}>
					{prefixMap[resolvedType]}
				</span>
				<code>{code}</code>
			</div>
		);
	},
);

DiffLine.displayName = "DiffLine";

export { DiffLine, type DiffLineProps, diffLineVariants };
