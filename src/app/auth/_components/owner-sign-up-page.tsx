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

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function OwnerSignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });

  const signUp = api.auth.signUp.useMutation({
    onSuccess: async (data, variables) => {
      try {
        await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
      } catch {
        // best-effort cookie sync
      }

      let nextPath = "/onboard?role=owner";

      if (data.user && data.user.isOnboarded) {
        nextPath = redirectPath ?? "/admin";
      } else if (redirectPath) {
        // Carry over redirect to onboarding if needed
        nextPath = `/onboard?role=owner&redirect=${encodeURIComponent(redirectPath)}`;
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
        router.replace("/admin");
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
            <h1 className="text-2xl font-semibold tracking-tight">Start Your Journey</h1>
            <p className="text-sm text-muted-foreground">
              Create your hotel owner account. You&apos;ll set up your property in minutes.
            </p>
          </div>

          <form
            onSubmit={handleSubmit((values) =>
              signUp.mutate(values)
            )}
          >
            <FieldGroup>
              {signUp.error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {signUp.error.message}
                </div>
              )}

              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  disabled={isSubmitting || signUp.isPending}
                />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="me@example.com"
                  disabled={isSubmitting || signUp.isPending}
                  {...register("email")}
                />
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  disabled={isSubmitting || signUp.isPending}
                  {...register("password")}
                />
                <FieldError errors={errors.password ? [errors.password] : undefined} />
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting || signUp.isPending}>
                  {isSubmitting || signUp.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link
                    href={`/auth/owner/sign-in${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                    className="underline"
                  >
                    Sign in here
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
