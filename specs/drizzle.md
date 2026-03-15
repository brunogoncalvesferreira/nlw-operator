# Drizzle ORM — Especificacao de Implementacao

> Spec gerada a partir do design (Pencil) e do README do projeto devroast.

## Contexto

O devroast permite colar codigo, receber uma analise sarcastica com score (0-10), e visualizar os piores codigos em um leaderboard publico. Cada roast tem uma URL publica (`/roast/:id`) para compartilhamento com OG image dinamica. Nao ha autenticacao — todas as submissions sao anonimas.

---

## Stack de Dados

| Camada       | Tecnologia              |
|-------------|-------------------------|
| ORM         | Drizzle ORM             |
| Banco       | PostgreSQL 16           |
| Infra local | Docker Compose          |
| Migrations  | `drizzle-kit`           |
| Runtime     | Next.js 16 (App Router) |

---

## Enums

```typescript
// src/db/schema.ts

import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Severidade de cada issue encontrado na analise.
 * Derivado do tipo de problema, nao do score geral.
 *
 * - critical: problemas graves (uso de var, SQL injection, etc.)
 * - warning: padroes questionaveis (loop imperativo, magic numbers)
 * - good: pontos positivos identificados no codigo
 */
export const issueSeverityEnum = pgEnum("issue_severity", [
	"critical",
	"warning",
	"good",
]);

/**
 * Tipo da linha no diff de sugestao.
 *
 * - removed: linha original que deve ser removida
 * - added: linha sugerida como melhoria
 * - context: linha inalterada para contexto
 */
export const diffLineTypeEnum = pgEnum("diff_line_type", [
	"removed",
	"added",
	"context",
]);
```

> **Nota**: O `verdict` (ex: `needs_serious_help`) e a cor do score sao **derivados no app** a partir do score numerico. Nao precisam de coluna ou enum no banco.

---

## Tabelas

### 1. `roasts` — Tabela principal de submissions

Armazena cada submission de codigo com seu resultado de analise.

| Coluna         | Tipo                          | Descricao                                        |
|---------------|-------------------------------|--------------------------------------------------|
| `id`          | `uuid` PK, default random     | Identificador unico, usado na URL `/roast/:id`   |
| `code`        | `text` NOT NULL                | Codigo fonte enviado pelo usuario                |
| `language`    | `varchar(50)` NOT NULL         | Linguagem de programacao (ex: "javascript")      |
| `line_count`  | `integer` NOT NULL             | Numero de linhas do codigo enviado               |
| `roast_mode`  | `boolean` NOT NULL default true| Se o modo sarcasmo estava ativo                  |
| `score`       | `real` NOT NULL                | Score de 0.0 a 10.0 (menor = pior codigo)       |
| `roast_quote` | `text` NOT NULL                | Frase sarcastica/descritiva do roast             |
| `diff_code`   | `text`                         | Codigo sugerido completo (versao melhorada)      |
| `created_at`  | `timestamp` NOT NULL default now | Data/hora da submission                        |

```typescript
import { pgTable, uuid, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const roasts = pgTable("roasts", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: text("code").notNull(),
	language: varchar("language", { length: 50 }).notNull(),
	lineCount: integer("line_count").notNull(),
	roastMode: boolean("roast_mode").notNull().default(true),
	score: real("score").notNull(),
	roastQuote: text("roast_quote").notNull(),
	diffCode: text("diff_code"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

**Indices:**

```typescript
import { index } from "drizzle-orm/pg-core";

// Leaderboard: ordena por score ASC (piores primeiro), com paginacao por created_at
// CREATE INDEX idx_roasts_leaderboard ON roasts (score ASC, created_at DESC);
```

---

### 2. `roast_issues` — Issues individuais da analise

Cada roast tem N issues (cards de analise com severity, titulo e descricao).

| Coluna       | Tipo                          | Descricao                                    |
|-------------|-------------------------------|----------------------------------------------|
| `id`        | `uuid` PK, default random     | Identificador unico                          |
| `roast_id`  | `uuid` FK -> roasts.id        | Referencia ao roast pai                      |
| `severity`  | `issue_severity` NOT NULL      | Nivel: critical, warning, good               |
| `title`     | `varchar(200)` NOT NULL        | Titulo curto (ex: "using var instead of const/let") |
| `description`| `text` NOT NULL               | Explicacao detalhada do issue                |
| `order`     | `integer` NOT NULL default 0   | Ordem de exibicao no grid                    |

```typescript
export const roastIssues = pgTable("roast_issues", {
	id: uuid("id").primaryKey().defaultRandom(),
	roastId: uuid("roast_id")
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),
	severity: issueSeverityEnum("severity").notNull(),
	title: varchar("title", { length: 200 }).notNull(),
	description: text("description").notNull(),
	order: integer("order").notNull().default(0),
});
```

---

### 3. `roast_diff_lines` — Linhas do diff sugerido

Cada roast tem N linhas de diff (removed, added, context) exibidas na secao "suggested_fix".

| Coluna       | Tipo                          | Descricao                                    |
|-------------|-------------------------------|----------------------------------------------|
| `id`        | `uuid` PK, default random     | Identificador unico                          |
| `roast_id`  | `uuid` FK -> roasts.id        | Referencia ao roast pai                      |
| `type`      | `diff_line_type` NOT NULL      | Tipo: removed, added, context                |
| `content`   | `text` NOT NULL                | Conteudo da linha de codigo                  |
| `order`     | `integer` NOT NULL default 0   | Posicao sequencial da linha no diff          |

```typescript
export const roastDiffLines = pgTable("roast_diff_lines", {
	id: uuid("id").primaryKey().defaultRandom(),
	roastId: uuid("roast_id")
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),
	type: diffLineTypeEnum("type").notNull(),
	content: text("content").notNull(),
	order: integer("order").notNull().default(0),
});
```

---

## Diagrama de Relacoes

```
roasts (1) ──< roast_issues (N)
roasts (1) ──< roast_diff_lines (N)
```

Ambas as tabelas filhas usam `ON DELETE CASCADE` — ao deletar um roast, issues e diff lines sao removidos automaticamente.

---

## Campos Derivados (nao persistidos)

Estes valores sao calculados no app, **nao** sao colunas no banco:

| Campo        | Logica                                                         |
|-------------|---------------------------------------------------------------|
| `verdict`   | `score <= 3` = "needs_serious_help", `<= 6` = "could_be_worse", `> 6` = "not_bad" |
| `verdictColor` | Mapeia para `accent-red`, `accent-amber`, `accent-green`  |
| `scoreColor`| Mesma logica de cores do verdict                              |
| `rank`      | Posicao calculada via `ROW_NUMBER()` na query do leaderboard  |
| `badge`     | Derivado de `issue.severity`: critical/warning/good           |

---

## Docker Compose

```yaml
# docker-compose.yml (raiz do projeto)

services:
  postgres:
    image: postgres:16-alpine
    container_name: devroast-db
    restart: unless-stopped
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## Variaveis de Ambiente

```env
# .env (raiz do projeto, adicionar ao .gitignore)
DATABASE_URL="postgresql://devroast:devroast@localhost:5433/devroast"
```

---

## Estrutura de Arquivos

```
src/
  db/
    index.ts          # Conexao com o banco (drizzle instance)
    schema.ts         # Tabelas + enums (tudo neste arquivo)
    queries/
      roasts.ts       # Queries: createRoast, getRoast, getLeaderboard, getStats
drizzle.config.ts     # Config do drizzle-kit (migrations)
docker-compose.yml    # Postgres local
.env                  # DATABASE_URL (gitignored)
```

---

## Queries Principais

### Criar roast (com issues e diff lines)

```typescript
// Transaction: insere roast + issues + diff_lines atomicamente
await db.transaction(async (tx) => {
	const [roast] = await tx.insert(roasts).values({ ... }).returning();
	await tx.insert(roastIssues).values(issues.map((i, idx) => ({
		roastId: roast.id,
		severity: i.severity,
		title: i.title,
		description: i.description,
		order: idx,
	})));
	await tx.insert(roastDiffLines).values(diffLines.map((l, idx) => ({
		roastId: roast.id,
		type: l.type,
		content: l.content,
		order: idx,
	})));
	return roast;
});
```

### Buscar roast por ID (pagina /roast/:id + OG image)

```typescript
const roast = await db.query.roasts.findFirst({
	where: eq(roasts.id, id),
	with: {
		issues: { orderBy: [asc(roastIssues.order)] },
		diffLines: { orderBy: [asc(roastDiffLines.order)] },
	},
});
```

### Leaderboard (piores scores primeiro)

```typescript
const entries = await db
	.select()
	.from(roasts)
	.orderBy(asc(roasts.score), desc(roasts.createdAt))
	.limit(20);
```

### Stats agregados (total + media)

```typescript
const [stats] = await db
	.select({
		totalRoasts: count(),
		avgScore: avg(roasts.score),
	})
	.from(roasts);
```

---

## Dependencias a Instalar

```bash
# ORM + driver
npm install drizzle-orm postgres

# Dev tools (migrations)
npm install -D drizzle-kit
```

---

## drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
```

---

## To-Dos de Implementacao

### Infra

- [ ] Criar `docker-compose.yml` na raiz com Postgres 16
- [ ] Criar `.env` com `DATABASE_URL` e garantir que esta no `.gitignore`
- [ ] Instalar dependencias: `drizzle-orm`, `postgres`, `drizzle-kit`
- [ ] Criar `drizzle.config.ts` na raiz

### Schema

- [ ] Criar `src/db/schema.ts` com enums (`issue_severity`, `diff_line_type`)
- [ ] Criar tabela `roasts` com todos os campos
- [ ] Criar tabela `roast_issues` com FK para `roasts`
- [ ] Criar tabela `roast_diff_lines` com FK para `roasts`
- [ ] Definir relations do Drizzle para queries com `with:`
- [ ] Criar indice para leaderboard (`score ASC, created_at DESC`)

### Conexao

- [ ] Criar `src/db/index.ts` com instancia do Drizzle e conexao via `postgres`
- [ ] Exportar `db` para uso nos server components e server actions

### Migrations

- [ ] Rodar `npx drizzle-kit generate` para gerar a primeira migration
- [ ] Rodar `npx drizzle-kit migrate` para aplicar no banco local

### Queries

- [ ] Criar `src/db/queries/roasts.ts` com:
  - [ ] `createRoast()` — insere roast + issues + diff lines em transaction
  - [ ] `getRoastById()` — busca roast completo com issues e diff lines
  - [ ] `getLeaderboard()` — lista paginada ordenada por pior score
  - [ ] `getStats()` — total de roasts e score medio

### Integracao

- [ ] Criar server action para submissao de codigo (chamara a AI e salvara no banco)
- [ ] Criar rota `/roast/[id]/page.tsx` para exibir resultado (Screen 2 do design)
- [ ] Criar rota `/roast/[id]/opengraph-image.tsx` para OG image dinamica (Screen 4 do design)
- [ ] Criar rota `/leaderboard/page.tsx` para shame leaderboard (Screen 3 do design)
- [ ] Substituir dados hardcoded da homepage por queries reais (stats + top 3)

### Validacao

- [ ] `docker compose up -d` sobe o Postgres sem erros
- [ ] `npx drizzle-kit migrate` aplica migrations com sucesso
- [ ] `npx next build` compila sem erros de tipo
- [ ] `npx biome check` passa sem warnings
