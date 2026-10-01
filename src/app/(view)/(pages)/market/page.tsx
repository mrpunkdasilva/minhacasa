import { redirect } from "next/navigation";

/**
 * The market used to be a single tabbed view. It now has dedicated pages, so
 * the root redirects to the expense analysis, which is the landing page.
 */
export default function MarketPage() {
  redirect("/market/analysis");
}
