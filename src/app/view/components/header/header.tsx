"use client";

import Link from "next/link";
import LogoComponent from "@/app/view/components/ui/logo/logo";

export default function Header() {
  return (
    <header className="relative flex w-full flex-col items-center py-4 bg-black">
      <div className="flex w-full items-center justify-between px-8 max-w-5xl">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors text-zinc-400">
            Dashboard
          </Link>
          <Link href="/invoices" className="text-sm font-medium hover:text-primary transition-colors text-zinc-400">
            Invoices
          </Link>
          <Link href="/market" className="text-sm font-medium hover:text-primary transition-colors text-zinc-400">
            Market
          </Link>
        </nav>

        <Link href="/">
          <LogoComponent isAnimated={false} w={55} />
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/invoices/new" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-all">
            New Invoice
          </Link>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(to right, #6366F1, #10B981)",
        }}
      />
    </header>
  );
}
