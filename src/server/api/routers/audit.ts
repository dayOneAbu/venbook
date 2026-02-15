import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const auditRouter = createTRPCRouter({
  getLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(), // For pagination
      })
    )
    .query(async ({ ctx, input }) => {
      const hotelId = ctx.session.user.hotelId;
      const userRole = ctx.session.user.role;

      // Only Hotel Admins and Super Admins (impersonating) should see these logs?
      // Actually Super Admins can see everything, but here we scope to the hotel if context has it.
      // If Hotel Admin, they must have hotelId.
      
      if (!hotelId) {
         if (userRole === "SUPER_ADMIN") {
             // If Super Admin is NOT impersonating (no hotelId context), maybe they want to see ALL logs?
             // For this MVP feature "Radical Transparency", we specifically want to show logs FOR A HOTEL.
             // If no hotelId, return empty or throw? 
             // Let's assume this view is on the "Hotel Settings" page, so context IS set if impersonating.
             return { items: [], nextCursor: undefined }; 
         }
         throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await ctx.db.auditLog.findMany({
        take: limit + 1, // Get an extra item at the end which we'll use as the next cursor
        where: {
          hotelId,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          actor: {
            select: {
              name: true,
              email: true,
              role: true,
            }
          }
        }
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
