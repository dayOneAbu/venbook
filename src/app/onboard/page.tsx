"use client";

import { useOnboardingStore } from "~/lib/store/onboarding-store";
import { useCustomerOnboardingStore } from "~/lib/store/customer-onboarding-store";
import { HotelProfileForm } from "./_components/hotel-profile-form";
import { TaxSettingsForm } from "./_components/tax-settings-form";
import { OnboardingSummary } from "./_components/onboarding-summary";
import { CustomerProfileForm } from "./_components/customer-profile-form";
import { CustomerOrganizationForm } from "./_components/customer-organization-form";
import { CustomerFinishForm } from "./_components/customer-finish-form";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "~/_components/ui/card";
import { Progress } from "~/_components/ui/progress";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import BlurText from "~/_components/ui/BlurText";
import FadeContent from "~/_components/FadeContent";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") ?? "").toLowerCase();
  const { data: session, isPending } = authClient.useSession();

  const hotelStep = useOnboardingStore((state) => state.step);
  const customerStep = useCustomerOnboardingStore((state) => state.step);
  const router = useRouter();

  useEffect(() => {
    if (isPending || !session?.user) return;

    if (session.user.role === "SUPER_ADMIN") {
      router.replace("/dashboard/platform");
      return;
    }

    if (session.user.isOnboarded) {
      if (session.user.role === "HOTEL_ADMIN") {
        router.replace("/admin");
      } else if (session.user.role === "CUSTOMER") {
        router.replace("/venues");
      }
    }
  }, [session, isPending, router]);

  const flow =
    roleParam === "owner" || roleParam === "hotel_admin"
      ? "owner"
      : roleParam === "customer"
        ? "customer"
        : session?.user?.role === "HOTEL_ADMIN"
          ? "owner"
          : "customer";

  const totalSteps = flow === "owner" ? 3 : 3;
  const step = flow === "owner" ? hotelStep : customerStep;
  const progress = (step / totalSteps) * 100;

  if (isPending || (!roleParam && !session?.user)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading onboarding...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-4 text-center">
          <BlurText 
            text={flow === "owner" ? "Welcome to VenBook" : "Complete Your Profile"}
            className="text-4xl font-extrabold tracking-tight text-foreground justify-center" 
            delay={150}
          />
          <FadeContent delay={500}>
            <p className="text-muted-foreground text-lg">
              {flow === "owner"
                ? "Let's get your hotel set up for success."
                : "Just a couple of steps before you start booking."}
            </p>
          </FadeContent>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground font-medium px-1">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border border-border shadow-xl bg-card overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {flow === "owner" && step === 1 && <HotelProfileForm />}
                {flow === "owner" && step === 2 && <TaxSettingsForm />}
                {flow === "owner" && step === 3 && <OnboardingSummary />}

                {flow === "customer" && step === 1 && <CustomerProfileForm />}
                {flow === "customer" && step === 2 && <CustomerOrganizationForm />}
                {flow === "customer" && step === 3 && <CustomerFinishForm />}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
