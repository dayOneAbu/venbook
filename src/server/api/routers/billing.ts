import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { BillingService } from "~/server/services/billing.service";

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

        const billingService = new BillingService(ctx.db);
        return billingService.getRevenueSummary(hotelId);
    }),
});
