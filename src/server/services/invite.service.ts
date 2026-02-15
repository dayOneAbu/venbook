import { TRPCError } from "@trpc/server";
import { type db } from "~/server/db";
import { auth } from "~/server/better-auth";

export class InviteService {
    constructor(private readonly prisma: typeof db) {}

    /**
     * Create an invite token for a staff member.
     * Uses crypto.randomUUID() for secure token generation.
     */
    async createInvite(hotelId: string, email: string, role: string) {
        // Check if user already exists in this hotel
        const existingUser = await this.prisma.user.findFirst({
            where: { email, hotelId },
        });

        if (existingUser) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "A user with this email already belongs to this hotel.",
            });
        }

        // Check for existing pending invite
        const existingInvite = await this.prisma.invite.findFirst({
            where: { email, hotelId },
        });

        if (existingInvite) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "An invite for this email already exists.",
            });
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        return this.prisma.invite.create({
            data: {
                email,
                role: role as "SALES" | "OPERATIONS" | "FINANCE" | "HOTEL_ADMIN",
                hotelId,
                token,
                expiresAt,
            },
        });
    }

    /**
     * Accept an invite: validate token, create Better Auth account,
     * assign hotel + role, delete the invite.
     */
    async acceptInvite(
        token: string,
        name: string,
        password: string,
        headers: Headers,
    ) {
        // 1. Look up the invite
        const invite = await this.prisma.invite.findUnique({
            where: { token },
            include: { hotel: { select: { name: true } } },
        });

        if (!invite) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "This invite link is invalid or has already been used.",
            });
        }

        // 2. Check expiry
        if (new Date() > invite.expiresAt) {
            // Clean up expired invite
            await this.prisma.invite.delete({ where: { id: invite.id } });
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "This invite has expired. Please ask your admin to send a new one.",
            });
        }

        // 3. Check if email already has an account
        const existingUser = await this.prisma.user.findUnique({
            where: { email: invite.email },
        });

        if (existingUser) {
            // If user exists but isn't in a hotel, just link them
            if (!existingUser.hotelId) {
                await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        hotelId: invite.hotelId,
                        role: invite.role,
                        isOnboarded: true,
                    },
                });

                await this.prisma.invite.delete({ where: { id: invite.id } });

                return {
                    success: true,
                    hotelName: invite.hotel.name,
                    isExistingUser: true,
                };
            }

            throw new TRPCError({
                code: "CONFLICT",
                message: "This email already belongs to another hotel.",
            });
        }

        // 4. Create Better Auth account
        const result = await auth.api.signUpEmail({
            body: {
                email: invite.email,
                password,
                name,
                role: invite.role,
            },
            headers,
        });

        // 5. Link to hotel
        await this.prisma.user.update({
            where: { id: result.user.id },
            data: {
                hotelId: invite.hotelId,
                role: invite.role,
                isOnboarded: true,
            },
        });

        // 6. Consume invite
        await this.prisma.invite.delete({ where: { id: invite.id } });

        return {
            success: true,
            hotelName: invite.hotel.name,
            isExistingUser: false,
        };
    }
}
