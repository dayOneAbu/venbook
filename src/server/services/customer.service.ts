import { TRPCError } from "@trpc/server";
import { type db } from "~/server/db";
import { CustomerType } from "~/generated/prisma";

interface AuditContext {
    isImpersonating: boolean;
    impersonatedBy?: string | null;
}

interface CreateCustomerInput {
    companyName: string;
    hotelId: string;
    contactName?: string;
    email?: string;
    phone?: string;
    tinNumber?: string;
    type?: CustomerType;
}

interface UpdateCustomerInput {
    companyName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    tinNumber?: string;
    type?: CustomerType;
}

export class CustomerService {
    constructor(private readonly prisma: typeof db) {}

    async create(input: CreateCustomerInput, audit?: AuditContext) {
        const customer = await this.prisma.customer.create({
            data: {
                ...input,
                type: input.type ?? CustomerType.INDIVIDUAL,
            },
        });

        if (audit?.isImpersonating && audit.impersonatedBy) {
            await this.prisma.auditLog.create({
                data: {
                    actorId: audit.impersonatedBy,
                    hotelId: input.hotelId,
                    action: "CREATE_CUSTOMER",
                    resource: "customer",
                    resourceId: customer.id,
                    details: `Created customer: ${customer.companyName}`,
                },
            });
        }

        return customer;
    }

    async update(id: string, hotelId: string, input: UpdateCustomerInput, audit?: AuditContext) {
        // Ensure customer belongs to hotel
        const customer = await this.prisma.customer.findFirst({
            where: { id, hotelId },
        });

        if (!customer) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
        }

        const updatedCustomer = await this.prisma.customer.update({
            where: { id },
            data: input,
        });

        if (audit?.isImpersonating && audit.impersonatedBy) {
            await this.prisma.auditLog.create({
                data: {
                    actorId: audit.impersonatedBy,
                    hotelId,
                    action: "UPDATE_CUSTOMER",
                    resource: "customer",
                    resourceId: id,
                    details: JSON.stringify(input),
                },
            });
        }

        return updatedCustomer;
    }

    async delete(id: string, hotelId: string, audit?: AuditContext) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, hotelId },
        });

        if (!customer) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
        }

        const deletedCustomer = await this.prisma.customer.delete({
            where: { id },
        });

        if (audit?.isImpersonating && audit.impersonatedBy) {
            await this.prisma.auditLog.create({
                data: {
                    actorId: audit.impersonatedBy,
                    hotelId,
                    action: "DELETE_CUSTOMER",
                    resource: "customer",
                    resourceId: id,
                    details: `Deleted customer: ${customer.companyName}`,
                },
            });
        }

        return deletedCustomer;
    }

    async getById(id: string, hotelId: string) {
        return this.prisma.customer.findFirst({
            where: { id, hotelId },
        });
    }

    async getAll(hotelId: string) {
        return this.prisma.customer.findMany({
            where: { hotelId },
            orderBy: { createdAt: "desc" },
        });
    }
}
