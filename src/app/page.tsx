export const dynamic = "force-dynamic";

import { Suspense } from "react";
import DashboardContent from "./dashboard-content";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-2xl font-semibold text-orange-600">
            Loading dashboard...
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
