import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const hotelRouter = createTRPCRouter({
    setup: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            subdomain: z.string().min(3),
            address: z.string().min(1),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            tinNumber: z.string().optional(),
            taxStrategy: z.enum(["STANDARD", "COMPOUND"]).default("STANDARD"),
            vatRate: z.number().default(15),
            serviceChargeRate: z.number().default(10),
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().default("Ethiopia"),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // 1. Check if user is already onboarded or belongs to a hotel
            const user = await ctx.db.user.findUnique({
                where: { id: userId },
                select: { hotelId: true, isOnboarded: true }
            });

            if (user?.hotelId || user?.isOnboarded) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "User is already associated with a hotel.",
                });
            }

            // 2. Check if subdomain is taken
            const existingHotel = await ctx.db.hotel.findUnique({
                where: { subdomain: input.subdomain }
            });

            if (existingHotel) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "This subdomain is already taken.",
                });
            }

            // 3. Create Hotel and Update User in a transaction
            return ctx.db.$transaction(async (tx) => {
                const hotel = await tx.hotel.create({
                    data: {
                        ...input,
                        ownerId: userId,
                    }
                });

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        hotelId: hotel.id,
                        role: "HOTEL_ADMIN",
                        isOnboarded: true,
                    }
                });

                return hotel;
            });
        }),


    // Public/Tenant view of hotel details
    getProfile: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

        return ctx.db.hotel.findUnique({
            where: { id: hotelId },
            select: {
                name: true,
                address: true,
                description: true,
                email: true,
                phone: true,
                website: true,
                logoUrl: true,
                city: true,
                state: true,
                country: true,
            }
        });
    }),

    // Update hotel profile
    updateProfile: protectedProcedure
        .input(z.object({
            name: z.string().min(1).optional(),
            address: z.string().optional(),
            description: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            website: z.string().url().optional(),
            logoUrl: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            const userRole = ctx.session.user.role;

            if (!hotelId || (userRole !== "HOTEL_ADMIN" && userRole !== "SUPER_ADMIN")) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            return ctx.db.hotel.update({
                where: { id: hotelId },
                data: input,
            });
        }),

    // Operational settings (Rules/Policies)
    getSettings: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

        return ctx.db.hotel.findUnique({
            where: { id: hotelId },
            select: {
                taxStrategy: true,
                serviceChargeRate: true,
                vatRate: true,
                currency: true,
                allowCapacityOverride: true,
                isVerified: true,
                tinNumber: true,
                licenseNumber: true,
            }
        });
    }),

    updateSettings: protectedProcedure
        .input(z.object({
            taxStrategy: z.enum(["STANDARD", "COMPOUND"]).optional(),
            serviceChargeRate: z.number().optional(),
            vatRate: z.number().optional(),
            currency: z.string().optional(),
            allowCapacityOverride: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId || ctx.session.user.role !== "HOTEL_ADMIN") {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            return ctx.db.hotel.update({
                where: { id: hotelId },
                data: input,
            });
        }),

    // Soft-delete (Deactivate)
    deactivate: protectedProcedure.mutation(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

        const hotel = await ctx.db.hotel.findUnique({
            where: { id: hotelId },
            select: { ownerId: true }
        });

        if (hotel?.ownerId !== ctx.session.user.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Only the hotel owner can deactivate the property.",
            });
        }

        return ctx.db.hotel.update({
            where: { id: hotelId },
            data: {
                isDeactivated: true,
                deactivatedAt: new Date(),
            }
        });
    }),

    // --- Platform Admin Procedures ---
    adminGetAll: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
        }))
        .query(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "SUPER_ADMIN") {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const hotels = await ctx.db.hotel.findMany({
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { createdAt: "desc" },
            });

            let nextCursor: typeof input.cursor | undefined = undefined;
            if (hotels.length > input.limit) {
                const nextItem = hotels.pop();
                nextCursor = nextItem!.id;
            }

            return {
                hotels,
                nextCursor,
            };
        }),

    adminGetById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "SUPER_ADMIN") {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            return ctx.db.hotel.findUnique({
                where: { id: input.id },
                include: {
                    owner: true,
                    _count: {
                        select: { venues: true, staff: true, bookings: true }
                    }
                }
            });
        }),
});
