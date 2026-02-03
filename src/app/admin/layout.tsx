import { AppSidebar } from "~/_components/app-sidebar"
import { ModeToggle } from "~/_components/mode-toggle"
import { Separator } from "~/_components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/_components/ui/sidebar"

import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.isOnboarded) {
    redirect("/onboard");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-sm font-medium">VenBook</h1>
          </div>
          <ModeToggle />
        </header>
        <div className="flex-1 space-y-4 p-4 pt-6">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
