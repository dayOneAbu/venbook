import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const exportRouter = createTRPCRouter({
  allData: protectedProcedure.query(async ({ ctx }) => {
    const hotelId = ctx.session.user.hotelId;
    if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Only hotel admins can export all data
    if (ctx.session.user.role !== "HOTEL_ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only hotel admins can export data." });
    }

    // Parallel fetch for speed
    const [hotel, venues, customers, bookings] = await Promise.all([
      ctx.db.hotel.findUnique({
        where: { id: hotelId },
        include: {
          resources: true,
        }
      }),
      ctx.db.venue.findMany({ where: { hotelId } }),
      ctx.db.customer.findMany({ where: { hotelId } }),
      ctx.db.booking.findMany({
        where: { hotelId },
        include: {
          venue: { select: { name: true } },
          customer: { select: { companyName: true, contactName: true } },
        }
      }),
    ]);

    if (!hotel) throw new TRPCError({ code: "NOT_FOUND" });

    // Structure the export
    return {
      generatedAt: new Date(),
      hotel,
      venues,
      customers,
      bookings,
    };
  }),
});
