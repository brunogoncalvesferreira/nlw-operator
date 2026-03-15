import { type ComponentProps, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const badgeVariants = tv({
	base: "inline-flex items-center gap-2 font-mono text-xs",
	variants: {
		variant: {
			critical: "text-[#EF4444]",
			warning: "text-[#F59E0B]",
			good: "text-[#10B981]",
		},
	},
	defaultVariants: {
		variant: "good",
	},
});

const dotVariants = tv({
	base: "block w-2 h-2 rounded-full",
	variants: {
		variant: {
			critical: "bg-[#EF4444]",
			warning: "bg-[#F59E0B]",
			good: "bg-[#10B981]",
		},
	},
	defaultVariants: {
		variant: "good",
	},
});

type BadgeVariants = VariantProps<typeof badgeVariants>;

type BadgeProps = ComponentProps<"span"> &
	BadgeVariants & {
		className?: string;
	};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
	({ variant, className, children, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={twMerge(badgeVariants({ variant }), className)}
				{...props}
			>
				<span className={dotVariants({ variant })} />
				{children}
			</span>
		);
	},
);

Badge.displayName = "Badge";

export { Badge, type BadgeProps, badgeVariants };
