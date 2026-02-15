"use client";

import { useEffect, Suspense } from "react";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "~/_components/ui/field";
import { toast } from "sonner";

const acceptInviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must include uppercase, lowercase, and a number"
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    if (!sessionLoading && session?.user) {
      router.replace("/dashboard/tenant");
    }
  }, [session, sessionLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormData>({ resolver: zodResolver(acceptInviteSchema) });

  const acceptInvite = api.invite.accept.useMutation({
    onSuccess: async (data) => {
      toast.success(`Welcome to ${data.hotelName}!`);
      
      await authClient.signIn.email({
        email: "", 
        password: "", 
      });
      
      router.push("/auth/owner/sign-in"); 
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const onSubmit = (values: AcceptInviteFormData) => {
    if (!token) {
      toast.error("Invalid invite link");
      return;
    }
    
    acceptInvite.mutate({
      token,
      name: values.name,
      password: values.password,
    });
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-sm border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Invite</CardTitle>
            <CardDescription>
              This invite link is missing a token. Please check the link you were sent.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-slate-50/50">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>Set up your account to join your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    disabled={isSubmitting || acceptInvite.isPending}
                    {...register("name")}
                  />
                  <FieldError errors={errors.name ? [errors.name] : undefined} />
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Create Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    disabled={isSubmitting || acceptInvite.isPending}
                    {...register("password")}
                  />
                  <FieldError errors={errors.password ? [errors.password] : undefined} />
                </Field>

                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    disabled={isSubmitting || acceptInvite.isPending}
                    {...register("confirmPassword")}
                  />
                  <FieldError errors={errors.confirmPassword ? [errors.confirmPassword] : undefined} />
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting || acceptInvite.isPending}>
                    {isSubmitting || acceptInvite.isPending ? "Joining..." : "Join Hotel"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <InviteForm />
    </Suspense>
  );
}
