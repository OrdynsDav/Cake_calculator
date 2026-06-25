import Calculator from "@/components/Calculator/Calculator";
import DatabaseSetup from "@/components/DatabaseSetup/DatabaseSetup";
import { getAllProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const products = await getAllProducts();

    return <Calculator initialProducts={products} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось подключиться к базе данных";

    return <DatabaseSetup message={message} />;
  }
}
