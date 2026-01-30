import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const venueRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) return [];

        return ctx.db.venue.findMany({
            where: { hotelId },
            include: { images: true }
        });
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) return null;

            return ctx.db.venue.findFirst({
                where: { id: input.id, hotelId },
                include: { images: true, amenities: true }
            });
        }),

    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            basePrice: z.number().optional(),
            capacityBanquet: z.number().optional(),
            capacityTheater: z.number().optional(),
            capacityReception: z.number().optional(),
            capacityUshape: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must belong to a hotel to create venues.",
                });
            }

            return ctx.db.venue.create({
                data: {
                    ...input,
                    hotelId,
                }
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            basePrice: z.number().optional(),
            capacityBanquet: z.number().optional(),
            capacityTheater: z.number().optional(),
            capacityReception: z.number().optional(),
            capacityUshape: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const { id, ...data } = input;

            // Ensure venue belongs to this hotel
            const venue = await ctx.db.venue.findFirst({
                where: { id, hotelId }
            });

            if (!venue) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Venue not found" });
            }

            return ctx.db.venue.update({
                where: { id },
                data
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            // Ensure venue belongs to this hotel
            const venue = await ctx.db.venue.findFirst({
                where: { id: input.id, hotelId }
            });

            if (!venue) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Venue not found" });
            }

            return ctx.db.venue.delete({
                where: { id: input.id }
            });
        }),
});
