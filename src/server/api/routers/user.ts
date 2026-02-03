import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) {
            return [];
        }

        return ctx.db.user.findMany({
            where: {
                hotelId: hotelId,
            },
            orderBy: { createdAt: "desc" },
        });
    }),

    getMe: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.user.findUnique({
            where: { id: ctx.session.user.id },
        });
    }),

    getAssignableUsers: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) {
            return [];
        }

        return ctx.db.user.findMany({
            where: {
                hotelId: hotelId,
                role: {
                    in: ["HOTEL_ADMIN", "SALES", "OPERATIONS", "FINANCE"],
                },
            },
            orderBy: { name: "asc" },
        });
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            if (!ctx.session.user.hotelId) {
                return null;
            }

            return ctx.db.user.findFirst({
                where: {
                    id: input.id,
                    hotelId: ctx.session.user.hotelId,
                },
            });
        }),

    addStaff: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                email: z.string().email(),
                role: z.enum(["HOTEL_ADMIN", "SALES", "OPERATIONS", "FINANCE"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new Error("You must belong to a hotel to add staff.");
            }

            // RBAC check: Only HOTEL_ADMIN can add staff
            if (ctx.session.user.role !== "HOTEL_ADMIN") {
                throw new Error("Only admins can add staff members.");
            }

            // Check if user already exists
            const existingUser = await ctx.db.user.findUnique({
                where: { email: input.email },
            });

            if (existingUser) {
                throw new Error("User with this email already exists.");
            }

            return ctx.db.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    role: input.role,
                    hotelId: hotelId,
                },
            });
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                role: z.enum(["HOTEL_ADMIN", "SALES", "OPERATIONS", "FINANCE"]).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new Error("Unauthorized");
            }

            // RBAC check: Only HOTEL_ADMIN can update other users
            if (ctx.session.user.role !== "HOTEL_ADMIN" && ctx.session.user.id !== input.id) {
                throw new Error("Only admins can update other staff members.");
            }

            // Ensure user belongs to same hotel
            const userToUpdate = await ctx.db.user.findFirst({
                where: {
                    id: input.id,
                    hotelId: hotelId,
                },
            });

            if (!userToUpdate) {
                throw new Error("User not found or access denied.");
            }

            return ctx.db.user.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    role: input.role,
                },
            });
        }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).optional(),
                phone: z.string().optional(),
                image: z.string().url().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: {
                    name: input.name,
                    phone: input.phone,
                    image: input.image,
                },
            });
        }),

    updateOnboardingStatus: protectedProcedure
        .input(z.object({ isOnboarded: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: {
                    isOnboarded: input.isOnboarded,
                },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new Error("Unauthorized");
            }

            // RBAC check: Only HOTEL_ADMIN can delete users
            if (ctx.session.user.role !== "HOTEL_ADMIN") {
                throw new Error("Only admins can delete staff members.");
            }

            if (input.id === ctx.session.user.id) {
                throw new Error("You cannot delete yourself.");
            }

            // Ensure the user to delete belongs to the same hotel
            const userToDelete = await ctx.db.user.findFirst({
                where: {
                    id: input.id,
                    hotelId: hotelId,
                },
            });

            if (!userToDelete) {
                throw new Error("User not found or access denied.");
            }

            return ctx.db.user.delete({
                where: { id: input.id },
            });
        }),
});
