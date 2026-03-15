"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	CodeEditor,
	getLanguageLabel,
	LANGUAGES,
} from "@/components/ui/code-editor";
import { Toggle } from "@/components/ui/toggle";

export function CodeInputForm() {
	const [code, setCode] = useState("");
	const [roastMode, setRoastMode] = useState(true);
	const [manualLanguage, setManualLanguage] = useState<string | null>(null);
	const [detectedLanguage, setDetectedLanguage] = useState("plaintext");

	const activeLanguage = manualLanguage ?? detectedLanguage;

	const handleLanguageDetected = useCallback((lang: string) => {
		setDetectedLanguage(lang);
	}, []);

	const handleLanguageChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const value = e.target.value;
			setManualLanguage(value === "" ? null : value);
		},
		[],
	);

	return (
		<div className="flex flex-col items-center gap-8">
			{/* Code Editor Window */}
			<div className="w-[780px] overflow-hidden border border-border-primary bg-bg-input">
				{/* Window Chrome */}
				<div className="flex items-center justify-between h-10 px-4 border-b border-border-primary">
					<div className="flex items-center gap-2">
						<span className="block w-3 h-3 rounded-full bg-accent-red" />
						<span className="block w-3 h-3 rounded-full bg-accent-amber" />
						<span className="block w-3 h-3 rounded-full bg-accent-green" />
					</div>
					{code.trim() && (
						<span className="font-mono text-xs text-text-tertiary">
							{getLanguageLabel(activeLanguage)}
						</span>
					)}
				</div>

				{/* Code Editor */}
				<CodeEditor
					value={code}
					onChange={setCode}
					language={manualLanguage}
					onLanguageDetected={handleLanguageDetected}
				/>
			</div>

			{/* Actions Bar */}
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

				<div className="flex items-center gap-3">
					{/* Language Selector */}
					<select
						value={manualLanguage ?? ""}
						onChange={handleLanguageChange}
						className="h-8 px-3 font-mono text-xs text-text-secondary bg-transparent border border-border-primary outline-none cursor-pointer hover:text-text-primary hover:border-text-secondary transition-colors appearance-none"
					>
						<option value="" className="bg-bg-surface">
							auto-detect
						</option>
						{LANGUAGES.map((lang) => (
							<option
								key={lang.value}
								value={lang.value}
								className="bg-bg-surface"
							>
								{lang.label}
							</option>
						))}
					</select>

					<Button variant="primary" size="md">
						$ roast_my_code
					</Button>
				</div>
			</div>
		</div>
	);
}
