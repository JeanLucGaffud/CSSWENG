import AdminPassword from "@/components/password";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPassword />
    </Suspense>
  );
}