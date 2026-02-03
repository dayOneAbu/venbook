"use client";

import Link from "next/link";
import { authClient } from "~/server/better-auth/client";
import { Button } from "~/_components/ui/button";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = authClient.useSession();

  const showBanner =
    session?.user?.role === "CUSTOMER" && !session.user.isOnboarded;

  return (
    <>
      {showBanner && (
        <div className="border-b border-border bg-muted/60">
          <div className="container mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Complete your profile to start booking
              </p>
              <p className="text-xs text-muted-foreground">
                Venues require verified contact details before confirming requests.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/onboard?role=customer">Finish Profile</Link>
            </Button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
