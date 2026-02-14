"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "~/lib/utils"
import { Button } from "~/_components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/_components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/_components/ui/field"
import { Input } from "~/_components/ui/input"
import { api } from "~/trpc/react"

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const signUp = api.auth.signUp.useMutation({
    onSuccess: async (data, variables) => {
      // After successful tRPC call, set cookies via better-auth API route
      try {
        await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
      } catch {
        // Cookie setting is best-effort
      }

      // Handle Redirection
      if (data.user && !data.user.isOnboarded) {
        const redirectPath = searchParams.get("redirect");
        if (redirectPath && !redirectPath.startsWith("/onboard")) {
          router.push(`/onboard?role=customer&next=${encodeURIComponent(redirectPath)}`);
        } else {
          router.push("/onboard?role=customer");
        }
      } else if (searchParams.get("redirect")) {
        router.push(searchParams.get("redirect")!);
      } else {
        router.push("/admin");
      }

      router.refresh();
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    signUp.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "CUSTOMER",
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {signUp.error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {signUp.error.message}
                </div>
              )}
              {signUp.error && (
                <Field>
                  <FieldError>{signUp.error.message}</FieldError>
                </Field>
              )}
              <Field>
                <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  You’re creating a customer account to book venues.{" "}
                  <Link href="/auth/owner/sign-up" className="underline">
                    Need a hotel account instead?
                  </Link>
                </div>
              </Field>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  aria-invalid={!!errors.name}
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
                  aria-invalid={!!errors.email}
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
                  aria-invalid={!!errors.password}
                  {...register("password")}
                  disabled={isSubmitting || signUp.isPending}
                />
                <FieldError errors={errors.password ? [errors.password] : undefined} />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting || signUp.isPending}>
                  {isSubmitting || signUp.isPending ? "Creating account..." : "Sign up"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href="/auth/customer/sign-in" className="underline">
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
