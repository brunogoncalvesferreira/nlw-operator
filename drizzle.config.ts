import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	casing: "snake_case",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: env var required at config time
		url: process.env.DATABASE_URL!,
	},
});
