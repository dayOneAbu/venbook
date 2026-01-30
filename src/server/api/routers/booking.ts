import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { BookingStatus } from "../../../../generated/prisma";


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

                // Pricing inputs (or could be fetched from venue)
                manualPriceParams: z.object({
                    basePrice: z.number().optional(), // If provided, overrides venue default
                }).optional(),

                notes: z.string().optional(),
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
            // For MVP, we'll block if strictly above capacity (using max of all layouts for now)
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

            // 2. Scenario 1 & 3: Conflict Detection
            // Check for any booking that overlaps with the requested time range
            const conflicts = await ctx.db.booking.findMany({
                where: {
                    venueId: input.venueId,
                    status: { notIn: [BookingStatus.CANCELLED, BookingStatus.INQUIRY] }, // Inquiries don't block?
                    OR: [
                        {
                            // Existing starts inside new
                            startTime: { gte: input.startTime, lt: input.endTime }
                        },
                        {
                            // Existing ends inside new
                            endTime: { gt: input.startTime, lte: input.endTime }
                        },
                        {
                            // Existing encompasses new
                            startTime: { lte: input.startTime },
                            endTime: { gte: input.endTime }
                        }
                    ]
                },
            });

            let status: BookingStatus = BookingStatus.INQUIRY; // Default starting status
            let conflictId: string | null = null;

            if (conflicts.length > 0) {
                // In a "Real-time" app we might throw error. 
                // But for "Offline Sync" support (Scenario 1), we might create it as CONFLICT
                // For this MVP implementation, let's just throw error for now to keep it simple unless explicit "force" flag is added.
                // Or per scenario requirement: "We need a Sync Conflict state"
                status = BookingStatus.CONFLICT;
                conflictId = conflicts[0]?.id ?? null; // Link to the first conflict found
            }

            // 3. Scenario 7: Snapshot Pricing Calculation
            // Logic: Calculate tax based on Hotel Strategy
            const basePrice = input.manualPriceParams?.basePrice
                ? Number(input.manualPriceParams.basePrice)
                : Number(venue.basePrice ?? 0);

            const serviceChargeRate = Number(venue.hotel.serviceChargeRate) / 100;
            const vatRate = Number(venue.hotel.vatRate) / 100;

            const serviceChargeAmount = basePrice * serviceChargeRate;

            let taxableAmount = basePrice;
            if (venue.hotel.taxStrategy === "COMPOUND") {
                taxableAmount += serviceChargeAmount;
            }

            const vatAmount = taxableAmount * vatRate;
            const totalAmount = basePrice + serviceChargeAmount + vatAmount;

            // 4. Create the Booking
            // Generate readable number (BK-Timestamp for MVP simplicity, real world needs optimized counter)
            const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;

            return ctx.db.booking.create({
                data: {
                    bookingNumber,
                    hotelId,
                    venueId: input.venueId,
                    customerId: input.customerId,
                    createdById: ctx.session.user.id,
                    assignedToId: ctx.session.user.id, // Scenario 10: Default to creator

                    eventName: input.eventName,
                    eventType: input.eventType,
                    eventDate: input.startTime, // Keeping the legacy date field as start date
                    startTime: input.startTime,
                    endTime: input.endTime,
                    guestCount: input.guestCount,

                    // Snapshot Pricing
                    basePrice,
                    serviceCharge: serviceChargeAmount,
                    vat: vatAmount,
                    totalAmount,
                    currency: venue.hotel.currency,

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
