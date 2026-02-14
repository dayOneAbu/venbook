import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const resourceRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) return [];

        return ctx.db.resource.findMany({
            where: { hotelId },
            orderBy: { name: "asc" },
            include: {
                _count: { select: { bookings: true } },
            },
        });
    }),

    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                quantity: z.number().int().min(1).default(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must belong to a hotel to manage resources.",
                });
            }

            return ctx.db.resource.create({
                data: {
                    hotelId,
                    name: input.name,
                    quantity: input.quantity,
                },
            });
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                quantity: z.number().int().min(0).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const resource = await ctx.db.resource.findFirst({
                where: { id: input.id, hotelId },
            });
            if (!resource) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Resource not found" });
            }

            return ctx.db.resource.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    quantity: input.quantity,
                },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const resource = await ctx.db.resource.findFirst({
                where: { id: input.id, hotelId },
            });
            if (!resource) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Resource not found" });
            }

            return ctx.db.resource.delete({ where: { id: input.id } });
        }),
});
