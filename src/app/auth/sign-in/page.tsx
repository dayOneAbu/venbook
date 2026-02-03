"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "~/_components/login-form";
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

  const signInMutation = api.auth.signIn.useMutation({
    onSuccess: async (data, variables) => {
      try {
        await fetch("/api/auth/sign-in/email", {
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
    signInMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  if (role === "owner") {
    return (
      <AuthFormSplitScreen
        logo={
          <div className="flex items-center gap-2 font-bold text-2xl">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Hotel className="h-6 w-6" />
            </div>
            <span>VenBook <span className="text-primary italic">Pro</span></span>
          </div>
        }
        title="Welcome back, Partner"
        description="Login to manage your hotel, track bookings, and grow your revenue."
        imageSrc="/hero.jpeg"
        imageAlt="Luxury Hotel Lobby"
        forgotPasswordHref="#"
        createAccountHref={`/auth/sign-up?role=owner${redirectPath ? `&redirect=${redirectPath}` : ""}`}
        onSubmit={handleOwnerSubmit}
        errorMessage={signInMutation.error?.message ?? null}
      />
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50/50">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
