"use client";

import { useEffect, useState } from "react";
import ContextualLoading from "@/app/view/components/contextual-loading/contextual-loading";
import LogoComponent from "@/app/view/components/ui/logo/logo";
import CreateInvoicePage from "@/app/view/pages/create-invoice/create-invoice.view";

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
      <header className="flex w-full justify-center">
        <LogoComponent isAnimated={false} w={55} />
      </header>

      <CreateInvoicePage />
    </main>
  );
}
