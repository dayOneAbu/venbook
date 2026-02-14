import { createTRPCRouter, superAdminProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  getAllUsers: superAdminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      include: {
        hotel: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});
