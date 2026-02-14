"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { authClient } from "~/server/better-auth/client";
import { Button } from "~/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/_components/ui/card";
import { Input } from "~/_components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/_components/ui/field";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function CustomerSignUpPage() {
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

      if (data.user && !data.user.isOnboarded) {
        if (redirectPath && !redirectPath.startsWith("/onboard")) {
          router.push(`/onboard?role=customer&next=${encodeURIComponent(redirectPath)}`);
        } else {
          router.push("/onboard?role=customer");
        }
      } else if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/venues");
      }

      router.refresh();
    },
  });

  useEffect(() => {
    if (!sessionLoading && session?.user) {
      if (redirectPath) router.replace(redirectPath);
      else if (session.user.role === "CUSTOMER") router.replace("/venues");
      else router.replace("/admin");
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
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-slate-50/50">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Create a customer account</CardTitle>
            <CardDescription>Sign up to request bookings from verified hotels.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((values) =>
                signUp.mutate({
                  name: values.name,
                  email: values.email,
                  password: values.password,
                  role: "CUSTOMER",
                }),
              )}
            >
              <FieldGroup>
                {signUp.error && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {signUp.error.message}
                  </div>
                )}

                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    disabled={isSubmitting || signUp.isPending}
                    {...register("name")}
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
                    disabled={isSubmitting || signUp.isPending}
                    {...register("password")}
                  />
                  <FieldError errors={errors.password ? [errors.password] : undefined} />
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting || signUp.isPending}>
                    {isSubmitting || signUp.isPending ? "Creating account..." : "Sign up"}
                  </Button>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <Link
                      href={`/auth/customer/sign-in${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                      className="underline"
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

