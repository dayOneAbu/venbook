import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CustomerType } from "~/generated/prisma";

export const customerRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) return [];

        return ctx.db.customer.findMany({
            where: { hotelId },
            orderBy: { createdAt: "desc" },
        });
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) return null;

            return ctx.db.customer.findFirst({
                where: { id: input.id, hotelId },
            });
        }),

    create: protectedProcedure
        .input(z.object({
            companyName: z.string().min(1),
            contactName: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            tinNumber: z.string().optional(),
            type: z.nativeEnum(CustomerType).default(CustomerType.INDIVIDUAL),
        }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must belong to a hotel to create customers.",
                });
            }

            return ctx.db.customer.create({
                data: {
                    ...input,
                    hotelId,
                }
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            companyName: z.string().min(1).optional(),
            contactName: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            tinNumber: z.string().optional(),
            type: z.nativeEnum(CustomerType).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const { id, ...data } = input;

            const customer = await ctx.db.customer.findFirst({
                where: { id, hotelId }
            });

            if (!customer) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
            }

            return ctx.db.customer.update({
                where: { id },
                data
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const customer = await ctx.db.customer.findFirst({
                where: { id: input.id, hotelId }
            });

            if (!customer) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
            }

            return ctx.db.customer.delete({
                where: { id: input.id }
            });
        }),
});
