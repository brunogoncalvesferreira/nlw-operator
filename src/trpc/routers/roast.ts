import { z } from "zod";
import { getLeaderboard, getRoastById, getStats } from "@/db/queries/roasts";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastRouter = createTRPCRouter({
	getById: baseProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(({ input }) => getRoastById(input.id)),

	getLeaderboard: baseProcedure
		.input(
			z.object({ limit: z.number().min(1).max(50).default(20) }).optional(),
		)
		.query(({ input }) => getLeaderboard(input?.limit)),

	getStats: baseProcedure.query(() => getStats()),

	submit: baseProcedure
		.input(
			z.object({
				code: z.string().min(1).max(10000),
				language: z.string().max(50),
				roastMode: z.boolean().default(true),
			}),
		)
		.mutation(async () => {
			// TODO: chamar AI para gerar o roast, depois salvar no banco
			// Por enquanto, placeholder que sera implementado na feature de AI
			throw new Error("not implemented");
		}),
});
