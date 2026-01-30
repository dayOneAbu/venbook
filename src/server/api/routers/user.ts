import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.session.user.hotelId) {
            return [];
        }

        return ctx.db.user.findMany({
            where: {
                hotelId: ctx.session.user.hotelId,
            },
            orderBy: { createdAt: "desc" },
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
                password: z.string().min(8).optional(), // Optional for now, maybe invite flow later
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new Error("You must belong to a hotel to add staff.");
            }

            // Check if user already exists
            const existingUser = await ctx.db.user.findUnique({
                where: { email: input.email },
            });

            if (existingUser) {
                throw new Error("User with this email already exists.");
            }

            // In a real app, you might create an auth account here using better-auth api
            // For now, we just create the user record in our DB as per current schema/flow
            // The user would likely need to "sign up" or "accept invite" to set password/auth details effectively
            // Or we treat this as pre-seeding the user.

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

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new Error("Unauthorized");
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
