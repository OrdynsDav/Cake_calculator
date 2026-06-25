"use client";

import Container from "@/shared/container/Container";
import IngredientForm from "@/components/IngredientForm/IngredientForm";
import ProductRefForm from "@/components/ProductRefForm/ProductRefForm";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./CalculatorFormSection.css";

export default function CalculatorFormSection() {
  const { activeProduct } = useProducts();

  if (!activeProduct) return null;

  return (
    <section className="calculator-form-section">
      <Container>
        <h2 className="calculator-form-section__title">
          Состав: {activeProduct.name}
        </h2>
        <IngredientForm />
        <ProductRefForm />
      </Container>
    </section>
  );
}
