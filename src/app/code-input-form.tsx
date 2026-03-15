"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

export function CodeInputForm() {
	const [roastMode, setRoastMode] = useState(true);

	return (
		<div className="flex items-center justify-between w-[780px]">
			<div className="flex items-center gap-4">
				<Toggle
					checked={roastMode}
					onCheckedChange={setRoastMode}
					label="roast mode"
				/>
				<span className="font-body text-xs text-text-tertiary">
					{"// maximum sarcasm enabled"}
				</span>
			</div>
			<Button variant="primary" size="md">
				$ roast_my_code
			</Button>
		</div>
	);
}
