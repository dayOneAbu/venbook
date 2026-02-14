"use client";

import FadeContent from "~/_components/FadeContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/_components/ui/card";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
          <p className="text-muted-foreground">
            Maintain your database of corporate and individual clients.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              CRM features are being integrated. Guest history and profiles will be available shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-50 flex items-center justify-center border-2 border-dashed rounded-lg m-6">
            <span className="text-muted-foreground italic">Customer CRM interface under development.</span>
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
