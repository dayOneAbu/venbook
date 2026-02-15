import { z } from "zod";
import { createTRPCRouter, protectedProcedure, superAdminProcedure } from "~/server/api/trpc";
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
            return ctx.services.hotel.setupHotel(ctx.session.user.id, input);
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

    getSubdomain: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) return null;

        const hotel = await ctx.db.hotel.findUnique({
            where: { id: hotelId },
            select: { subdomain: true }
        });

        return hotel?.subdomain ?? null;
    }),

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

            if (userRole === "SUPER_ADMIN" && !ctx.isImpersonating) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Super Admins must use Impersonation Mode to update hotel profiles.",
                });
            }

            return ctx.services.hotel.updateProfile(
                ctx.session.user.hotelId!,
                input,
                {
                    isImpersonating: ctx.isImpersonating,
                    impersonatedBy: ctx.session.session.impersonatedBy,
                }
            );
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
            const userRole = ctx.session.user.role;

            if (!hotelId || (userRole !== "HOTEL_ADMIN" && userRole !== "SUPER_ADMIN")) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            if (userRole === "SUPER_ADMIN" && !ctx.isImpersonating) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Super Admins must use Impersonation Mode to update hotel settings.",
                });
            }

            return ctx.services.hotel.updateSettings(
                ctx.session.user.hotelId!,
                input,
                {
                    isImpersonating: ctx.isImpersonating,
                    impersonatedBy: ctx.session.session.impersonatedBy,
                }
            );
        }),

    // Soft-delete (Deactivate)
    deactivate: protectedProcedure.mutation(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

        return ctx.services.hotel.deactivate(
            ctx.session.user.hotelId!,
            ctx.session.user.id
        );
    }),

    // --- Platform Admin Procedures ---
    adminGetAll: superAdminProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
        }))
        .query(async ({ ctx, input }) => {
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

    getMarketplaceReadiness: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

        const hotel = await ctx.db.hotel.findUnique({
            where: { id: hotelId },
            include: {
                venues: {
                    take: 1,
                    include: { images: { take: 1 } },
                },
            },
        });

        if (!hotel) throw new TRPCError({ code: "NOT_FOUND" });

        const tasks = [
            {
                id: "hotel-logo",
                label: "Add Hotel Logo",
                completed: !!hotel.logoUrl,
                href: "/dashboard/tenant/settings",
            },
            {
                id: "hotel-description",
                label: "Add Hotel Description",
                completed: !!hotel.description && hotel.description.length > 20,
                href: "/dashboard/tenant/settings",
            },
            {
                id: "hotel-contact",
                label: "Basic Contact Info (Address, Phone, City, State)",
                completed: !!(hotel.address && hotel.phone && hotel.city && hotel.state),
                href: "/dashboard/tenant/settings",
            },
            {
                id: "hotel-tax",
                label: "Add TIN Number",
                completed: !!hotel.tinNumber,
                href: "/dashboard/tenant/settings",
            },
            {
                id: "venue-create",
                label: "Create at least one Venue",
                completed: hotel.venues.length > 0,
                href: "/dashboard/tenant/venues",
            },
            {
                id: "venue-image",
                label: "Add photos to your venue",
                completed: hotel.venues[0]?.images.length ? hotel.venues[0].images.length > 0 : false,
                href: hotel.venues[0] ? `/dashboard/tenant/venues/${hotel.venues[0].id}` : "/dashboard/tenant/venues",
            },
        ];

        const score = Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);

        return {
            score,
            tasks,
        };
    }),

    adminGetById: superAdminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
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
