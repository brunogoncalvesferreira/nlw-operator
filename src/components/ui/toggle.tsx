import { Switch } from "@base-ui/react/switch";
import { twMerge } from "tailwind-merge";

type ToggleProps = Switch.Root.Props & {
	className?: string;
	label?: string;
};

function Toggle({ checked, label, className, ...props }: ToggleProps) {
	return (
		<div
			className={twMerge(
				"inline-flex items-center gap-3 cursor-pointer select-none font-mono text-xs transition-colors",
				className,
			)}
		>
			<Switch.Root
				checked={checked}
				className="flex items-center w-10 h-[22px] rounded-[11px] p-[3px] transition-colors bg-[#2A2A2A] data-[checked]:justify-end data-[checked]:bg-[#10B981]"
				{...props}
			>
				<Switch.Thumb className="block w-4 h-4 rounded-full transition-colors bg-[#6B7280] data-[checked]:bg-[#0A0A0A]" />
			</Switch.Root>
			{label && <span className="text-[#6B7280]">{label}</span>}
		</div>
	);
}

export { Toggle, type ToggleProps };
