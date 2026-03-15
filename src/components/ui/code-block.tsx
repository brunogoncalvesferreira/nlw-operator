import type { BundledLanguage } from 'shiki'
import { codeToHtml } from 'shiki'
import { twMerge } from 'tailwind-merge'

type CodeBlockProps = {
  code: string
  language: BundledLanguage
  className?: string
}

async function CodeBlock({ code, language, className }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang: language,
    theme: 'vesper',
  })

  return (
    <div
      className={twMerge(
        'rounded border border-[#2A2A2A] bg-bg-input font-mono text-[13px] overflow-auto [&_pre]:p-4 [&_pre]:m-0 [&_code]:bg-transparent',
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki outputs sanitized HTML for syntax highlighting
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export { CodeBlock, type CodeBlockProps }
