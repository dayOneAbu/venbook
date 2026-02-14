import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function getFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function Page({ searchParams }: { searchParams?: SearchParams }) {
  const role = getFirst(searchParams?.role) ?? "customer";
  const redirectParam = getFirst(searchParams?.redirect);

  const base =
    role === "owner"
      ? "/auth/owner/sign-in"
      : role === "admin"
        ? "/auth/admin/sign-in"
        : "/auth/customer/sign-in";

  const target = redirectParam ? `${base}?redirect=${encodeURIComponent(redirectParam)}` : base;
  redirect(target);
}
