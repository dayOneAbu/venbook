import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { BookingStatus, BookingSource } from "~/generated/prisma";
import { BookingService } from "~/server/services/booking.service";


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

    getMyBookings: protectedProcedure.query(({ ctx }) => {
        return ctx.db.booking.findMany({
            where: { createdById: ctx.session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                venue: {
                    include: {
                        images: { take: 1 },
                    }
                },
                hotel: {
                    select: { name: true, city: true }
                }
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
            const bookingService = new BookingService(ctx.db);
            return bookingService.createBooking(
                {
                    ...input,
                    createdById: ctx.session.user.id,
                },
                ctx.session.user.role,
                ctx.session.user.hotelId,
                ctx.isImpersonating
            );
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const bookingService = new BookingService(ctx.db);
            return bookingService.getBookingById(
                input.id,
                ctx.session.user.id,
                ctx.session.user.role,
                ctx.session.user.hotelId
            );
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

            // Security & Auditing
            if (ctx.session.user.role === "SUPER_ADMIN") {
                if (!ctx.isImpersonating) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Super Admins must use Impersonation Mode to update bookings.",
                    });
                }
            }

            const updatedBooking = await ctx.db.booking.update({
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

            if (ctx.isImpersonating && ctx.session.session.impersonatedBy) {
                await ctx.db.auditLog.create({
                    data: {
                        actorId: ctx.session.session.impersonatedBy,
                        hotelId,
                        action: "UPDATE_BOOKING",
                        resource: "booking",
                        resourceId: updatedBooking.id,
                        details: `Updated booking ${booking.bookingNumber}`,
                    },
                });
            }

            return updatedBooking;
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

            // Security & Auditing
            if (ctx.session.user.role === "SUPER_ADMIN" && !ctx.isImpersonating) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Super Admins must use Impersonation Mode." });
            }

            const cancelledBooking = await ctx.db.booking.update({
                where: { id: input.id },
                data: { status: BookingStatus.CANCELLED },
            });

            if (ctx.isImpersonating && ctx.session.session.impersonatedBy) {
                await ctx.db.auditLog.create({
                    data: {
                        actorId: ctx.session.session.impersonatedBy,
                        hotelId,
                        action: "CANCEL_BOOKING", // or UPDATE_STATUS
                        resource: "booking",
                        resourceId: input.id,
                        details: "Cancelled booking",
                    },
                });
            }

            return cancelledBooking;
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

            // Security & Auditing
            if (ctx.session.user.role === "SUPER_ADMIN" && !ctx.isImpersonating) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Super Admins must use Impersonation Mode." });
            }

            const deletedBooking = await ctx.db.booking.delete({
                where: { id: input.id },
            });

            if (ctx.isImpersonating && ctx.session.session.impersonatedBy) {
                await ctx.db.auditLog.create({
                    data: {
                        actorId: ctx.session.session.impersonatedBy,
                        hotelId,
                        action: "DELETE_BOOKING",
                        resource: "booking",
                        resourceId: input.id,
                        details: "Deleted booking",
                    },
                });
            }

            return deletedBooking;
        }),
});
