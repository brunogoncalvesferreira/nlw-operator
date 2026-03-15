import { asc, avg, count, desc, eq } from "drizzle-orm";
import { db } from "../index";
import { roastDiffLines, roastIssues, roasts } from "../schema";

type NewRoast = typeof roasts.$inferInsert;
type NewIssue = Omit<typeof roastIssues.$inferInsert, "roastId">;
type NewDiffLine = Omit<typeof roastDiffLines.$inferInsert, "roastId">;

interface CreateRoastInput {
	roast: Omit<NewRoast, "id" | "createdAt">;
	issues: Omit<NewIssue, "id">[];
	diffLines: Omit<NewDiffLine, "id">[];
}

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

		if (input.diffLines.length > 0) {
			await tx.insert(roastDiffLines).values(
				input.diffLines.map((line, idx) => ({
					...line,
					roastId: roast.id,
					order: idx,
				})),
			);
		}

		return roast;
	});
}

export async function getRoastById(id: string) {
	const [roast] = await db.select().from(roasts).where(eq(roasts.id, id));

	if (!roast) {
		return null;
	}

	const issues = await db
		.select()
		.from(roastIssues)
		.where(eq(roastIssues.roastId, id))
		.orderBy(asc(roastIssues.order));

	const diffLines = await db
		.select()
		.from(roastDiffLines)
		.where(eq(roastDiffLines.roastId, id))
		.orderBy(asc(roastDiffLines.order));

	return { ...roast, issues, diffLines };
}

export async function getLeaderboard(limit = 20) {
	return db
		.select()
		.from(roasts)
		.orderBy(asc(roasts.score), desc(roasts.createdAt))
		.limit(limit);
}

export async function getStats() {
	const [stats] = await db
		.select({
			totalRoasts: count(),
			avgScore: avg(roasts.score),
		})
		.from(roasts);

	return {
		totalRoasts: stats.totalRoasts,
		avgScore: stats.avgScore ? Number.parseFloat(stats.avgScore) : 0,
	};
}
