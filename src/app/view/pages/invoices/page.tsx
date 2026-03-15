import Header from "@/app/view/components/header/header";
import InvoicesListView from "@/app/view/pages/invoices-list/invoices-list.view";

export default function InvoicesPage() {
  return (
    <main className="bg-black min-h-screen">
      <InvoicesListView />
    </main>
  );
}
