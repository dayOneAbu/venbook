import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const venueRouter = createTRPCRouter({
    publicList: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.venue.findMany({
            where: {
                isActive: true,
                hotel: {
                    isVerified: true,
                    isDeactivated: false,
                },
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                basePrice: true,
                capacityBanquet: true,
                capacityTheater: true,
                capacityReception: true,
                capacityUshape: true,
                images: {
                    select: { url: true },
                    take: 1,
                },
                hotel: {
                    select: {
                        name: true,
                        city: true,
                        country: true,
                    },
                },
            },
        });
    }),
    publicBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.venue.findFirst({
                where: {
                    slug: input.slug,
                    isActive: true,
                    hotel: {
                        isVerified: true,
                        isDeactivated: false,
                    },
                },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                    basePrice: true,
                    capacityBanquet: true,
                    capacityTheater: true,
                    capacityReception: true,
                    capacityUshape: true,
                    images: {
                        select: { url: true },
                    },
                    amenities: {
                        select: {
                            amenity: { select: { name: true } },
                        },
                    },
                    hotel: {
                        select: {
                            name: true,
                            address: true,
                            city: true,
                            country: true,
                            phone: true,
                            email: true,
                            website: true,
                        },
                    },
                },
            });
        }),
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
                    slug: input.name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).substring(2, 7),
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
