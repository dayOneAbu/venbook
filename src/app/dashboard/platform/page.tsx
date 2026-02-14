"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/_components/ui/card"
import { authClient } from "~/server/better-auth/client"
import FadeContent from "~/_components/FadeContent"
import { Building2, Users, CreditCard, Activity } from "lucide-react"

export default function PlatformDashboardPage() {
  const { data: session } = authClient.useSession()
  const userName = session?.user?.name ?? "Admin"

  return (
    <div className="space-y-8">
      <FadeContent duration={0.6}>
        <div className="flex flex-col gap-2">
           <h1 className="text-3xl font-bold tracking-tight text-foreground">
             Hello, {userName} 👋
           </h1>
           <p className="text-muted-foreground">
             Welcome to the platform control center. Here&apos;s what&apos;s happening across VenBook.
           </p>
        </div>
      </FadeContent>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 new this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground">+180 new signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450.00</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">All services operational</p>
          </CardContent>
        </Card>
      </div>

      <FadeContent delay={0.4}>
        <div className="rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm">
           <h2 className="text-xl font-semibold mb-2">Platform Management</h2>
           <p className="text-muted-foreground mb-4">
             As a platform admin, you can manage hotels, verify properties, and monitor global usage through the sidebar navigation.
           </p>
           <div className="flex gap-4">
              <div className="h-24 flex-1 rounded-lg bg-muted/30 border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground italic">
                Platform Analytics (Coming Soon)
              </div>
              <div className="h-24 flex-1 rounded-lg bg-muted/30 border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground italic">
                Global Audit Logs (Coming Soon)
              </div>
           </div>
        </div>
      </FadeContent>
    </div>
  )
}
