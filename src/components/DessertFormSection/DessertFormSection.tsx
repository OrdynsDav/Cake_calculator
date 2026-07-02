"use client";

import Container from "@/shared/container/Container";
import ProductRefForm from "@/components/ProductRefForm/ProductRefForm";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./DessertFormSection.css";

export default function DessertFormSection() {
  const { activeProduct } = useProducts();

  if (!activeProduct) return null;

  return (
    <section className="dessert-form-section">
      <Container>
        <h2 className="dessert-form-section__title">Состав десерта: {activeProduct.name}</h2>
        <p className="dessert-form-section__description">
          В десерт можно добавлять только готовые изделия.
        </p>
        <ProductRefForm />
      </Container>
    </section>
  );
}
