import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { auth } from "~/server/better-auth";
import { checkRateLimit } from "~/server/lib/rate-limit";

export const authRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Rate limit: 5 sign-in attempts per email per 15 minutes
      const rl = checkRateLimit(`signin:${input.email}`, 5, 15 * 60 * 1000);
      if (!rl.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many sign-in attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`,
        });
      }

      try {
        const result = await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password,
          },
          headers: ctx.headers,
        });
      
        const userWithHotel = await ctx.db.user.findUnique({
          where: { id: result.user.id },
          select: {
            hotel: {
              select: { subdomain: true }
            }
          }
        });
      
        return {
          success: true,
          user: result.user,
          subdomain: userWithHotel?.hotel?.subdomain ?? null,
        };
      } catch (error) {
        console.error("[Auth] Sign-in failed:", error);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
    }),
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must include uppercase, lowercase, and a number"
          ),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Rate limit: 3 sign-ups per IP per hour
      const ip = ctx.headers.get("x-forwarded-for") ?? ctx.headers.get("x-real-ip") ?? "unknown";
      const rl = checkRateLimit(`signup:${ip}`, 3, 60 * 60 * 1000);
      if (!rl.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many sign-up attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`,
        });
      }

      try {
        // All new users default to CUSTOMER.
        // HOTEL_ADMIN is assigned later via the hotel.setup onboarding flow.
        const result = await auth.api.signUpEmail({
          body: {
            email: input.email,
            password: input.password,
            name: input.name,
            role: "CUSTOMER",
          },
          headers: ctx.headers,
        });

        return {
          success: true,
          user: result.user,
        };
      } catch (error) {
        console.error("[Auth] Sign-up failed:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create account. The email may already be in use.",
        });
      }
    }),
});
