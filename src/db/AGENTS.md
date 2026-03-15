# Banco de Dados — Drizzle ORM + PostgreSQL

## Stack

- **Drizzle ORM** (`drizzle-orm` + `drizzle-orm/postgres-js`)
- **postgres.js** (driver PostgreSQL)
- **PostgreSQL** como banco

## Conexao

`src/db/index.ts` exporta uma instancia `db` do Drizzle. Usa `casing: "snake_case"` para mapear camelCase do TypeScript para snake_case no banco automaticamente.

```ts
import { db } from "@/db";
```

A `DATABASE_URL` vem de `.env` (NAO commitado).

## Schema

`src/db/schema.ts` define todas as tabelas, enums e indexes.

### Convencoes

- IDs sao `uuid().primaryKey().defaultRandom()` — nunca gerar IDs manualmente
- Timestamps usam `timestamp().notNull().defaultNow()` para `createdAt`
- Enums PostgreSQL definidos com `pgEnum` (ex: `issueSeverityEnum`, `diffLineTypeEnum`)
- Foreign keys usam `references(() => tabela.id, { onDelete: "cascade" })`
- Campos de ordenacao manual usam coluna `order: integer().notNull().default(0)`
- Indexes definidos no terceiro argumento do `pgTable`

### Tabelas atuais

| Tabela | Descricao |
|---|---|
| `roasts` | Roast principal (code, language, score, roastQuote, etc.) |
| `roastIssues` | Issues encontradas no codigo (severity, title, description) |
| `roastDiffLines` | Linhas do diff sugerido (type: removed/added/context, content) |

## Queries

Funcoes de query ficam em `src/db/queries/`. Um arquivo por dominio (ex: `roasts.ts`).

### Convencoes

- Funcoes exportadas como `async function` com nomes descritivos (`getStats`, `getRoastById`, `getLeaderboard`, `createRoast`)
- Funcoes de leitura retornam o dado ja formatado (ex: `avgScore` parseado para number)
- Funcoes de escrita complexas usam `db.transaction()` para consistencia
- Queries NAO sao acessadas direto pelas pages — sempre passam por um procedure tRPC

### Padrao de transaction (escrita multi-tabela)

```ts
export async function createRoast(input: CreateRoastInput) {
  return db.transaction(async (tx) => {
    const [roast] = await tx.insert(roasts).values(input.roast).returning();

    if (input.issues.length > 0) {
      await tx.insert(roastIssues).values(
        input.issues.map((issue, idx) => ({
          ...issue,
          roastId: roast.id,
          order: idx,
        })),
      );
    }

    return roast;
  });
}
```

### Padrao de leitura com relacoes

Queries de detalhe (ex: `getRoastById`) fazem queries separadas para cada tabela relacionada e retornam um objeto composto:

```ts
const [roast] = await db.select().from(roasts).where(eq(roasts.id, id));
const issues = await db.select().from(roastIssues).where(eq(roastIssues.roastId, id));
const diffLines = await db.select().from(roastDiffLines).where(eq(roastDiffLines.roastId, id));
return { ...roast, issues, diffLines };
```

NAO usamos `relations` do Drizzle (query builder relacional). Queries manuais sao mais explicitas.

## Seed

`src/db/seed.ts` popula o banco para desenvolvimento. Executar com `npx tsx src/db/seed.ts`.
