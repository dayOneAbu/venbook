import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { BookingStatus, BookingSource, TaxStrategy } from "~/generated/prisma";


export const bookingRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        const hotelId = ctx.session.user.hotelId;
        if (!hotelId) return [];

        return ctx.db.booking.findMany({
            where: { hotelId },
            orderBy: { eventDate: "desc" },
            include: {
                venue: true,
                customer: true,
                assignedTo: true,
            },
        });
    }),

    create: protectedProcedure
        .input(
            z.object({
                venueId: z.string(),
                customerId: z.string(),
                eventName: z.string().min(1),
                eventType: z.string().optional(),

                // Scenario 3: Full timestamps
                startTime: z.date(),
                endTime: z.date(),
                guestCount: z.number().int().min(1),
                guaranteedPax: z.number().int().optional(),
                layoutType: z.string().optional(),

                // Pricing inputs (or could be fetched from venue)
                manualPriceParams: z.object({
                    basePrice: z.number().optional(), // If provided, overrides venue default
                }).optional(),

                notes: z.string().optional(),

                // Portal fields
                isPublicBooking: z.boolean().default(false),
                source: z.nativeEnum(BookingSource).default(BookingSource.STAFF),
                specialRequests: z.string().optional(),
                dietaryRequests: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must belong to a hotel to create bookings.",
                });
            }

            // 1. Fetch Venue & Hotel Settings for Pricing & Capacity
            const venue = await ctx.db.venue.findFirst({
                where: { id: input.venueId, hotelId }, // Ensure venue belongs to this hotel
                include: { hotel: true },
            });

            if (!venue) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Venue not found" });
            }

            // Scenario 4: Capacity Check (Soft vs Hard limit)
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

            // 2. Conflict Detection
            const conflicts = await ctx.db.booking.findMany({
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

            // 3. Scenario 7: Snapshot Pricing Calculation
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

            // 4. Create the Booking
            const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;

            return ctx.db.booking.create({
                data: {
                    bookingNumber,
                    hotelId,
                    venueId: input.venueId,
                    customerId: input.customerId,
                    createdById: ctx.session.user.id,
                    assignedToId: ctx.session.user.id,

                    eventName: input.eventName,
                    eventType: input.eventType,
                    eventDate: input.startTime,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    guestCount: input.guestCount,
                    guaranteedPax: input.guaranteedPax ?? input.guestCount,
                    layoutType: input.layoutType,

                    // Snapshot Pricing & Tax (ERCA Compliance)
                    basePrice,
                    serviceCharge: serviceChargeAmount,
                    vat: vatAmount,
                    totalAmount,
                    currency: venue.hotel.currency,
                    vatRateSnapshot: vatRate,
                    serviceChargeRateSnapshot: serviceChargeRate,
                    taxStrategySnapshot: strategy,

                    // Portal & Source
                    isPublicBooking: input.isPublicBooking,
                    source: input.source,
                    specialRequests: input.specialRequests,
                    dietaryRequests: input.dietaryRequests,

                    status,
                    conflictId,
                    notes: input.notes,
                },
            });
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) return null;

            return ctx.db.booking.findFirst({
                where: {
                    id: input.id,
                    hotelId,
                },
                include: {
                    venue: true,
                    customer: true,
                    assignedTo: true,
                },
            });
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                eventName: z.string().optional(),
                eventType: z.string().optional(),
                startTime: z.date().optional(),
                endTime: z.date().optional(),
                guestCount: z.number().int().min(1).optional(),
                notes: z.string().optional(),
                assignedToId: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const booking = await ctx.db.booking.findFirst({
                where: { id: input.id, hotelId },
            });

            if (!booking) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
            }

            // Conflict detection if times change
            let status = booking.status;
            let conflictId = booking.conflictId;

            if (input.startTime || input.endTime) {
                const startTime = input.startTime ?? booking.startTime;
                const endTime = input.endTime ?? booking.endTime;

                const conflicts = await ctx.db.booking.findMany({
                    where: {
                        id: { not: input.id },
                        venueId: booking.venueId,
                        hotelId,
                        status: { notIn: [BookingStatus.CANCELLED, BookingStatus.INQUIRY] },
                        OR: [
                            { startTime: { gte: startTime, lt: endTime } },
                            { endTime: { gt: startTime, lte: endTime } },
                            { startTime: { lte: startTime }, endTime: { gte: endTime } }
                        ]
                    },
                });

                if (conflicts.length > 0) {
                    status = BookingStatus.CONFLICT;
                    conflictId = conflicts[0]?.id ?? null;
                } else if (status === BookingStatus.CONFLICT) {
                    // Resolve status if no more conflicts?
                    // Safe default: leave as is or move to INQUIRY/TENTATIVE
                    status = BookingStatus.INQUIRY;
                    conflictId = null;
                }
            }

            return ctx.db.booking.update({
                where: { id: input.id },
                data: {
                    eventName: input.eventName,
                    eventType: input.eventType,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    eventDate: input.startTime,
                    guestCount: input.guestCount,
                    notes: input.notes,
                    assignedToId: input.assignedToId,
                    status,
                    conflictId,
                },
            });
        }),

    updateStatus: protectedProcedure
        .input(z.object({
            id: z.string(),
            status: z.nativeEnum(BookingStatus)
        }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const booking = await ctx.db.booking.findFirst({
                where: { id: input.id, hotelId },
            });

            if (!booking) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
            }

            return ctx.db.booking.update({
                where: { id: input.id },
                data: { status: input.status },
            });
        }),

    cancel: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const booking = await ctx.db.booking.findFirst({
                where: { id: input.id, hotelId },
            });

            if (!booking) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
            }

            return ctx.db.booking.update({
                where: { id: input.id },
                data: { status: BookingStatus.CANCELLED },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const hotelId = ctx.session.user.hotelId;
            if (!hotelId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const booking = await ctx.db.booking.findFirst({
                where: { id: input.id, hotelId },
            });

            if (!booking) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
            }

            return ctx.db.booking.delete({
                where: { id: input.id },
            });
        }),
});
