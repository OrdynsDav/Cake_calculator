import DessertsPage from "@/components/DessertsPage/DessertsPage";
import DatabaseSetup from "@/components/DatabaseSetup/DatabaseSetup";
import { getAllDesserts, getAllProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Десерты — Калькулятор",
};

export default async function DessertsRoute() {
  try {
    const [desserts, products] = await Promise.all([
      getAllDesserts(),
      getAllProducts(),
    ]);

    return (
      <DessertsPage
        initialDesserts={desserts}
        availableProducts={products}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось подключиться к базе данных";

    return <DatabaseSetup message={message} />;
  }
}
