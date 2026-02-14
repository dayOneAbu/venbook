import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

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
    if (session.user.role === "HOTEL_ADMIN") {
      const hostname = (await headers()).get("host") ?? "";
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
      const isRootDomain = hostname === rootDomain;

      if (isRootDomain) {
        // Fetch subdomain to construct physical path for root domain access
        const hotel = await db.hotel.findFirst({
          where: { ownerId: session.user.id },
          select: { subdomain: true }
        });
        
        if (hotel?.subdomain) {
          redirect(`/dashboard/tenant/${hotel.subdomain}/admin`);
        }
      }
      
      // Default fallback for subdomain mode or if hotel not found
      redirect("/admin");
    } else {
      redirect("/");
    }
  }

  return <>{children}</>;
}
