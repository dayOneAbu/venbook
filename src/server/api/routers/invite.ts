import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const inviteRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ hotelId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.invite.findMany({
        where: { hotelId: input.hotelId },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["SALES", "OPERATIONS", "FINANCE"]),
        hotelId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      return await ctx.db.invite.create({
        data: {
          email: input.email,
          role: input.role,
          hotelId: input.hotelId,
          token,
          expiresAt,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.invite.delete({
        where: { id: input.id },
      });
    }),
});
