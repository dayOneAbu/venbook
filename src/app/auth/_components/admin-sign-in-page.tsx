"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Shield } from "lucide-react";
import { api } from "~/trpc/react";
import { authClient } from "~/server/better-auth/client";
import { Button } from "~/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/_components/ui/card";
import { Input } from "~/_components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/_components/ui/field";
import Link from "next/link";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function AdminSignInPage() {
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
    onSuccess: async (_data, variables) => {
      try {
        await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
      } catch {
        // best-effort cookie sync
      }

      const hostname = window.location.hostname;
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
      const isRootDomain = hostname === rootDomain.split(":")[0];

      let nextPath = "/"; // For platform subdomains, / rewrites to dashboard/platform

      if (redirectPath) {
        nextPath = redirectPath;
      } else if (isRootDomain) {
        nextPath = "/dashboard/platform";
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
        const hostname = window.location.hostname;
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
        const isRootDomain = hostname === rootDomain.split(":")[0];
        
        router.replace(isRootDomain ? "/dashboard/platform" : "/");
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
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-slate-50/50">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin login
            </CardTitle>
            <CardDescription>Platform access for VenBook administrators.</CardDescription>
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
                    placeholder="admin@venbook.com"
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
                  <FieldDescription className="text-center">
                    Not an admin?{" "}
                    <Link href="/auth/customer/sign-in" className="underline">
                      Customer login
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

