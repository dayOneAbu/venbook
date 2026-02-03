import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

/**
 * BILLING ROUTER TODOs:
 * - [ ] Payment Recording (Cash, Bank, Mobile Money)
 * - [ ] PDF Invoice/Receipt Generation
 * - [ ] Refund processing
 * - [ ] SaaS Subscription management for the Hotel
 * - [ ] Tax filing export reports
 */

export const billingRouter = createTRPCRouter({
    getSummary: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

        const bookings = await ctx.db.booking.findMany({
            where: { hotelId },
            select: {
                totalAmount: true,
                vat: true,
                serviceCharge: true,
                status: true,
            }
        });

        const summary = bookings.reduce((acc, booking) => {
            const amount = Number(booking.totalAmount);
            const vat = Number(booking.vat);
            const sc = Number(booking.serviceCharge);

            acc.allTimeRevenue += amount;
            acc.allTimeVat += vat;
            acc.allTimeServiceCharge += sc;

            if (booking.status === "COMPLETED") {
                acc.completedRevenue += amount;
            } else if (booking.status === "CONFIRMED") {
                acc.pendingRevenue += amount;
            }

            return acc;
        }, {
            allTimeRevenue: 0,
            allTimeVat: 0,
            allTimeServiceCharge: 0,
            completedRevenue: 0,
            pendingRevenue: 0,
        });

        return summary;
    }),
});
