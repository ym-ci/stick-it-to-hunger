import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { donations } from "@/server/db/schema";
import { recalculateAggregates } from "@/server/db/recalculate-aggregates";

export const donationRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                amount: z.number().min(0.1),
                house: z.enum(["Hyperion", "Themis", "Crius", "Thea", "Oceanus"]).optional(),
                role: z.enum(["Student", "Staff", "Community"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // 1. Insert donation
            await ctx.db.insert(donations).values({
                name: input.name,
                amount: input.amount,
                house: input.house,
                role: input.role,
            });

            // 2. Recalculate all statistics
            const stats = await recalculateAggregates();

            return { success: true, totalAmount: stats.totalAmount };
        }),

    recalculate: protectedProcedure.mutation(async () => {
        const stats = await recalculateAggregates();
        return { success: true, stats };
    }),

    getDashboardData: publicProcedure.query(async ({ ctx }) => {
        // Get all data from the aggregate table
        const aggregate = await ctx.db.query.donationAggregates.findFirst();

        if (!aggregate) {
            // Return empty data if no aggregates exist yet
            return {
                totalAmount: 0,
                totalStudents: 0,
                staffAmount: 0,
                studentAmount: 0,
                houseDonations: [],
                topDonors: [],
            };
        }

        return {
            totalAmount: aggregate.totalAmount,
            totalStudents: aggregate.totalStudents,
            staffAmount: aggregate.staffAmount,
            studentAmount: aggregate.studentAmount,
            houseDonations: aggregate.houseDonations as Array<{ house: string; amount: number }>,
            topDonors: aggregate.topDonors as Array<{ name: string; amount: number }>,
        };
    }),
});
