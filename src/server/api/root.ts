import { authRouter } from "~/server/api/routers/auth";
import { userRouter } from "~/server/api/routers/user";
import { bookingRouter } from "~/server/api/routers/booking";
import { hotelRouter } from "~/server/api/routers/hotel";
import { venueRouter } from "~/server/api/routers/venue";
import { billingRouter } from "~/server/api/routers/billing";
import { customerRouter } from "~/server/api/routers/customer";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { adminRouter } from "~/server/api/routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  booking: bookingRouter,
  hotel: hotelRouter,
  venue: venueRouter,
  billing: billingRouter,
  customer: customerRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
