import { type ComponentProps, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const sectionTitleVariants = tv({
	base: "inline-flex items-center gap-2 font-mono text-sm font-bold",
	variants: {
		size: {
			sm: "text-sm",
			lg: "text-2xl",
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

type SectionTitleVariants = VariantProps<typeof sectionTitleVariants>;

type SectionTitleProps = ComponentProps<"div"> &
	SectionTitleVariants & {
		className?: string;
	};

const SectionTitle = forwardRef<HTMLDivElement, SectionTitleProps>(
	({ size, className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={twMerge(sectionTitleVariants({ size }), className)}
				{...props}
			>
				<span className="text-[#10B981]">{"//"}</span>
				<span className="text-[#E5E5E5]">{children}</span>
			</div>
		);
	},
);

SectionTitle.displayName = "SectionTitle";

export { SectionTitle, type SectionTitleProps, sectionTitleVariants };
