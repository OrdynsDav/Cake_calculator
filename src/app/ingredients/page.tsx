import IngredientsPage from "@/components/IngredientsPage/IngredientsPage";
import DatabaseSetup from "@/components/DatabaseSetup/DatabaseSetup";
import { getDatabaseErrorMessage } from "@/lib/db-error";
import { getAllIngredients } from "@/lib/db/ingredients";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ингредиенты — Калькулятор",
};

export default async function IngredientsRoute() {
  let ingredients;
  let errorMessage: string | null = null;

  try {
    ingredients = await getAllIngredients();
  } catch (error) {
    errorMessage = getDatabaseErrorMessage(error);
  }

  if (errorMessage) {
    return <DatabaseSetup message={errorMessage} />;
  }

  return <IngredientsPage initialIngredients={ingredients!} />;
}
