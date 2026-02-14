"use client";

import { useOnboardingStore } from "~/lib/store/onboarding-store";
import { Button } from "~/_components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export function OnboardingSummary() {
  const { hotelData, prevStep, reset } = useOnboardingStore();
  const router = useRouter();

  const setupMutation = api.hotel.setup.useMutation({
    onSuccess: (hotel) => {
      toast.success("Setup complete! Welcome aboard.");
      reset();

      const hostname = window.location.hostname;
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
      const isRootDomain = hostname === rootDomain.split(":")[0];

      if (isRootDomain && hotel.subdomain) {
        router.push(`/dashboard/tenant/${hotel.subdomain}/admin`);
      } else {
        router.push("/admin");
      }
      
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleFinish = () => {
    setupMutation.mutate({
      name: hotelData.name,
      subdomain: hotelData.subdomain,
      address: hotelData.address,
      email: hotelData.email,
      phone: hotelData.phone,
      tinNumber: hotelData.tinNumber,
      taxStrategy: hotelData.taxStrategy,
      vatRate: hotelData.vatRate,
      serviceChargeRate: hotelData.serviceChargeRate,
    });
  };

  return (
    <div className="space-y-8">
      {setupMutation.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {setupMutation.error.message || "Unable to complete setup right now."}
        </div>
      )}
      <div className="space-y-2 text-center">
        <div className="flex justify-center pb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Ready to launch?</h2>
        <p className="text-muted-foreground">
          Review your settings before finishing the setup.
        </p>
      </div>

      <div className="bg-slate-50 rounded-lg p-6 space-y-4 border border-slate-100">
        <div className="grid grid-cols-2 gap-y-4 text-sm">
          <div className="text-slate-500">Hotel Name</div>
          <div className="font-semibold text-right">{hotelData.name}</div>

          <div className="text-slate-500">Subdomain</div>
          <div className="font-semibold text-right italic text-primary">{hotelData.subdomain}.venbook.com</div>
          
          <div className="text-slate-500">TIN Number</div>
          <div className="font-semibold text-right">{hotelData.tinNumber}</div>
          
          <div className="text-slate-500">Tax Strategy</div>
          <div className="font-semibold text-right">{hotelData.taxStrategy}</div>
          
          <div className="text-slate-500">VAT Rate</div>
          <div className="font-semibold text-right">{hotelData.vatRate}%</div>
          
          <div className="text-slate-500">Service Charge</div>
          <div className="font-semibold text-right">{hotelData.serviceChargeRate}%</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={prevStep} disabled={setupMutation.isPending}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Review Settings
        </Button>
        <Button 
          onClick={handleFinish} 
          size="lg" 
          className="px-8 bg-green-600 hover:bg-green-700"
          disabled={setupMutation.isPending}
        >
          {setupMutation.isPending ? "Setting up..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
}
