import Calculator from "@/components/Calculator/Calculator";
import { getAllProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default function Home() {
  const products = getAllProducts();

  return <Calculator initialProducts={products} />;
}
