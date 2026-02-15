import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const venueRouter = createTRPCRouter({
    publicList: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.venue.findMany({ // Public list often has specific filters, keeping direct access for now or should I move to service? Let's keep it direct for public or add publicList to service.
            // Actually, let's keep public procedures direct if they are simple queries, or add specific methods to service.
            // Plan said "Complete migration".
            // Let's stick to the protected procedures which have business logic.
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
           // Keeping public query direct for now to avoid refactoring huge select object unless needed.
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
        return ctx.services.venue.getAll(hotelId);
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
             const hotelId = ctx.session.user.hotelId;
             if (!hotelId) return null;
             return ctx.services.venue.getById(input.id, hotelId);
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

            const allowedRoles: string[] = ["HOTEL_ADMIN", "SALES", "OPERATIONS"];
            if (!ctx.session.user.role || !allowedRoles.includes(ctx.session.user.role)) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to create venues." });
            }

            return ctx.services.venue.create(
                { ...input, hotelId },
                {
                    isImpersonating: ctx.isImpersonating,
                    impersonatedBy: ctx.session.session.impersonatedBy,
                }
            );
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

            const allowedRoles: string[] = ["HOTEL_ADMIN", "SALES", "OPERATIONS"];
            if (!ctx.session.user.role || !allowedRoles.includes(ctx.session.user.role)) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to update venues." });
            }

            const { id, ...data } = input;

            return ctx.services.venue.update(
                id,
                hotelId,
                data,
                {
                    isImpersonating: ctx.isImpersonating,
                    impersonatedBy: ctx.session.session.impersonatedBy,
                }
            );
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            // Only HOTEL_ADMIN can delete venues
            if (ctx.session.user.role !== "HOTEL_ADMIN") {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only hotel admins can delete venues." });
            }

            return ctx.services.venue.delete(
                input.id,
                hotelId,
                {
                    isImpersonating: ctx.isImpersonating,
                    impersonatedBy: ctx.session.session.impersonatedBy,
                }
            );
        }),
});
