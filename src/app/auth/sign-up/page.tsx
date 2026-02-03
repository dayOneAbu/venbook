"use client";

import { useSearchParams } from "next/navigation";
import { SignUpForm } from "~/_components/sign-up-form";
import { AuthFormSplitScreen, type FormValues } from "~/_components/auth-form-split-screen";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Hotel } from "lucide-react";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") ?? "visitor";
  const redirectPath = searchParams.get("redirect");
  const ownerOnboardPath = "/onboard?role=owner";

  const signUpMutation = api.auth.signUp.useMutation({
    onSuccess: async (data, variables) => {
      try {
        await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });
      } catch (err) {
        console.error("Cookie sync failed", err);
      }

      if (data.user && !data.user.isOnboarded) {
        if (role === "owner") {
          router.push(ownerOnboardPath);
        } else if (redirectPath && !redirectPath.startsWith("/onboard")) {
          router.push(`/onboard?role=customer&next=${encodeURIComponent(redirectPath)}`);
        } else {
          router.push("/onboard?role=customer");
        }
      } else if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/admin");
      }
      router.refresh();
    },
  });

  const handleOwnerSubmit = async (data: FormValues) => {
    signUpMutation.mutate({
      name: data.name ?? "",
      email: data.email,
      password: data.password,
      role: "HOTEL_ADMIN",
    });
  };

  if (role === "owner") {
    return (
      <AuthFormSplitScreen
        isSignUp
        notice={
          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            You’re creating a hotel owner account.{" "}
            <a href="/auth/sign-up" className="underline">
              Need a customer account instead?
            </a>
          </div>
        }
        errorMessage={signUpMutation.error?.message ?? null}
        logo={
          <div className="flex items-center gap-2 font-bold text-2xl">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Hotel className="h-6 w-6" />
            </div>
            <span>VenBook <span className="text-primary italic">Pro</span></span>
          </div>
        }
        title="Start Your Journey"
        description="Join Addis Ababa's elite hotel network. Set up your venue in minutes."
        imageSrc="/hero.jpeg"
        imageAlt="Modern Hotel Exterior"
        forgotPasswordHref={`/auth/sign-in?role=owner${redirectPath ? `&redirect=${redirectPath}` : ""}`} // Used for "Sign in here" link
        createAccountHref="#"
        onSubmit={handleOwnerSubmit}
      />
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50/50">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
