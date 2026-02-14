import { AppSidebar } from "~/_components/app-sidebar"
import { ModeToggle } from "~/_components/mode-toggle"
import { Separator } from "~/_components/ui/separator"
import { NotificationBell } from "~/_components/notification-bell"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/_components/ui/sidebar"
import { AdminPageTitle } from "./_components/admin-page-title"

import { db } from "~/server/db";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as { user: { id: string; role: string; isOnboarded: boolean; hotelId?: string } } | null;

  if (session?.user?.role !== "SUPER_ADMIN") {
    if (!session?.user?.isOnboarded) {
      redirect("/onboard");
    }

    const { subdomain } = await params;
    
    if (!session?.user?.hotelId) {
       redirect("/onboard");
    }

    // Verify subdomain matches user's hotel
    const hotel = await db.hotel.findFirst({
      where: { 
        id: session.user.hotelId,
        subdomain: subdomain
      },
      select: { id: true }
    });

    if (!hotel) {
      // User is logged into a hotel but trying to access the WRONG subdomain
      // Redirect to their correct dashboard or unauthorized page
      // For now, redirect to onboard which will then redirect to their correct dashboard if already onboarded
      redirect("/onboard");
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar context="tenant" />
      <SidebarInset>
        <header className="grid h-16 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="text-center">
            <AdminPageTitle />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 space-y-4 p-4 pt-6">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
