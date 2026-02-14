"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  CalendarCheck2,
  CreditCard,
  GalleryVerticalEnd,
  LayoutDashboard,
  MapPin,
  Sparkles,
  Users,
  UserRound,
  Boxes,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "~/_components/ui/sidebar"
import { SignOutButton } from "~/_components/sign-out-button"

const platformNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Hotels", url: "/hotels", icon: Building2 },
  { title: "All Users", url: "/users", icon: Users },
]

const tenantNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Staff", url: "/admin/staff", icon: Users },
  { title: "Venues", url: "/admin/venues", icon: MapPin },
  { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck2 },
  { title: "Customers", url: "/admin/customers", icon: UserRound },
  { title: "Amenities", url: "/admin/amenities", icon: Sparkles },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Resources", url: "/admin/resources", icon: Boxes },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  context?: "platform" | "tenant"
}

export function AppSidebar({ context = "tenant", ...props }: AppSidebarProps) {
  const pathname = usePathname()
  
  const navItems = context === "platform" ? platformNav : tenantNav

  // Determine if we are in "Direct Path Mode" (accessing via /dashboard/...)
  // or "Subdomain Mode" (prefix is handled by middleware)
  const isDirectPathMode = pathname?.startsWith("/dashboard")
  
  // Build the relative prefix
  let basePrefix = ""
  if (isDirectPathMode) {
    if (context === "platform") {
      basePrefix = "/dashboard/platform"
    } else {
      // Extract the tenant slug from /dashboard/tenant/[slug]/admin/...
      const parts = pathname.split("/")
      const tenantSlug = parts[3] // dashboard[1], tenant[2], [slug][3]
      basePrefix = `/dashboard/tenant/${tenantSlug}/admin`
    }
  }

  const getUrl = (url: string) => {
    if (!isDirectPathMode) return url
    
    // In direct path mode, we need to map the "logical" URLs back to physical paths
    if (context === "platform") {
      if (url === "/") return basePrefix
      return `${basePrefix}${url}`
    } else {
      // url is e.g. /admin/staff. basePrefix is /dashboard/tenant/slug/admin
      // logical /admin maps to physical /dashboard/tenant/slug/admin
      if (url === "/admin") return basePrefix
      return url.replace("/admin", basePrefix)
    }
  }

  const isActive = (url: string) => {
    const fullUrl = getUrl(url)
    if (url === "/" || url === "/admin") {
      return pathname === fullUrl
    }
    return pathname === fullUrl || pathname?.startsWith(`${fullUrl}/`)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={isDirectPathMode ? "/" : "/"}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-lg">VenBook</span>
                  <span className="text-xs opacity-70">
                    {context === "platform" ? "Control Center" : "Hotel Manager"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive(item.url)}>
                  <Link href={getUrl(item.url)}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
