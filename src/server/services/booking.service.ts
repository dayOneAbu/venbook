import { TRPCError } from "@trpc/server";
import { 
  BookingStatus, 
  type BookingSource,
  TaxStrategy 
} from "~/generated/prisma";
import { type db } from "~/server/db";

export interface BookingInput {
  venueId: string;
  customerId: string;
  createdById: string;
  eventName: string;
  eventType?: string;
  startTime: Date;
  endTime: Date;
  guestCount: number;
  guaranteedPax?: number;
  layoutType?: string;
  manualPriceParams?: {
    basePrice?: number;
  };
  notes?: string;
  isPublicBooking?: boolean;
  source: BookingSource;
  specialRequests?: string;
  dietaryRequests?: string;
}

export class BookingService {
  constructor(private readonly prisma: typeof db) {}

  async createBooking(input: BookingInput, userRole: string | null | undefined, userHotelId?: string | null, isImpersonating?: boolean) {
    // 1. Fetch Venue & Hotel Settings
    const venue = await this.prisma.venue.findFirst({
      where: { id: input.venueId },
      include: { hotel: true },
    });

    if (!venue) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Venue not found" });
    }

    const hotelId = venue.hotelId;

    // Security check
    if (userRole === "SUPER_ADMIN") {
      if (!isImpersonating) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Super Admins must use Impersonation Mode to create bookings.",
        });
      }
    } else if (userRole !== "CUSTOMER" && userHotelId !== hotelId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You can only create bookings for your own hotel.",
      });
    }

    // 2. Capacity Check
    const maxCapacity = Math.max(
      venue.capacityBanquet ?? 0,
      venue.capacityTheater ?? 0,
      venue.capacityReception ?? 0,
      venue.capacityUshape ?? 0
    );

    if (maxCapacity > 0 && input.guestCount > maxCapacity && !venue.hotel.allowCapacityOverride) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `Guest count ${input.guestCount} exceeds venue capacity ${maxCapacity}`
      });
    }

    // 3. Conflict Detection
    const conflicts = await this.prisma.booking.findMany({
      where: {
        venueId: input.venueId,
        status: { notIn: [BookingStatus.CANCELLED, BookingStatus.INQUIRY] },
        OR: [
          { startTime: { gte: input.startTime, lt: input.endTime } },
          { endTime: { gt: input.startTime, lte: input.endTime } },
          { startTime: { lte: input.startTime }, endTime: { gte: input.endTime } }
        ]
      },
    });

    let status: BookingStatus = BookingStatus.INQUIRY; 
    let conflictId: string | null = null;

    if (conflicts.length > 0) {
      status = BookingStatus.CONFLICT;
      conflictId = conflicts[0]?.id ?? null;
    }

    // 4. Pricing Calculation
    const basePrice = input.manualPriceParams?.basePrice
      ? Number(input.manualPriceParams.basePrice)
      : Number(venue.basePrice ?? 0);

    const serviceChargeRate = Number(venue.hotel.serviceChargeRate);
    const vatRate = Number(venue.hotel.vatRate);
    const strategy = venue.hotel.taxStrategy;

    const serviceChargeAmount = basePrice * (serviceChargeRate / 100);

    let taxableAmount = basePrice;
    if (strategy === TaxStrategy.COMPOUND) {
      taxableAmount += serviceChargeAmount;
    }

    const vatAmount = taxableAmount * (vatRate / 100);
    const totalAmount = basePrice + serviceChargeAmount + vatAmount;

    // 5. Create the Booking
    const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;

    return this.prisma.booking.create({
      data: {
        bookingNumber,
        hotelId,
        venueId: input.venueId,
        customerId: input.customerId,
        createdById: input.createdById,
        assignedToId: userRole === "CUSTOMER" ? undefined : input.createdById,

        eventName: input.eventName,
        eventType: input.eventType,
        eventDate: input.startTime,
        startTime: input.startTime,
        endTime: input.endTime,
        guestCount: input.guestCount,
        guaranteedPax: input.guaranteedPax ?? input.guestCount,
        layoutType: input.layoutType,

        basePrice,
        serviceCharge: serviceChargeAmount,
        vat: vatAmount,
        totalAmount,
        currency: venue.hotel.currency,
        vatRateSnapshot: vatRate,
        serviceChargeRateSnapshot: serviceChargeRate,
        taxStrategySnapshot: strategy,

        isPublicBooking: input.isPublicBooking ?? false,
        source: input.source,
        specialRequests: input.specialRequests,
        dietaryRequests: input.dietaryRequests,

        status,
        conflictId,
        notes: input.notes,
      },
    });
  }

  async getBookingById(id: string, userId: string, userRole: string | null | undefined, userHotelId?: string | null) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        venue: true,
        customer: true,
        assignedTo: true,
      },
    });

    if (!booking) return null;

    // Authorization: 
    // - SUPER_ADMIN can see everything
    // - STAFF can see bookings in their hotel
    // - CUSTOMER can see their own bookings (regardless of hotelId in their profile)
    if (userRole === "SUPER_ADMIN") return booking;
    if (booking.customerId === userId) return booking;
    if (userHotelId && booking.hotelId === userHotelId) return booking;

    throw new TRPCError({ code: "UNAUTHORIZED", message: "You do not have access to this booking." });
  }
}
