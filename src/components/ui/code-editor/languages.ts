type LanguageDefinition = {
	label: string;
	value: string;
	shikiLang: string;
	shikiImport: () => Promise<Record<string, unknown>>;
};

const LANGUAGES: LanguageDefinition[] = [
	{
		label: "JavaScript",
		value: "javascript",
		shikiLang: "javascript",
		shikiImport: () => import("@shikijs/langs/javascript"),
	},
	{
		label: "TypeScript",
		value: "typescript",
		shikiLang: "typescript",
		shikiImport: () => import("@shikijs/langs/typescript"),
	},
	{
		label: "Python",
		value: "python",
		shikiLang: "python",
		shikiImport: () => import("@shikijs/langs/python"),
	},
	{
		label: "Java",
		value: "java",
		shikiLang: "java",
		shikiImport: () => import("@shikijs/langs/java"),
	},
	{
		label: "C",
		value: "c",
		shikiLang: "c",
		shikiImport: () => import("@shikijs/langs/c"),
	},
	{
		label: "C++",
		value: "cpp",
		shikiLang: "cpp",
		shikiImport: () => import("@shikijs/langs/cpp"),
	},
	{
		label: "C#",
		value: "csharp",
		shikiLang: "csharp",
		shikiImport: () => import("@shikijs/langs/csharp"),
	},
	{
		label: "Go",
		value: "go",
		shikiLang: "go",
		shikiImport: () => import("@shikijs/langs/go"),
	},
	{
		label: "Rust",
		value: "rust",
		shikiLang: "rust",
		shikiImport: () => import("@shikijs/langs/rust"),
	},
	{
		label: "Ruby",
		value: "ruby",
		shikiLang: "ruby",
		shikiImport: () => import("@shikijs/langs/ruby"),
	},
	{
		label: "PHP",
		value: "php",
		shikiLang: "php",
		shikiImport: () => import("@shikijs/langs/php"),
	},
	{
		label: "Swift",
		value: "swift",
		shikiLang: "swift",
		shikiImport: () => import("@shikijs/langs/swift"),
	},
	{
		label: "Kotlin",
		value: "kotlin",
		shikiLang: "kotlin",
		shikiImport: () => import("@shikijs/langs/kotlin"),
	},
	{
		label: "SQL",
		value: "sql",
		shikiLang: "sql",
		shikiImport: () => import("@shikijs/langs/sql"),
	},
	{
		label: "HTML",
		value: "xml",
		shikiLang: "html",
		shikiImport: () => import("@shikijs/langs/html"),
	},
	{
		label: "CSS",
		value: "css",
		shikiLang: "css",
		shikiImport: () => import("@shikijs/langs/css"),
	},
	{
		label: "Shell",
		value: "bash",
		shikiLang: "shellscript",
		shikiImport: () => import("@shikijs/langs/shellscript"),
	},
	{
		label: "YAML",
		value: "yaml",
		shikiLang: "yaml",
		shikiImport: () => import("@shikijs/langs/yaml"),
	},
	{
		label: "JSON",
		value: "json",
		shikiLang: "json",
		shikiImport: () => import("@shikijs/langs/json"),
	},
	{
		label: "Markdown",
		value: "markdown",
		shikiLang: "markdown",
		shikiImport: () => import("@shikijs/langs/markdown"),
	},
];

function getLanguageByValue(value: string): LanguageDefinition | undefined {
	return LANGUAGES.find((lang) => lang.value === value);
}

function getLanguageLabel(value: string): string {
	return getLanguageByValue(value)?.label ?? value;
}

export type { LanguageDefinition };
export { getLanguageByValue, getLanguageLabel, LANGUAGES };
