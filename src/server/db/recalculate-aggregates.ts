import "@/env"; // Initialize environment variables
import { db } from "./index";
import { donations, donationAggregates } from "./schema";
import { sql, eq, desc } from "drizzle-orm";

export async function recalculateAggregates() {
    console.log("Recalculating aggregates...");

        // Convert kg to lbs
    const KG_TO_LBS = 2.20462;
    const convertKgToLbs = (kg: number) => Math.round(kg * KG_TO_LBS * 100) / 100;

    // Calculate all statistics
    const totalResult = await db
        .select({ total: sql<number>`sum(${donations.amount})` })
        .from(donations);
    const totalAmount = convertKgToLbs(totalResult[0]?.total ?? 0);

    const studentCountResult = await db
        .select({ count: sql<number>`count(distinct ${donations.name})` })
        .from(donations)
        .where(eq(donations.role, "Student"));
    const totalStudents = studentCountResult[0]?.count ?? 0;

    const staffAmountResult = await db
        .select({ total: sql<number>`sum(${donations.amount})` })
        .from(donations)
        .where(eq(donations.role, "Staff"));
    const staffAmount = convertKgToLbs(staffAmountResult[0]?.total ?? 0);

    const studentAmountResult = await db
        .select({ total: sql<number>`sum(${donations.amount})` })
        .from(donations)
        .where(eq(donations.role, "Student"));
    const studentAmount = convertKgToLbs(studentAmountResult[0]?.total ?? 0);

    const houseDonations = await db
        .select({
            house: donations.house,
            amount: sql<number>`sum(${donations.amount})`,
        })
        .from(donations)
        .where(sql`${donations.house} IS NOT NULL`)
        .groupBy(donations.house);

        // filter to only student donors
    const topDonors = await db
        .select({
            name: donations.name,
            amount: sql<number>`sum(${donations.amount})`,
        })
        .from(donations)
        .where(eq(donations.role, "Student"))
        .groupBy(donations.name)
        .orderBy(desc(sql`sum(${donations.amount})`))
        .limit(5);

    // Update aggregate table
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await db.delete(donationAggregates);
    await db.insert(donationAggregates).values({
        totalAmount,
        totalStudents,
        staffAmount,
        studentAmount,
        houseDonations: houseDonations.map((h) => ({ house: h.house!, amount: convertKgToLbs(h.amount) })),
        topDonors: topDonors.map((d) => ({ name: d.name, amount: convertKgToLbs(d.amount) })),
    });

    console.log("Aggregates recalculated!");
    return {
        totalAmount,
        totalStudents,
        staffAmount,
        studentAmount,
        houseDonationsCount: houseDonations.length,
        topDonorsCount: topDonors.length,
    };
}

if (require.main === module) {
    recalculateAggregates()
        .then((stats) => {
            console.log(stats);
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
