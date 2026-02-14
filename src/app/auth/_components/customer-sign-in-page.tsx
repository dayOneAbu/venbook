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

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function CustomerSignInPage() {
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

      let nextPath = "/venues";

      if (data.user && !data.user.isOnboarded) {
        if (redirectPath && !redirectPath.startsWith("/onboard")) {
          nextPath = `/onboard?role=customer&next=${encodeURIComponent(redirectPath)}`;
        } else {
          nextPath = "/onboard?role=customer";
        }
      } else if (redirectPath) {
        nextPath = redirectPath;
      }

      router.replace(nextPath);
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
            <CardTitle>Customer login</CardTitle>
            <CardDescription>Sign in to browse venues and request bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((values) => signIn.mutate(values))}>
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
                  <Button type="submit" disabled={isSubmitting || signIn.isPending}>
                    {isSubmitting || signIn.isPending ? "Signing in..." : "Login"}
                  </Button>
                  <Button variant="outline" type="button" disabled>
                    Login with Google
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link href={`/auth/customer/sign-up${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="underline">
                      Sign up
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

