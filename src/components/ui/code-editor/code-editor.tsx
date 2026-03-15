"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useLanguageDetect } from "./use-language-detect";
import { useShikiHighlighter } from "./use-shiki-highlighter";

type CodeEditorProps = {
	value: string;
	onChange: (code: string) => void;
	language: string | null;
	onLanguageDetected?: (lang: string) => void;
	placeholder?: string;
	className?: string;
};

const SHARED_STYLE =
	"font-mono text-[13px] leading-[1.7] [tab-size:2] whitespace-pre-wrap break-words";

function CodeEditor({
	value,
	onChange,
	language,
	onLanguageDetected,
	placeholder = "// paste your code here...",
	className,
}: CodeEditorProps) {
	const { highlight, isReady } = useShikiHighlighter();
	const { detectedLanguage, detectLanguage } = useLanguageDetect();
	const [highlightedHtml, setHighlightedHtml] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const gutterRef = useRef<HTMLDivElement>(null);
	const hadValueRef = useRef(false);

	const activeLanguage = language ?? detectedLanguage;

	// Notify parent of detected language changes
	useEffect(() => {
		onLanguageDetected?.(detectedLanguage);
	}, [detectedLanguage, onLanguageDetected]);

	// Run language detection when code changes
	useEffect(() => {
		if (!language) {
			const isFirstInput = !hadValueRef.current && value.length > 0;
			if (value.length > 0) {
				hadValueRef.current = true;
			} else {
				hadValueRef.current = false;
			}
			detectLanguage(value, isFirstInput);
		}
	}, [value, language, detectLanguage]);

	// Re-highlight when code, language, or highlighter readiness changes
	useEffect(() => {
		if (!isReady || !value) {
			setHighlightedHtml("");
			return;
		}

		const html = highlight(value, activeLanguage);
		setHighlightedHtml(html);
	}, [value, activeLanguage, isReady, highlight]);

	const handleInput = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			onChange(e.target.value);
		},
		[onChange],
	);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			const pasted = e.clipboardData.getData("text/plain");
			if (pasted && !language) {
				detectLanguage(pasted, true);
			}
		},
		[language, detectLanguage],
	);

	const handleScroll = useCallback(() => {
		const container = scrollContainerRef.current;
		const gutter = gutterRef.current;
		if (container && gutter) {
			gutter.scrollTop = container.scrollTop;
		}
	}, []);

	const lineCount = value ? value.split("\n").length : 1;
	const lineNumbers: number[] = [];
	for (let n = 1; n <= lineCount; n++) {
		lineNumbers.push(n);
	}

	const showHighlight = highlightedHtml && value;
	const showPlainCode = !showHighlight && value;
	const showPlaceholder = !value;

	return (
		<div className={twMerge("flex h-[360px] overflow-hidden", className)}>
			{/* Line Numbers Gutter */}
			<div
				ref={gutterRef}
				className="flex flex-col items-end gap-2 py-4 px-3 w-12 bg-bg-surface border-r border-border-primary shrink-0 overflow-hidden select-none"
				aria-hidden="true"
			>
				{lineNumbers.map((num) => (
					<span
						key={`ln-${num}`}
						className="font-mono text-xs leading-[1.7] text-text-tertiary"
					>
						{num}
					</span>
				))}
			</div>

			{/* Editor Area */}
			<div
				ref={scrollContainerRef}
				className="flex-1 overflow-auto relative"
				onScroll={handleScroll}
			>
				<div className="grid min-h-full min-w-full">
					{/* Highlighted Code Layer */}
					{showHighlight && (
						<div
							className={`${SHARED_STYLE} [grid-area:1/1] pointer-events-none [&_pre]:m-0 [&_pre]:p-4 [&_pre]:bg-transparent [&_pre]:leading-[1.7] [&_code]:bg-transparent [&_.shiki]:bg-transparent`}
							aria-hidden="true"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: shiki outputs sanitized HTML for syntax highlighting
							dangerouslySetInnerHTML={{ __html: highlightedHtml }}
						/>
					)}

					{/* Plain code fallback — visible while shiki is loading */}
					{showPlainCode && (
						<div
							className={`${SHARED_STYLE} [grid-area:1/1] pointer-events-none p-4 text-text-primary`}
							aria-hidden="true"
						>
							{value}
						</div>
					)}

					{/* Placeholder — visible when editor is empty */}
					{showPlaceholder && (
						<div
							className={`${SHARED_STYLE} [grid-area:1/1] pointer-events-none p-4`}
							aria-hidden="true"
						>
							<span className="text-text-tertiary">{placeholder}</span>
						</div>
					)}

					{/* Textarea Layer */}
					<textarea
						ref={textareaRef}
						value={value}
						onChange={handleInput}
						onPaste={handlePaste}
						spellCheck={false}
						autoCorrect="off"
						autoCapitalize="off"
						className={`${SHARED_STYLE} [grid-area:1/1] p-4 bg-transparent text-transparent caret-text-primary resize-none outline-none z-10 [-webkit-text-fill-color:transparent] selection:bg-white/20`}
						aria-label="Code editor - paste or type your code here"
					/>
				</div>
			</div>
		</div>
	);
}

CodeEditor.displayName = "CodeEditor";

export { CodeEditor, type CodeEditorProps };
