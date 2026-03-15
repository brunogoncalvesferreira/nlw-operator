CREATE TYPE "public"."diff_line_type" AS ENUM('removed', 'added', 'context');--> statement-breakpoint
CREATE TYPE "public"."issue_severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TABLE "roast_diff_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"type" "diff_line_type" NOT NULL,
	"content" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roast_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"severity" "issue_severity" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" varchar(50) NOT NULL,
	"line_count" integer NOT NULL,
	"roast_mode" boolean DEFAULT true NOT NULL,
	"score" real NOT NULL,
	"roast_quote" text NOT NULL,
	"diff_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roast_diff_lines" ADD CONSTRAINT "roast_diff_lines_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_issues" ADD CONSTRAINT "roast_issues_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_roasts_leaderboard" ON "roasts" USING btree ("score","created_at");