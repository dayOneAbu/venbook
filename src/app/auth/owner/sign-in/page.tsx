import { Suspense } from "react";
import { OwnerSignInPage } from "~/app/auth/_components/owner-sign-in-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OwnerSignInPage />
    </Suspense>
  );
}

