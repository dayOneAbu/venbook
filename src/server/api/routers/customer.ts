import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CustomerType } from "~/generated/prisma";

export const customerRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) return [];

        return ctx.services.customer.getAll(hotelId);
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) return null;

            return ctx.services.customer.getById(input.id, hotelId);
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

            const allowedRoles: string[] = ["HOTEL_ADMIN", "SALES", "OPERATIONS"];
            if (!ctx.session.user.role || !allowedRoles.includes(ctx.session.user.role)) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to create customers." });
            }

            return ctx.services.customer.create(
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

            const allowedRoles: string[] = ["HOTEL_ADMIN", "SALES", "OPERATIONS"];
            if (!ctx.session.user.role || !allowedRoles.includes(ctx.session.user.role)) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to update customers." });
            }

            const { id, ...data } = input;

            return ctx.services.customer.update(
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

            // Only HOTEL_ADMIN can delete customers
            if (ctx.session.user.role !== "HOTEL_ADMIN") {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only hotel admins can delete customers." });
            }

            return ctx.services.customer.delete(
                input.id,
                hotelId,
                {
                    isImpersonating: ctx.isImpersonating,
                    impersonatedBy: ctx.session.session.impersonatedBy,
                }
            );
        }),
});
