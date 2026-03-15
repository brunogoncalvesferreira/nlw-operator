import type { HLJSApi } from "highlight.js";
import { useCallback, useRef, useState } from "react";

const RELEVANCE_THRESHOLD = 5;
const DEBOUNCE_MS = 300;

function useLanguageDetect() {
	const [detectedLanguage, setDetectedLanguage] = useState("plaintext");
	const hljsRef = useRef<HLJSApi | null>(null);
	const initPromiseRef = useRef<Promise<HLJSApi> | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const initHljs = useCallback(async (): Promise<HLJSApi> => {
		if (hljsRef.current) return hljsRef.current;
		if (initPromiseRef.current) return initPromiseRef.current;

		initPromiseRef.current = (async () => {
			const mod = await import("highlight.js/lib/common");
			const hljs = mod.default;
			hljsRef.current = hljs;
			return hljs;
		})();

		return initPromiseRef.current;
	}, []);

	const runDetection = useCallback(
		async (code: string) => {
			const hljs = await initHljs();

			try {
				const detected = hljs.highlightAuto(code);
				if (detected.language && detected.relevance >= RELEVANCE_THRESHOLD) {
					setDetectedLanguage(detected.language);
				} else {
					setDetectedLanguage("plaintext");
				}
			} catch {
				setDetectedLanguage("plaintext");
			}
		},
		[initHljs],
	);

	const detectLanguage = useCallback(
		(code: string, immediate = false) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			if (!code.trim()) {
				setDetectedLanguage("plaintext");
				return;
			}

			if (immediate) {
				runDetection(code);
				return;
			}

			debounceRef.current = setTimeout(() => {
				runDetection(code);
			}, DEBOUNCE_MS);
		},
		[runDetection],
	);

	return { detectedLanguage, detectLanguage };
}

export { useLanguageDetect };
