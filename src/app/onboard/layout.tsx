import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If already onboarded, send them to the right home
  if (session?.user?.isOnboarded) {
    redirect(session.user.role === "HOTEL_ADMIN" ? "/admin" : "/");
  }

  return <>{children}</>;
}
