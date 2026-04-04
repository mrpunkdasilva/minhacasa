import { getInvoices } from "@/app/infra/actions/invoice.actions";
import MarketViewClient from "./market.view.client";

export default async function MarketView() {
  const invoices = await getInvoices();

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl min-h-screen bg-black">
      <MarketViewClient invoices={invoices} />
    </div>
  );
}
