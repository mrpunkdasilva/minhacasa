import MarketPageHeader from "../components/market-page-header";
import Calculator from "../components/calculator/calculator";

export default function MarketCalculatorPage() {
  return (
    <div className="container mx-auto py-6 sm:py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-6 sm:gap-8">
        <MarketPageHeader
          title="Calculadora"
          description="Calcule na hora das compras: multiplicações, descontos e total da conta."
        />

        <Calculator />
      </div>
    </div>
  );
}
