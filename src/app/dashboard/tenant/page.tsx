"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/_components/ui/card"
import { authClient } from "~/server/better-auth/client"
import { api } from "~/trpc/react"
import FadeContent from "~/_components/FadeContent"
import { CalendarCheck2, MapPin, CreditCard, Users2 } from "lucide-react"
import { MarketplaceReadiness } from "~/_components/dashboard/MarketplaceReadiness"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Page() {
  const { data: session } = authClient.useSession()
  const userName = session?.user?.name ?? "User"

  const { data: bookings } = api.booking.getAll.useQuery()
  const { data: venues } = api.venue.getAll.useQuery()
  const { data: customers } = api.customer.getAll.useQuery()
  const { data: billing } = api.billing.getSummary.useQuery()

  const totalBookings = bookings?.length ?? 0
  const confirmedBookings = bookings?.filter(b => b.status === "CONFIRMED" || b.status === "TENTATIVE").length ?? 0
  const activeVenues = venues?.length ?? 0
  const totalCustomers = customers?.length ?? 0

  return (
    <div className="space-y-8">
      <FadeContent duration={0.6}>
        <div className="flex flex-col gap-2">
           <h1 className="text-3xl font-bold tracking-tight text-foreground">
             Hello, {userName} 👋
           </h1>
           <p className="text-muted-foreground">
             Welcome to your hotel management dashboard. Here&apos;s a snapshot of your operations.
           </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <MarketplaceReadiness />
      </FadeContent>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedBookings} confirmed / tentative
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVenues}</div>
            <p className="text-xs text-muted-foreground">
              Registered venues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All-Time Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billing ? formatCurrency(billing.allTimeRevenue) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {billing ? `${formatCurrency(billing.pendingRevenue)} pending` : "Loading..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Registered clients
            </p>
          </CardContent>
        </Card>
      </div>

      <FadeContent delay={0.4}>
        <div className="rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm">
           <h2 className="text-xl font-semibold mb-2">Getting Started with VenBook</h2>
           <p className="text-muted-foreground mb-4">
             Use the sidebar to manage your venues, staff members, customers, and bookings. Visit Settings to configure your tax and pricing rules.
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
