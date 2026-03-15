import { type ComponentProps, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
	base: "inline-flex items-center justify-center gap-2 font-mono cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50",
	variants: {
		variant: {
			primary:
				"bg-[#10B981] text-[#0A0A0A] font-medium text-[13px] hover:bg-[#34D399]",
			secondary:
				"bg-transparent text-[#FAFAFA] font-normal text-xs border border-[#2A2A2A] hover:bg-[#2A2A2A]/50",
			link: "bg-transparent text-[#6B7280] font-normal text-xs border border-[#2A2A2A] hover:text-[#FAFAFA]",
			danger:
				"bg-[#EF4444] text-[#0A0A0A] font-medium text-[13px] hover:bg-[#F87171]",
		},
		size: {
			sm: "px-3 py-1.5",
			md: "px-4 py-2",
			lg: "px-6 py-2.5",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
	},
});

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = ComponentProps<"button"> &
	ButtonVariants & {
		className?: string;
	};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant, size, className, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={twMerge(buttonVariants({ variant, size }), className)}
				{...props}
			/>
		);
	},
);

Button.displayName = "Button";

export { Button, type ButtonProps, buttonVariants };
