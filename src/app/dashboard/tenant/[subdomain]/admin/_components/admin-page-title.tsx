"use client"

import { usePathname } from "next/navigation"

const titleMap: Array<{ prefix: string; title: string }> = [
  { prefix: "/admin", title: "Dashboard" },
  { prefix: "/admin/hotels", title: "Hotels" },
  { prefix: "/admin/users", title: "Users" },
  { prefix: "/admin/customers", title: "Customers" },
  { prefix: "/admin/venues", title: "Venues" },
  { prefix: "/admin/amenities", title: "Amenities" },
  { prefix: "/admin/bookings", title: "Bookings" },
  { prefix: "/admin/payments", title: "Payments" },
  { prefix: "/admin/resources", title: "Resources" },
  { prefix: "/admin/staff", title: "Staff" },
  { prefix: "/admin/settings", title: "Settings" },
]

const formatSegment = (segment: string) =>
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

export function AdminPageTitle() {
  const pathname = usePathname()

  // Extract the "logical" path by removing the physical dashboard prefix if present
  const logicalPath = (() => {
    if (!pathname) return ""
    if (pathname.startsWith("/dashboard/platform")) {
      return pathname.replace("/dashboard/platform", "") || "/"
    }
    if (pathname.includes("/admin")) {
      // For /dashboard/tenant/slug/admin/staff -> /admin/staff
      // For hilton.localhost/admin/staff -> /admin/staff
      const index = pathname.indexOf("/admin")
      return pathname.substring(index)
    }
    return pathname
  })()

  const title = titleMap.find((item) => {
    if (item.prefix === "/admin") {
      return logicalPath === "/admin" || logicalPath === "/"
    }
    return logicalPath === item.prefix || logicalPath?.startsWith(`${item.prefix}/`)
  })?.title

  const fallback = (() => {
    if (!pathname) return "Admin"
    const segments = pathname.split("/").filter(Boolean)
    const last = segments[segments.length - 1] ?? "Admin"
    return formatSegment(last)
  })()

  return (
    <h1 className="text-sm font-medium text-center">
      {title ?? fallback}
    </h1>
  )
}
