import Calculator from "@/components/Calculator/Calculator";
import { getAllProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getAllProducts();

  return <Calculator initialProducts={products} />;
}
