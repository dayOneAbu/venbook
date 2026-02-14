import { Suspense } from "react";
import { CustomerSignInPage } from "~/app/auth/_components/customer-sign-in-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerSignInPage />
    </Suspense>
  );
}

