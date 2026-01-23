import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        // For now, return all users. In production, this would be scoped to hotelId.
        return ctx.db.user.findMany({
            orderBy: { createdAt: "desc" },
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
            return ctx.db.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    role: input.role,
                    // hotelId: ctx.session.user.hotelId, // Would be needed for real multi-tenancy
                },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.delete({
                where: { id: input.id },
            });
        }),
});
