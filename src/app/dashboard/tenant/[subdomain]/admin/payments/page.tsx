"use client";

import FadeContent from "~/_components/FadeContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/_components/ui/card";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments & Billing</h2>
          <p className="text-muted-foreground">
            Track transactions, invoices, and financial reports.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Financial management and ERCA compliance features are in the works.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-50 flex items-center justify-center border-2 border-dashed rounded-lg m-6">
            <span className="text-muted-foreground italic">Billing and payment interface under development.</span>
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
