import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const hotelRouter = createTRPCRouter({

    // Get settings for the user's hotel
    getSettings: protectedProcedure.query(async ({ ctx }) => {
        // Assuming user is attached to a hotel
        if (!ctx.session.user.hotelId) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "User is not attached to a hotel",
            });
        }

        return ctx.db.hotel.findUnique({
            where: { id: ctx.session.user.hotelId }
        });
    }),

    // Update hotel settings
    updateSettings: protectedProcedure
        .input(z.object({
            name: z.string().min(1).optional(),
            address: z.string().optional(),
            description: z.string().optional(),
            taxStrategy: z.enum(["STANDARD", "COMPOUND"]).optional(),
            serviceChargeRate: z.number().optional(),
            vatRate: z.number().optional(),
            currency: z.string().optional(),
            allowCapacityOverride: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must belong to a hotel to update settings.",
                });
            }

            return ctx.db.hotel.update({
                where: { id: hotelId },
                data: input,
            });
        }),
});
