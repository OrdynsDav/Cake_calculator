import { ProductsProvider } from "@/components/ProductsProvider/ProductsProvider";
import ProductsSection from "@/components/ProductsSection/ProductsSection";
import CalculatorFormSection from "@/components/CalculatorFormSection/CalculatorFormSection";
import CalculatorTableSection from "@/components/CalculatorTableSection/CalculatorTableSection";
import type { Product } from "@/types/product";

type CalculatorProps = {
  initialProducts: Product[];
};

export default function Calculator({ initialProducts }: CalculatorProps) {
  return (
    <ProductsProvider initialProducts={initialProducts}>
      <ProductsSection />
      <CalculatorFormSection />
      <CalculatorTableSection />
    </ProductsProvider>
  );
}