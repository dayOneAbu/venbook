import { AppSidebar } from "~/_components/app-sidebar"
import { ModeToggle } from "~/_components/mode-toggle"
import { NotificationBell } from "~/_components/notification-bell"
import { Separator } from "~/_components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/_components/ui/sidebar"

import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as { user: { role: string } } | null;

  // Physically restict to SUPER_ADMIN
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar context="platform" />
      <SidebarInset>
        <header className="grid h-16 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="text-center font-bold">
             Platform Control Center
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
