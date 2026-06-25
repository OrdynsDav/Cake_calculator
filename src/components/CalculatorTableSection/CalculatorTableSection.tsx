"use client";

import Container from "@/shared/container/Container";
import CompositionTable from "@/components/CompositionTable/CompositionTable";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./CalculatorTableSection.css";

export default function CalculatorTableSection() {
  const { activeProduct } = useProducts();

  if (!activeProduct) return null;

  return (
    <section className="calculator-table-section">
      <Container>
        <h2 className="calculator-table-section__title">
          Расчёт: {activeProduct.name}
        </h2>
        <CompositionTable />
      </Container>
    </section>
  );
}
