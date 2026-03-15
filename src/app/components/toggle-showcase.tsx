"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export function ToggleShowcase() {
	const [toggleA, setToggleA] = useState(true);
	const [toggleB, setToggleB] = useState(false);

	return (
		<div className="flex items-center gap-8">
			<Toggle
				checked={toggleA}
				onCheckedChange={setToggleA}
				label="roast mode"
			/>
			<Toggle
				checked={toggleB}
				onCheckedChange={setToggleB}
				label="roast mode"
			/>
		</div>
	);
}
