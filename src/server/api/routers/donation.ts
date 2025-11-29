import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { donations, donationAggregates } from "@/server/db/schema";
import { sql, eq, desc } from "drizzle-orm";

export const donationRouter = createTRPCRouter({
    create: publicProcedure
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

            // 2. Recalculate total
            const result = await ctx.db
                .select({ total: sql<number>`sum(${donations.amount})` })
                .from(donations);

            const total = result[0]?.total ?? 0;

            // 3. Update aggregate table
            // We'll just clear and re-insert to ensure single row for simplicity, 
            // or update if we had a fixed ID. Since we used identity, let's just 
            // keep one row.
            // eslint-disable-next-line drizzle/enforce-delete-with-where
            await ctx.db.delete(donationAggregates);
            await ctx.db.insert(donationAggregates).values({
                totalAmount: total
            });

            return { success: true, total };
        }),

    getDashboardData: publicProcedure.query(async ({ ctx }) => {
        // 1. Get Total Amount from Aggregate
        const aggregate = await ctx.db.query.donationAggregates.findFirst();
        const totalAmount = aggregate?.totalAmount ?? 0;

        // 2. Get Total Students (distinct names with role Student)
        const studentCountResult = await ctx.db
            .select({ count: sql<number>`count(distinct ${donations.name})` })
            .from(donations)
            .where(eq(donations.role, "Student"));
        const totalStudents = studentCountResult[0]?.count ?? 0;

        // 3. Amount by Staff
        const staffAmountResult = await ctx.db
            .select({ total: sql<number>`sum(${donations.amount})` })
            .from(donations)
            .where(eq(donations.role, "Staff"));
        const staffAmount = staffAmountResult[0]?.total ?? 0;

        // 4. Amount by Students
        const studentAmountResult = await ctx.db
            .select({ total: sql<number>`sum(${donations.amount})` })
            .from(donations)
            .where(eq(donations.role, "Student"));
        const studentAmount = studentAmountResult[0]?.total ?? 0;

        // 5. Food Donated by Each House
        const houseDonations = await ctx.db
            .select({
                house: donations.house,
                amount: sql<number>`sum(${donations.amount})`,
            })
            .from(donations)
            .where(sql`${donations.house} IS NOT NULL`)
            .groupBy(donations.house);

        // 6. Top 5 Donors
        const topDonors = await ctx.db
            .select({
                name: donations.name,
                amount: sql<number>`sum(${donations.amount})`,
            })
            .from(donations)
            .groupBy(donations.name)
            .orderBy(desc(sql`sum(${donations.amount})`))
            .limit(5);

        // 7. Timeline
        // Group by date (YYYY-MM-DD)
        const timeline = await ctx.db
            .select({
                date: sql<string>`to_char(${donations.createdAt}, 'YYYY-MM-DD')`,
                amount: sql<number>`sum(${donations.amount})`,
            })
            .from(donations)
            .groupBy(sql`to_char(${donations.createdAt}, 'YYYY-MM-DD')`)
            .orderBy(sql`to_char(${donations.createdAt}, 'YYYY-MM-DD')`);

        return {
            totalAmount,
            totalStudents,
            staffAmount,
            studentAmount,
            houseDonations,
            topDonors,
            timeline,
        };
    }),
});
