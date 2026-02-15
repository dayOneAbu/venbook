import { TRPCError } from "@trpc/server";
import { type db } from "~/server/db";

interface SetupInput {
    name: string;
    subdomain: string;
    address: string;
    email?: string;
    phone?: string;
    tinNumber?: string;
    taxStrategy?: "STANDARD" | "COMPOUND";
    vatRate?: number;
    serviceChargeRate?: number;
    city?: string;
    state?: string;
    country?: string;
}

interface AuditContext {
    isImpersonating: boolean;
    impersonatedBy?: string | null;
}

export class HotelService {
    constructor(private readonly prisma: typeof db) {}

    /**
     * Create a new hotel and assign the owner as HOTEL_ADMIN.
     */
    async setupHotel(userId: string, input: SetupInput) {
        // 1. Check if user is already onboarded
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { hotelId: true, isOnboarded: true },
        });

        if (user?.hotelId || user?.isOnboarded) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "User is already associated with a hotel.",
            });
        }

        // 2. Check subdomain uniqueness
        const existingHotel = await this.prisma.hotel.findUnique({
            where: { subdomain: input.subdomain },
        });

        if (existingHotel) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "This subdomain is already taken.",
            });
        }

        // 3. Create hotel and assign owner in a transaction
        return this.prisma.$transaction(async (tx) => {
            const hotel = await tx.hotel.create({
                data: {
                    ...input,
                    ownerId: userId,
                },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    hotelId: hotel.id,
                    role: "HOTEL_ADMIN",
                    isOnboarded: true,
                },
            });

            return hotel;
        });
    }

    /**
     * Update hotel profile with optional audit logging for impersonated admins.
     */
    async updateProfile(
        hotelId: string,
        input: Record<string, unknown>,
        audit?: AuditContext,
    ) {
        const updatedHotel = await this.prisma.hotel.update({
            where: { id: hotelId },
            data: input,
        });

        if (audit?.isImpersonating && audit.impersonatedBy) {
            await this.prisma.auditLog.create({
                data: {
                    actorId: audit.impersonatedBy,
                    hotelId,
                    action: "UPDATE_HOTEL_PROFILE",
                    resource: "hotel",
                    resourceId: hotelId,
                    details: JSON.stringify(input),
                },
            });
        }

        return updatedHotel;
    }

    /**
     * Update hotel operational settings with optional audit logging.
     */
    async updateSettings(
        hotelId: string,
        input: Record<string, unknown>,
        audit?: AuditContext,
    ) {
        const updatedSettings = await this.prisma.hotel.update({
            where: { id: hotelId },
            data: input,
        });

        if (audit?.isImpersonating && audit.impersonatedBy) {
            await this.prisma.auditLog.create({
                data: {
                    actorId: audit.impersonatedBy,
                    hotelId,
                    action: "UPDATE_HOTEL_SETTINGS",
                    resource: "hotel",
                    resourceId: hotelId,
                    details: JSON.stringify(input),
                },
            });
        }

        return updatedSettings;
    }

    /**
     * Soft-delete a hotel. Only the owner can deactivate.
     */
    async deactivate(hotelId: string, userId: string) {
        const hotel = await this.prisma.hotel.findUnique({
            where: { id: hotelId },
            select: { ownerId: true },
        });

        if (hotel?.ownerId !== userId) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Only the hotel owner can deactivate the property.",
            });
        }

        return this.prisma.hotel.update({
            where: { id: hotelId },
            data: {
                isDeactivated: true,
                deactivatedAt: new Date(),
            },
        });
    }
}
