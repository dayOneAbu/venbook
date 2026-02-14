import { Suspense } from "react";
import { CustomerSignUpPage } from "~/app/auth/_components/customer-sign-up-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerSignUpPage />
    </Suspense>
  );
}

