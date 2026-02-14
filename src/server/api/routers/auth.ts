import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { auth } from "~/server/better-auth";

export const authRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
    
      try {

        // Use better-auth's server API for sign in
        const result = await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password,
          },
          headers: ctx.headers,
        });
      
        // Fetch the assigned hotel's subdomain if it exists
        const userWithHotel = await ctx.db.user.findUnique({
          where: { id: result.user.id },
          select: {
            hotel: {
              select: { subdomain: true }
            }
          }
        });
      
        // Return success - cookies are handled by better-auth via the API route
        return {
          success: true,
          user: result.user,
          subdomain: userWithHotel?.hotel?.subdomain ?? null,
        };
      } catch (error) {
      
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            error instanceof Error ? error.message : "Invalid email or password",
        });
      }
    }),
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        role: z.enum(["CUSTOMER", "HOTEL_ADMIN"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Use better-auth's server API for sign up
        const result = await auth.api.signUpEmail({
          body: {
            email: input.email,
            password: input.password,
            name: input.name,
            role: input.role,
          },
          headers: ctx.headers,
        });

        return {
          success: true,
          user: result.user,
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create account",
        });
      }
    }),
});
