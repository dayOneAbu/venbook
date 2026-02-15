"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Hotel, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { authClient } from "~/server/better-auth/client";
import { Button } from "~/_components/ui/button";
import { Input } from "~/_components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/_components/ui/field";
import Link from "next/link";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false).optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function OwnerSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });

  const signIn = api.auth.signIn.useMutation({
    onSuccess: async (data, variables) => {
      try {
        await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
      } catch {
        // best-effort cookie sync
      }


      let nextPath = "/admin";
      const userRole = data.user.role;
      const isCustomer = userRole === "CUSTOMER";
      const isSuperAdmin = userRole === "SUPER_ADMIN";

      if (data.user && !data.user.isOnboarded && !isSuperAdmin) {
        const roleParam = isCustomer ? "customer" : "owner";
        nextPath = `/onboard?role=${roleParam}`;
        if (redirectPath) {
          nextPath += `&redirect=${encodeURIComponent(redirectPath)}`;
        }
      } else if (redirectPath && (!isSuperAdmin || !redirectPath.startsWith("/onboard"))) {
        nextPath = redirectPath;
      } else if (isCustomer) {
        nextPath = "/venues";
      } else {
        nextPath = "/dashboard/tenant";
      }

      router.replace(nextPath);
    },
  });

  useEffect(() => {
    if (!sessionLoading && session?.user) {
      if (redirectPath) {
        router.replace(redirectPath);
      } else if (session.user.role === "CUSTOMER") {
        router.replace("/venues");
      } else {
        // Default redirect for owners/staff
        router.replace("/dashboard/tenant");
      }
    }
  }, [redirectPath, router, session?.user, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session?.user) return null;

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row">
      <div className="flex w-full flex-col items-center justify-center bg-background p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 font-bold text-2xl">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Hotel className="h-6 w-6" />
            </div>
            <span>
              VenBook <span className="text-primary italic">Pro</span>
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Partner</h1>
            <p className="text-sm text-muted-foreground">
              Login to manage your hotel, track bookings, and grow your revenue.
            </p>
          </div>

          <form
            onSubmit={handleSubmit((values) =>
              signIn.mutate(values)
            )}
          >
            <FieldGroup>
              {signIn.error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {signIn.error.message}
                </div>
              )}

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="me@example.com"
                  disabled={isSubmitting || signIn.isPending}
                  {...register("email")}
                />
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  disabled={isSubmitting || signIn.isPending}
                  {...register("password")}
                />
                <FieldError errors={errors.password ? [errors.password] : undefined} />
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting || signIn.isPending}>
                  {isSubmitting || signIn.isPending ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/auth/owner/sign-up${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                    className="underline"
                  >
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>

      <div className="relative hidden w-1/2 md:block">
        <Image
          src="/hero.jpeg"
          alt="Luxury Hotel Lobby"
          fill
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
      </div>
    </div>
  );
}
