"use client";

import { useEffect, useState } from "react";
import ContextualLoading from "@/app/view/components/contextual-loading/contextual-loading";
import DashboardView from "@/app/view/pages/dashboard/dashboard.view";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return <ContextualLoading />;
  }

  return (
    <main className="bg-black min-h-screen">
      <DashboardView />
    </main>
  );
}
