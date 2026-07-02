import DessertsPage from "@/components/DessertsPage/DessertsPage";
import DatabaseSetup from "@/components/DatabaseSetup/DatabaseSetup";
import { getDatabaseErrorMessage } from "@/lib/db-error";
import { getAllDesserts, getAllProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Десерты — Калькулятор",
};

export default async function DessertsRoute() {
  let desserts;
  let products;
  let errorMessage: string | null = null;

  try {
    [desserts, products] = await Promise.all([
      getAllDesserts(),
      getAllProducts(),
    ]);
  } catch (error) {
    errorMessage = getDatabaseErrorMessage(error);
  }

  if (errorMessage) {
    return <DatabaseSetup message={errorMessage} />;
  }

  return (
    <DessertsPage
      initialDesserts={desserts!}
      availableProducts={products!}
    />
  );
}
