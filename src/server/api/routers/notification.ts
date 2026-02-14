import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const notificationRouter = createTRPCRouter({
  getRecent: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.notification.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });
    }),

  markAllRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await ctx.db.notification.updateMany({
        where: { userId: ctx.session.user.id, isRead: false },
        data: { isRead: true },
      });
    }),
});
