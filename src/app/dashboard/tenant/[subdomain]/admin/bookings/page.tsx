"use client";

import FadeContent from "~/_components/FadeContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/_components/ui/card";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookings Management</h2>
          <p className="text-muted-foreground">
            Manage your hotel&apos;s reservations, event schedules, and availability.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              We&apos;re currently building the booking engine. Soon you&apos;ll be able to manage all your events here.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-50 flex items-center justify-center border-2 border-dashed rounded-lg m-6">
            <span className="text-muted-foreground italic">Booking management interface under development.</span>
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
