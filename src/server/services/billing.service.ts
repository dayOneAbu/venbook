import { type db } from "~/server/db";

export class BillingService {
  constructor(private readonly prisma: typeof db) {}

  async getRevenueSummary(hotelId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { hotelId },
      select: {
        totalAmount: true,
        vat: true,
        serviceCharge: true,
        status: true,
      },
    });

    return bookings.reduce(
      (acc, booking) => {
        const amount = Number(booking.totalAmount);
        const vat = Number(booking.vat);
        const sc = Number(booking.serviceCharge);

        acc.allTimeRevenue += amount;
        acc.allTimeVat += vat;
        acc.allTimeServiceCharge += sc;

        if (booking.status === "COMPLETED") {
          acc.completedRevenue += amount;
        } else if (booking.status === "CONFIRMED") {
          acc.pendingRevenue += amount;
        }

        return acc;
      },
      {
        allTimeRevenue: 0,
        allTimeVat: 0,
        allTimeServiceCharge: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
      }
    );
  }
}
