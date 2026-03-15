# UI Components — Padroes de Criacao

Guia de referencia para criacao de componentes dentro de `src/components/ui/`.

## Stack

- **tailwind-variants** (`tv`) — definicao de variantes
- **tailwind-merge** (`twMerge`) — merge seguro de classes Tailwind
- **React** (`ComponentProps`, `forwardRef`) — tipagem e ref forwarding

## Regras

### Exports

- Sempre usar **named exports**. Nunca usar `export default`.
- Exportar: o componente, o tipo de props e a funcao de variantes.

```tsx
export { Button, type ButtonProps, buttonVariants };
```

### Tipagem

- Extender as props nativas do elemento HTML correspondente via `ComponentProps<"elemento">`.
- Interseccionar com `VariantProps<typeof variantes>` para tipar as variantes.
- Sempre aceitar `className` para permitir override externo.

```tsx
type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };
```

### forwardRef

- Todo componente deve usar `forwardRef` para encaminhar refs ao elemento nativo.
- Definir `displayName` logo apos a declaracao.

```tsx
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
```

### Variantes com `tv()`

- Definir `base` com classes compartilhadas por todas as variantes.
- Cada eixo de variacao (ex: `variant`, `size`) eh um objeto dentro de `variants`.
- Sempre definir `defaultVariants`.

```tsx
const buttonVariants = tv({
  base: "inline-flex items-center justify-center ...",
  variants: {
    variant: {
      primary: "...",
      secondary: "...",
    },
    size: {
      sm: "...",
      md: "...",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
```

### Classes e merge

- Sempre aplicar `twMerge(variantes({ ... }), className)` no elemento raiz.
- Isso permite que o consumidor sobrescreva qualquer classe via `className`.

### Estilos

- Usar exclusivamente classes Tailwind. Nunca usar inline styles.
- Incluir estados interativos: `hover:`, `disabled:`, `focus-visible:`.
- `disabled` deve ter `pointer-events-none` e `opacity-50`.
- Usar `transition-colors` para transicoes suaves.
- Usar `cursor-pointer` em elementos clicaveis.

## Estrutura de arquivo

```
src/components/ui/
  button.tsx
  AGENTS.md       <- este arquivo
```

Cada componente vive em seu proprio arquivo dentro de `ui/`. Um arquivo por componente.

## Referencia: Button

Veja `button.tsx` como implementacao de referencia que segue todos os padroes acima.
