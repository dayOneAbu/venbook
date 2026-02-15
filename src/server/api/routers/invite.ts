import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const inviteRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const hotelId = ctx.session.user.hotelId;
    if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

    return ctx.db.invite.findMany({
      where: { hotelId: hotelId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["SALES", "OPERATIONS", "FINANCE", "HOTEL_ADMIN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hotelId = ctx.session.user.hotelId;
      if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (ctx.session.user.role !== "HOTEL_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can invite staff.",
        });
      }

      return ctx.services.invite.createInvite(hotelId, input.email, input.role);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const hotelId = ctx.session.user.hotelId;
      if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (ctx.session.user.role !== "HOTEL_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can cancel invites.",
        });
      }

      // Ensure invite belongs to this hotel
      const invite = await ctx.db.invite.findFirst({
        where: { id: input.id, hotelId },
      });

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.invite.delete({
        where: { id: input.id },
      });
    }),

  // Public procedure to redeem an invite
  accept: publicProcedure
    .input(z.object({
      token: z.string(),
      name: z.string().min(1),
      password: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.invite.acceptInvite(
        input.token,
        input.name,
        input.password,
        ctx.headers
      );
    }),
});
