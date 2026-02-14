"use client";

import FadeContent from "~/_components/FadeContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/_components/ui/card";

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resource Management</h2>
          <p className="text-muted-foreground">
            Inventory management for AV equipment, furniture, and other event assets.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Asset tracking and inventory management modules will be available in the next release.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-50 flex items-center justify-center border-2 border-dashed rounded-lg m-6">
            <span className="text-muted-foreground italic">Resource inventory interface under development.</span>
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
