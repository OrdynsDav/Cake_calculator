import Calculator from "@/components/Calculator/Calculator";
import DatabaseSetup from "@/components/DatabaseSetup/DatabaseSetup";
import { getDatabaseErrorMessage } from "@/lib/db-error";
import { getAllIngredients } from "@/lib/db/ingredients";
import { getAllProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products;
  let ingredients;
  let errorMessage: string | null = null;

  try {
    [products, ingredients] = await Promise.all([
      getAllProducts(),
      getAllIngredients(),
    ]);
  } catch (error) {
    errorMessage = getDatabaseErrorMessage(error);
  }

  if (errorMessage) {
    return <DatabaseSetup message={errorMessage} />;
  }

  return (
    <Calculator
      initialProducts={products!}
      initialIngredients={ingredients!}
    />
  );
}
