import { ProductsProvider } from "@/components/ProductsProvider/ProductsProvider";
import ProductsSection from "@/components/ProductsSection/ProductsSection";
import DessertFormSection from "@/components/DessertFormSection/DessertFormSection";
import CalculatorTableSection from "@/components/CalculatorTableSection/CalculatorTableSection";
import type { Product } from "@/types/product";

type DessertsPageProps = {
  initialDesserts: Product[];
  availableProducts: Product[];
};

export default function DessertsPage({
  initialDesserts,
  availableProducts,
}: DessertsPageProps) {
  return (
    <ProductsProvider
      initialProducts={initialDesserts}
      initialIngredients={[]}
      productType="dessert"
      availableProductRefs={availableProducts}
    >
      <ProductsSection
        title="Десерты"
        entityName="десерт"
        createLabel="Создать десерт"
      />
      <DessertFormSection />
      <CalculatorTableSection />
    </ProductsProvider>
  );
}
