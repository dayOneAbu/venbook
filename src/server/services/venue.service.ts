import { TRPCError } from "@trpc/server";
import { type db } from "~/server/db";

interface AuditContext {
    isImpersonating: boolean;
    impersonatedBy?: string | null;
}

interface CreateVenueInput {
    name: string;
    hotelId: string;
    description?: string;
    basePrice?: number;
    capacityBanquet?: number;
    capacityTheater?: number;
    capacityReception?: number;
    capacityUshape?: number;
}

interface UpdateVenueInput {
    name?: string;
    description?: string;
    basePrice?: number;
    capacityBanquet?: number;
    capacityTheater?: number;
    capacityReception?: number;
    capacityUshape?: number;
}

export class VenueService {
    constructor(private readonly prisma: typeof db) {}

    async create(input: CreateVenueInput, audit?: AuditContext) {
        const slug = input.name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).substring(2, 7);
        
        const venue = await this.prisma.venue.create({
            data: {
                ...input,
                slug,
            },
        });

        if (audit?.isImpersonating && audit.impersonatedBy) {
            await this.prisma.auditLog.create({
                data: {
                    actorId: audit.impersonatedBy,
                    hotelId: input.hotelId,
                    action: "CREATE_VENUE",
                    resource: "venue",
                    resourceId: venue.id,
                    details: `Created venue: ${venue.name}`,
                },
            });
        }

        return venue;
    }

    async update(id: string, hotelId: string, input: UpdateVenueInput, audit?: AuditContext) {
        // Ensure venue belongs to hotel
        const venue = await this.prisma.venue.findFirst({
            where: { id, hotelId },
        });

        if (!venue) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Venue not found" });
        }

        const updatedVenue = await this.prisma.venue.update({
            where: { id },
            data: input,
        });

        if (audit?.isImpersonating && audit.impersonatedBy) {
            await this.prisma.auditLog.create({
                data: {
                    actorId: audit.impersonatedBy,
                    hotelId,
                    action: "UPDATE_VENUE",
                    resource: "venue",
                    resourceId: id,
                    details: JSON.stringify(input),
                },
            });
        }

        return updatedVenue;
    }

    async delete(id: string, hotelId: string, audit?: AuditContext) {
        const venue = await this.prisma.venue.findFirst({
            where: { id, hotelId },
        });

        if (!venue) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Venue not found" });
        }

        const deletedVenue = await this.prisma.venue.delete({
            where: { id },
        });

        if (audit?.isImpersonating && audit.impersonatedBy) {
            await this.prisma.auditLog.create({
                data: {
                    actorId: audit.impersonatedBy,
                    hotelId,
                    action: "DELETE_VENUE",
                    resource: "venue",
                    resourceId: id,
                    details: `Deleted venue: ${venue.name}`,
                },
            });
        }

        return deletedVenue;
    }

    async getById(id: string, hotelId: string) {
        return this.prisma.venue.findFirst({
            where: { id, hotelId },
            include: { images: true, amenities: true },
        });
    }

    async getAll(hotelId: string) {
        return this.prisma.venue.findMany({
            where: { hotelId },
            include: { images: true },
            orderBy: { createdAt: "desc" },
        });
    }
}
