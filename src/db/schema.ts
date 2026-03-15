import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const issueSeverityEnum = pgEnum("issue_severity", [
	"critical",
	"warning",
	"good",
]);

export const diffLineTypeEnum = pgEnum("diff_line_type", [
	"removed",
	"added",
	"context",
]);

export const roasts = pgTable(
	"roasts",
	{
		id: uuid().primaryKey().defaultRandom(),
		code: text().notNull(),
		language: varchar({ length: 50 }).notNull(),
		lineCount: integer().notNull(),
		roastMode: boolean().notNull().default(true),
		score: real().notNull(),
		roastQuote: text().notNull(),
		diffCode: text(),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(t) => [index("idx_roasts_leaderboard").on(t.score, t.createdAt)],
);

export const roastIssues = pgTable("roast_issues", {
	id: uuid().primaryKey().defaultRandom(),
	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),
	severity: issueSeverityEnum().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	order: integer().notNull().default(0),
});

export const roastDiffLines = pgTable("roast_diff_lines", {
	id: uuid().primaryKey().defaultRandom(),
	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),
	type: diffLineTypeEnum().notNull(),
	content: text().notNull(),
	order: integer().notNull().default(0),
});
