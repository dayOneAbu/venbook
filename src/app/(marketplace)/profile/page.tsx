"use client";

import { authClient } from "~/server/better-auth/client";
import { Button } from "~/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/_components/ui/card";
import { Input } from "~/_components/ui/input";
import { Label } from "~/_components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  const handleUpdate = async () => {
    // Better Auth update profile logic
    toast.success("Profile updated successfully (Mock)");
  };

  if (isPending) return <div className="container py-20 flex justify-center italic">Loading profile...</div>;
  if (!session) return <div className="container py-20 text-center">Please sign in to view your profile.</div>;

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your personal information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
                id="email" 
                value={email} 
                disabled 
                className="bg-muted"
            />
          </div>
          <div className="pt-4">
            <Button onClick={handleUpdate}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
