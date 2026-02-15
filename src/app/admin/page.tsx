"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";

export default function AdminRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  
  // Fetch subdomain if the user is a HOTEL_ADMIN
  const { data: subdomain, isLoading: subdomainLoading } = api.hotel.getSubdomain.useQuery(
    undefined, 
    { enabled: !!session?.user && session.user.role === "HOTEL_ADMIN" }
  );

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/auth/owner/sign-in");
      return;
    }

    const role = session.user.role;

    if (role === "SUPER_ADMIN") {
      router.replace("/dashboard/platform");
    } else if (role === "HOTEL_ADMIN") {
      // Direct root path for tenants
      router.replace("/dashboard/tenant");
    } else {
      // Customers or unknown roles go to venues
      router.replace("/venues");
    }
  }, [session, isPending, subdomain, subdomainLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}
