import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const amenityRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.db.amenity.findMany({
            orderBy: { name: "asc" },
        });
    }),

    create: protectedProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.amenity.findUnique({
                where: { name: input.name },
            });
            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `Amenity "${input.name}" already exists.`,
                });
            }
            return ctx.db.amenity.create({ data: { name: input.name } });
        }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const amenity = await ctx.db.amenity.findUnique({
                where: { id: input.id },
            });
            if (!amenity) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Amenity not found" });
            }
            return ctx.db.amenity.update({
                where: { id: input.id },
                data: { name: input.name },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const amenity = await ctx.db.amenity.findUnique({
                where: { id: input.id },
            });
            if (!amenity) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Amenity not found" });
            }
            return ctx.db.amenity.delete({ where: { id: input.id } });
        }),
});
