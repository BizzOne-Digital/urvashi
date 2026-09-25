import { Suspense } from "react";
import AdminLoginPage from "./LoginForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-chrome-light">Loading…</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}
