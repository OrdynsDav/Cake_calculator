import IngredientsPage from "@/components/IngredientsPage/IngredientsPage";
import DatabaseSetup from "@/components/DatabaseSetup/DatabaseSetup";
import { getAllIngredients } from "@/lib/db/ingredients";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ингредиенты — Калькулятор",
};

export default async function IngredientsRoute() {
  try {
    const ingredients = await getAllIngredients();

    return <IngredientsPage initialIngredients={ingredients} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось подключиться к базе данных";

    return <DatabaseSetup message={message} />;
  }
}
