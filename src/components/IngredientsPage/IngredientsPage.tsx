import { ProductsProvider } from "@/components/ProductsProvider/ProductsProvider";
import IngredientsSection from "@/components/IngredientsSection/IngredientsSection";
import type { CatalogIngredient } from "@/types/ingredient";

type IngredientsPageProps = {
  initialIngredients: CatalogIngredient[];
};

export default function IngredientsPage({
  initialIngredients,
}: IngredientsPageProps) {
  return (
    <ProductsProvider initialProducts={[]} initialIngredients={initialIngredients}>
      <IngredientsSection />
    </ProductsProvider>
  );
}
