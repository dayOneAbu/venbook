import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function getFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedParams = await searchParams;
  const role = getFirst(resolvedParams?.role) ?? "customer";
  const redirectParam = getFirst(resolvedParams?.redirect);

  const base = role === "owner" ? "/auth/owner/sign-up" : "/auth/customer/sign-up";
  const target = redirectParam ? `${base}?redirect=${encodeURIComponent(redirectParam)}` : base;
  redirect(target);
}
