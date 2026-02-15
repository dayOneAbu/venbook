"use client";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/_components/ui/card";
import FadeContent from "~/_components/FadeContent";
import { DollarSign, TrendingUp, Clock, Receipt } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PaymentsPage() {
  const { data: summary, isLoading, error } = api.billing.getSummary.useQuery();

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments &amp; Billing</h2>
          <p className="text-muted-foreground">
            Track transactions, revenue summaries, and financial reports.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading financial data...
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error.message || "Unable to load billing data."}
          </div>
        ) : summary ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All-Time Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.allTimeRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Total across all bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.completedRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From completed events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.pendingRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From confirmed bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.allTimeVat)}</div>
                <p className="text-xs text-muted-foreground">
                  Service Charge: {formatCurrency(summary.allTimeServiceCharge)}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </FadeContent>

      <FadeContent delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Detailed invoice and payment recording features are coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
            <span className="text-muted-foreground italic">
              Payment recording, invoice generation, and refund processing — coming in the next release.
            </span>
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
