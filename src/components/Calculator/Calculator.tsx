import { ProductsProvider } from "@/components/ProductsProvider/ProductsProvider";
import ProductsSection from "@/components/ProductsSection/ProductsSection";
import CalculatorFormSection from "@/components/CalculatorFormSection/CalculatorFormSection";
import CalculatorTableSection from "@/components/CalculatorTableSection/CalculatorTableSection";
import type { CatalogIngredient } from "@/types/ingredient";
import type { Product } from "@/types/product";

type CalculatorProps = {
  initialProducts: Product[];
  initialIngredients: CatalogIngredient[];
};

export default function Calculator({
  initialProducts,
  initialIngredients,
}: CalculatorProps) {
  return (
    <ProductsProvider
      initialProducts={initialProducts}
      initialIngredients={initialIngredients}
      productType="product"
    >
      <ProductsSection title="Изделия" entityName="изделие" createLabel="Создать" />
      <CalculatorFormSection />
      <CalculatorTableSection />
    </ProductsProvider>
  );
}