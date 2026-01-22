"use client";

import { useRouter } from "next/navigation";
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

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const signIn = api.auth.signIn.useMutation({
    onSuccess: async (_, variables) => {
      // After successful tRPC call, set cookies via better-auth API route
      // This ensures cookies are properly set for session management
      try {
        await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
      } catch {
        // Cookie setting is best-effort, session should still work
      }
      router.push("/");
      router.refresh();
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    signIn.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {signIn.error && (
              <Field>
                  <FieldError>{signIn.error.message}</FieldError>
                </Field>
              )}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="me@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                  disabled={isSubmitting || signIn.isPending}
                />
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                  disabled={isSubmitting || signIn.isPending}
                />
                <FieldError errors={errors.password ? [errors.password] : undefined} />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting || signIn.isPending}>
                  {isSubmitting || signIn.isPending ? "Signing in..." : "Login"}
                </Button>
                <Button variant="outline" type="button" disabled={isSubmitting || signIn.isPending}>
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a href="/auth/sign-up" className="underline">
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
