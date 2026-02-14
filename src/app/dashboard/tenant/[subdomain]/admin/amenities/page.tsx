"use client";

import FadeContent from "~/_components/FadeContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/_components/ui/card";

export default function AmenitiesPage() {
  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Amenities & Services</h2>
          <p className="text-muted-foreground">
            Manage the list of available amenities for your venues.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Amenity catalog management is coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-50 flex items-center justify-center border-2 border-dashed rounded-lg m-6">
            <span className="text-muted-foreground italic">Amenities management interface under development.</span>
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
