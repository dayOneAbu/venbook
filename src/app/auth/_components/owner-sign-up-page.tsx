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
import { Field, FieldError, FieldLabel } from "~/_components/ui/field";

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
    watch,
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });

  const watchedValues = watch();

  const signUp = api.auth.signUp.useMutation({
    onSuccess: async (data, variables) => {
      // First try to sync cookies via better-auth API route
      try {
        await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
      } catch (error) {
        console.error("Cookie sync failed:", error);
        // Continue anyway - cookies are best-effort
      }

      // Handle navigation
      if (data.user && !data.user.isOnboarded) {
        router.push("/onboard?role=owner");
      } else if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/admin");
      }
    },
    onError: (error) => {
      console.error("Sign up failed:", error);
    },
  });

  // Temporarily disabled session checks for debugging
  // useEffect(() => {
  //   if (!sessionLoading && session?.user) {
  //     if (redirectPath) router.replace(redirectPath);
  //     else if (session.user.role === "CUSTOMER") router.replace("/venues");
  //     else router.replace("/admin");
  //   }
  // }, [redirectPath, router, session?.user, sessionLoading]);

  // if (sessionLoading) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //     <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //   </div>
  //   );
  // }

  // if (session?.user) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/50 p-8">
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

          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
            Debug: isSubmitting={String(isSubmitting)}, errors={JSON.stringify(errors)}, values={JSON.stringify(watchedValues)}
          </div>

          <form
            onSubmit={handleSubmit((values) => {
              console.log("Form submitted with values:", values);
              console.log("Form is valid:", !Object.keys(errors).length);
              signUp.mutate({
                name: values.name,
                email: values.email,
                password: values.password,
                role: "HOTEL_ADMIN",
              });
            }, (errors) => {
              console.log("Form validation errors:", errors);
            })}
            className="space-y-4"
          >
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
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
                disabled={isSubmitting || signUp.isPending}
              />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                {...register("password")}
                disabled={isSubmitting || signUp.isPending}
              />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={false}
              onClick={() => {
                console.log("Button clicked");
                alert("Button clicked!");
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/auth/owner/sign-in${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              className="font-medium text-primary hover:underline"
            >
              Sign in here
            </Link>
            .
          </p>
      </div>
    </div>
  );
}

