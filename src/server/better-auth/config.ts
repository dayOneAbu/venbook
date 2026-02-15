import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";

import { db } from "~/server/db";
import { env } from "~/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_BASE_URL,
  database: prismaAdapter(db, {
    provider: "postgresql", // or "sqlite" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
      },
      phone: {
        type: "string",
        required: false,
      },
      hotelId: {
        type: "string",
        required: false,
      },
      isOnboarded: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  disablePaths: ["/is-username-available"],
  plugins: [
    username({
      minUsernameLength: 5,
      maxUsernameLength: 100
    }),
    admin()
  ],
  socialProviders: {
  },
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN 
            ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN.split(':')[0]}` 
            : undefined,
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
