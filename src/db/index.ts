import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// biome-ignore lint/style/noNonNullAssertion: env var required at runtime
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { casing: "snake_case" });
