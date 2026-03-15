import { useCallback, useEffect, useRef, useState } from "react";
import type { HighlighterCore, LanguageInput } from "shiki/core";
import { getLanguageByValue } from "./languages";

type UseShikiHighlighterReturn = {
	highlight: (code: string, language: string) => string;
	isReady: boolean;
};

function useShikiHighlighter(): UseShikiHighlighterReturn {
	const highlighterRef = useRef<HighlighterCore | null>(null);
	const [isReady, setIsReady] = useState(false);
	const loadingLangsRef = useRef<Set<string>>(new Set());
	const [, setLangVersion] = useState(0);

	useEffect(() => {
		let cancelled = false;

		async function init() {
			const { createHighlighterCore } = await import("shiki/core");
			const { createJavaScriptRegexEngine } = await import(
				"shiki/engine/javascript"
			);

			const highlighter = await createHighlighterCore({
				themes: [import("@shikijs/themes/vesper")],
				langs: [
					import("@shikijs/langs/javascript"),
					import("@shikijs/langs/typescript"),
					import("@shikijs/langs/python"),
					import("@shikijs/langs/css"),
					import("@shikijs/langs/html"),
				],
				engine: createJavaScriptRegexEngine(),
			});

			if (!cancelled) {
				highlighterRef.current = highlighter;
				setIsReady(true);
			}
		}

		init();

		return () => {
			cancelled = true;
		};
	}, []);

	const ensureLanguageLoaded = useCallback(
		async (language: string): Promise<boolean> => {
			const highlighter = highlighterRef.current;
			if (!highlighter) return false;

			const loadedLangs = highlighter.getLoadedLanguages();
			if (loadedLangs.includes(language)) return true;

			if (loadingLangsRef.current.has(language)) return false;

			const langDef = getLanguageByValue(language);
			if (!langDef) return false;

			loadingLangsRef.current.add(language);

			try {
				await highlighter.loadLanguage(
					langDef.shikiImport() as unknown as LanguageInput,
				);
				loadingLangsRef.current.delete(language);
				setLangVersion((v) => v + 1);
				return true;
			} catch {
				loadingLangsRef.current.delete(language);
				return false;
			}
		},
		[],
	);

	const highlight = useCallback(
		(code: string, language: string): string => {
			const highlighter = highlighterRef.current;
			if (!highlighter || !code) return "";

			const langDef = getLanguageByValue(language);
			const shikiLang = langDef?.shikiLang ?? language;

			const loadedLangs = highlighter.getLoadedLanguages();
			if (!loadedLangs.includes(shikiLang)) {
				ensureLanguageLoaded(language);
				return escapeHtml(code);
			}

			try {
				return highlighter.codeToHtml(code, {
					lang: shikiLang,
					theme: "vesper",
				});
			} catch {
				return escapeHtml(code);
			}
		},
		[ensureLanguageLoaded],
	);

	return { highlight, isReady };
}

function escapeHtml(text: string): string {
	return `<pre class="shiki vesper" style="background-color:#101010;color:#ffffff" tabindex="0"><code>${text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")}</code></pre>`;
}

export type { UseShikiHighlighterReturn };
export { useShikiHighlighter };
