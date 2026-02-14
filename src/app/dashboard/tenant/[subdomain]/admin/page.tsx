"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/_components/ui/card"
import { authClient } from "~/server/better-auth/client"
import FadeContent from "~/_components/FadeContent"
import { Building2, Users, CalendarCheck2, CreditCard, Activity } from "lucide-react"

export default function Page() {
  const { data: session } = authClient.useSession()
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"
  const userName = session?.user?.name ?? "User"

  return (
    <div className="space-y-8">
      <FadeContent duration={0.6}>
        <div className="flex flex-col gap-2">
           <h1 className="text-3xl font-bold tracking-tight text-foreground">
             Hello, {userName} 👋
           </h1>
           <p className="text-muted-foreground">
             {isSuperAdmin 
              ? "Welcome to the platform control center. Here's what's happening across VenBook."
              : "Welcome to your hotel management dashboard. Monitor your operations and venues."}
           </p>
        </div>
      </FadeContent>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSuperAdmin ? "Total Hotels" : "Total Bookings"}
            </CardTitle>
            {isSuperAdmin ? <Building2 className="h-4 w-4 text-muted-foreground" /> : <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isSuperAdmin ? "12" : "48"}</div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? "+2 new this week" : "+12% from last month"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSuperAdmin ? "Platform Users" : "Active Venues"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isSuperAdmin ? "1,204" : "6"}</div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? "+180 new signups" : "All venues active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isSuperAdmin ? "$12,450.00" : "$4,231.89"}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Status
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All services operational
            </p>
          </CardContent>
        </Card>
      </div>

      <FadeContent delay={0.4}>
        <div className="rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm">
           <h2 className="text-xl font-semibold mb-2">Getting Started with VenBook</h2>
           <p className="text-muted-foreground mb-4">
             {isSuperAdmin 
              ? "As a platform admin, you can manage hotels, verify properties, and monitor global usage through the sidebar navigation."
              : "As a hotel owner, use the sidebar to manage your venues, staff members, and forthcoming booking requests."}
           </p>
           <div className="flex gap-4">
              <div className="h-24 flex-1 rounded-lg bg-muted/30 border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground italic">
                Performance Analytics (Coming Soon)
              </div>
              <div className="h-24 flex-1 rounded-lg bg-muted/30 border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground italic">
                Operational Insights (Coming Soon)
              </div>
           </div>
        </div>
      </FadeContent>
    </div>
  )
}
