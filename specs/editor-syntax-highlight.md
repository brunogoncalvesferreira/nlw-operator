# Editor com Syntax Highlight — Spec

## Contexto

O devroast precisa de um editor de codigo na homepage onde o usuario cola um trecho de codigo,
recebe syntax highlighting automatico com deteccao de linguagem, e pode opcionalmente selecionar
a linguagem manualmente. O editor e **paste-only** — o foco e colar codigo, nao editar.

### Requisitos

- Aceitar codigo colado (paste) com highlight aplicado em tempo real
- Auto-detectar a linguagem do codigo colado
- Permitir selecao manual de linguagem (override do auto-detect)
- Tema unico: Vesper (ja usado no projeto via shiki)
- Sem limite rigido de tamanho, mas o caso de uso principal sao snippets
- Client component (`"use client"`) — precisa de estado e eventos do browser

---

## Pesquisa: Abordagens Avaliadas

### 1. Textarea Overlay + Shiki (abordagem do ray-so) — RECOMENDADA

**Como funciona:** Um `<textarea>` transparente sobreposto a um `<pre>` com o HTML gerado pelo shiki.
O usuario interage com o textarea nativo (paste, selecao, scroll), mas visualmente ve o codigo
com syntax highlighting renderizado por baixo.

**Referencia:** [raycast/ray-so](https://github.com/raycast/ray-so) usa exatamente essa abordagem:
- `<textarea>` com `z-index: 2`, `background: transparent`, `-webkit-text-fill-color: transparent`
- `<pre>` com output do `shiki.codeToHtml()` por tras, compartilhando o mesmo grid cell via CSS Grid
- Ambos com font/size/line-height/padding identicos para alinhamento pixel-perfect
- Keyboard handling customizado (Tab insere espacos, Enter auto-indenta, etc.)

**Vantagens:**
- Bundle minimo (~60-80 KB gz total com shiki JS engine)
- Highlighting identico ao VS Code (TextMate grammars)
- Tema Vesper ja disponivel no shiki (zero trabalho extra)
- 200+ linguagens suportadas com lazy-loading
- Textarea nativo = paste, undo/redo, selecao, IME, mobile tudo funciona nativamente
- Sem dependencia pesada de editor

**Desvantagens:**
- Precisa garantir alinhamento pixel-perfect entre textarea e pre (mesma font, size, line-height)
- Sem features de IDE (autocomplete, bracket matching, etc.) — irrelevante pro nosso caso
- Custom undo stack necessario se manipular o valor programaticamente

**Pacote existente:** `react-simple-code-editor` (3.4 KB gz) implementa esse pattern, mas esta sem
update ha 2 anos. Dado que o pattern e simples (~200 linhas), vale mais construir do zero com
controle total.

| Metrica | Valor |
|---|---|
| Bundle total estimado | ~60-80 KB gz |
| Complexidade de implementacao | Media |
| Qualidade do highlight | Identica ao VS Code |
| Compatibilidade React 19 | Total (textarea nativo) |
| Mobile support | Nativo |

---

### 2. CodeMirror 6 (@uiw/react-codemirror)

**Como funciona:** Editor completo com parser incremental (Lezer), DOM virtual proprio, e sistema
de extensoes. Wrapper React disponivel via `@uiw/react-codemirror`.

**Vantagens:**
- Editor full-featured (cursor, selecao, bracket matching, autocomplete)
- API React madura e bem mantida (1.68M downloads/semana)
- Funciona com React 19

**Desvantagens:**
- **Bundle 3-4x maior:** ~170-200 KB gz (vs ~60-80 KB com shiki)
- Sem auto-deteccao de linguagem (precisaria de lib externa igual)
- Apenas ~20 linguagens oficiais (vs 200+ do shiki)
- Tema Vesper nao existe para CodeMirror — precisaria portar manualmente
- Overhead de editor completo para um caso de uso paste-only
- Client-only: sem SSR, flash de conteudo nao-estilizado no carregamento
- Sistema de highlighting proprio (Lezer) com granularidade menor que TextMate

| Metrica | Valor |
|---|---|
| Bundle total estimado | ~170-200 KB gz |
| Complexidade de implementacao | Baixa (wrapper pronto) |
| Qualidade do highlight | Boa, mas inferior ao VS Code/shiki |
| Compatibilidade React 19 | Sim |
| Mobile support | Sim |

**Veredicto:** Overkill. Estamos pagando 3-4x o bundle por features de editor que nao precisamos.

---

### 3. Monaco Editor (@shikijs/monaco)

**Como funciona:** O editor do VS Code no browser. `@shikijs/monaco` permite usar grammars
TextMate do shiki dentro do Monaco, combinando o melhor dos dois.

**Vantagens:**
- Experiencia identica ao VS Code
- Highlighting perfeito com TextMate grammars via shiki
- Todas as features de IDE (autocomplete, go-to-definition, etc.)

**Desvantagens:**
- **Bundle enorme:** ~2-3 MB gz
- Absurdamente overkill para paste-only
- Tempo de carregamento inaceitavel para uma homepage
- Requer web workers para funcionar
- Setup complexo com Next.js

| Metrica | Valor |
|---|---|
| Bundle total estimado | ~2-3 MB gz |
| Complexidade de implementacao | Alta |
| Qualidade do highlight | Perfeita |
| Compatibilidade React 19 | Sim (com config) |
| Mobile support | Limitado |

**Veredicto:** Totalmente desproporcional. Descartado.

---

### Tabela Comparativa Final

| Criterio | Textarea+Shiki | CodeMirror 6 | Monaco |
|---|---|---|---|
| Bundle size (gz) | ~60-80 KB | ~170-200 KB | ~2-3 MB |
| Highlight quality | VS Code identico | Boa | VS Code identico |
| Tema Vesper | Nativo | Port manual | Nativo (via shiki) |
| Linguagens | 200+ | ~20 | 200+ (via shiki) |
| Auto-detect | Via lib externa | Via lib externa | Via lib externa |
| Setup complexity | Media | Baixa | Alta |
| Mobile | Nativo | Sim | Limitado |
| SSR fallback | Sim (shiki server) | Nao | Nao |

---

## Decisao: Textarea Overlay + Shiki

A abordagem do ray-so (textarea overlay + shiki) e a escolha certa para o devroast:

1. **Ja temos shiki** no projeto (v4.0.2) com o tema Vesper configurado
2. **Paste-only** nao justifica o peso de um editor completo
3. **Bundle minimo** — importante para uma homepage que precisa carregar rapido
4. **200+ linguagens** com lazy-loading, sem instalar pacotes extras
5. **SSR fallback** — podemos renderizar o estado inicial com shiki no servidor

---

## Deteccao de Linguagem

### Opcoes Avaliadas

**highlight.js (`hljs.highlightAuto`):**
- Funciona rodando o highlighting contra todas as linguagens registradas e retornando a de maior score
- Nao existe modo "detection-only" — e highlighting completo
- Bundle: 297 KB gz (todas as linguagens) ou ~30-50 KB gz (subset de 10 linguagens)
- ray-so usa essa abordagem

**Heuristica customizada (keyword-based):**
- Funcao simples (~1-2 KB) que checa patterns conhecidos (`import`, `def`, `func`, `<?php`, `#include`, etc.)
- Zero bundle adicional
- Menos precisa, mas suficiente para os casos mais comuns
- Pode ser complementada com a selecao manual

**Recomendacao:** Usar **highlight.js com subset limitado** (~15-20 linguagens mais comuns). O custo
de ~30-40 KB gz e aceitavel pela precisao significativamente maior. Complementar com selecao manual
para linguagens fora do subset.

### Linguagens Prioritarias para Auto-Detect

JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, HTML,
CSS, Shell/Bash, YAML, JSON, Markdown.

---

## Especificacao de Implementacao

### Arquitetura

```
src/
  components/
    ui/
      code-editor/
        index.tsx              # Exporta o CodeEditor (barrel)
        code-editor.tsx        # Client component principal
        use-shiki-highlighter.ts  # Hook: inicializa shiki no browser (JS engine)
        use-language-detect.ts    # Hook: auto-detect com highlight.js
        languages.ts           # Mapa de linguagens suportadas + lazy imports
        editor.css             # Estilos do overlay (grid, textarea transparente)
```

### Componente: `<CodeEditor />`

```
Props:
  - value: string              # Codigo atual
  - onChange: (code: string) => void
  - language?: string          # Override manual de linguagem (opcional)
  - onLanguageDetected?: (lang: string) => void  # Callback quando auto-detect roda
  - placeholder?: string       # Texto placeholder quando vazio
  - className?: string
```

**Comportamento:**
1. Renderiza um CSS Grid com `<textarea>` e `<pre>` sobrepostos
2. No paste/input, atualiza o valor e dispara auto-detect
3. Auto-detect roda com debounce (~300ms) apos o input parar
4. Se `language` prop for passado, usa como override (ignora auto-detect)
5. O `<pre>` recebe o HTML do shiki via `codeToHtml()` com tema Vesper
6. Line numbers renderizados em gutter separado a esquerda

### Hook: `useShikiHighlighter`

```
- Inicializa shiki com `createHighlighterCore` + engine JavaScript (sem WASM)
- Pre-carrega tema Vesper + 5 linguagens mais comuns (js, ts, python, html, css)
- Demais linguagens sao lazy-loaded sob demanda
- Retorna: { highlighter, highlight(code, lang), isReady }
```

### Hook: `useLanguageDetect`

```
- Importa highlight.js/lib/core + registra ~20 linguagens
- Expoe: detectLanguage(code: string) => { language: string, confidence: number }
- Debounce interno de 300ms
- Retorna 'plaintext' se confianca < threshold
```

### Selecao Manual de Linguagem

Na homepage, adicionar um seletor (dropdown/combobox) ao lado do editor que permite:
- Ver a linguagem auto-detectada como valor default
- Selecionar manualmente qualquer linguagem suportada
- Opcao "Auto-Detect" para resetar ao comportamento automatico

---

## Dependencias Novas

| Pacote | Proposito | Bundle (gz) |
|---|---|---|
| `highlight.js` | Auto-detect de linguagem (core + subset) | ~30-40 KB |

**Nota:** shiki ja esta instalado (v4.0.2). Nenhuma outra dependencia nova necessaria.

---

## Gotchas e Cuidados na Implementacao

### Alinhamento Pixel-Perfect (Critico)
- `<textarea>` e `<pre>` DEVEM compartilhar exatamente: `font-family`, `font-size`, `line-height`,
  `letter-spacing`, `padding`, `tab-size`, `white-space`, `word-break`
- Shiki por default aplica inline styles nos tokens — isso e so `color`, nao afeta layout
- Testar em Chrome, Firefox, Safari — rendering de fonts pode ter diferencas sub-pixel

### Mobile
- `<textarea>` nativo funciona bem em mobile (zoom, teclado virtual, selecao)
- Garantir que o container tem altura minima e max-height com scroll
- Testar paste no iOS Safari (pode ter quirks com `clipboardData`)

### Performance
- Re-highlighting a cada keystroke pode ser pesado para codigos grandes
- Usar `requestAnimationFrame` ou debounce de ~50-100ms no highlighting (nao no auto-detect que ja tem 300ms)
- Para o caso de uso paste-only, o codigo e colado de uma vez, entao so precisa highlightar 1x

### IME (Input Method Editor)
- Verificar `event.isComposing` antes de manipular o valor do textarea programaticamente
- Relevante para usuarios com teclados CJK ou acentos compostos

### Acessibilidade
- `<textarea>` deve ter `aria-label` descritivo
- O `<pre>` de highlight deve ter `aria-hidden="true"` (e decorativo)
- Tab key: decidir se captura Tab (insere espacos) ou deixa navegacao nativa
  - Recomendacao: nao capturar Tab, ja que e paste-only. Manter navegacao nativa.

### SSR / Hydration
- O editor e um client component — no servidor, renderizar um placeholder ou estado vazio
- O `<CodeBlock>` existente (server component) pode ser usado como fallback visual durante carregamento
- shiki no browser precisa inicializar (carregar engine + tema + langs) — mostrar estado de loading

---

## TODOs de Implementacao

- [ ] Criar o hook `useShikiHighlighter` que inicializa shiki no browser com JS engine (sem WASM)
- [ ] Criar o hook `useLanguageDetect` com highlight.js (core + subset de ~20 langs)
- [ ] Criar o componente `<CodeEditor />` com textarea overlay pattern
- [ ] Garantir alinhamento pixel-perfect textarea/pre (font metrics identicas)
- [ ] Adicionar gutter com line numbers sincronizado com scroll
- [ ] Adicionar placeholder visual quando o editor esta vazio
- [ ] Integrar auto-detect: no paste, detectar linguagem e aplicar highlight
- [ ] Criar seletor de linguagem (dropdown/combobox) na homepage
- [ ] Conectar seletor de linguagem ao editor (override manual vs auto-detect)
- [ ] Substituir o bloco de codigo estatico da homepage pelo novo `<CodeEditor />`
- [ ] Atualizar o `<CodeInputForm>` para receber o codigo do editor
- [ ] Testar em Chrome, Firefox, Safari (desktop + mobile)
- [ ] Testar paste de codigo grande (500+ linhas) — verificar performance
- [ ] Rodar `npx next build` + `npx biome check` sem erros

---

## Referencias

- [ray-so source code](https://github.com/raycast/ray-so) — implementacao de referencia do textarea overlay
- [shiki docs](https://shiki.style) — highlighting engine
- [shiki JS engine](https://shiki.style/guide/regex-engines#javascript-regexp-engine) — alternativa sem WASM
- [highlight.js auto-detect](https://highlightjs.readthedocs.io/en/latest/api.html#highlight-auto) — deteccao de linguagem
- [react-simple-code-editor](https://github.com/react-simple-code-editor/react-simple-code-editor) — referencia do pattern (nao usar diretamente, esta abandonado)
