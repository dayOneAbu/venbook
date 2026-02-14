import { Suspense } from "react";
import { AdminSignInPage } from "~/app/auth/_components/admin-sign-in-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSignInPage />
    </Suspense>
  );
}
