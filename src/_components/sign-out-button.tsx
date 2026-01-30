"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "~/_components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <Button 
        variant="ghost" 
        className="w-full justify-start text-sidebar-foreground" 
        onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  );
}
