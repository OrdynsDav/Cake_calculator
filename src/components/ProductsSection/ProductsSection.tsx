"use client";

import { useId, useState } from "react";
import Container from "@/shared/container/Container";
import Button from "@/shared/button/Button";
import ProductsBar from "@/components/ProductsBar/ProductsBar";
import "./ProductsSection.css";

type ProductsSectionProps = {
  title?: string;
  entityName?: string;
  createLabel?: string;
};

export default function ProductsSection({
  title = "Изделия",
  entityName = "изделие",
  createLabel = "Создать",
}: ProductsSectionProps) {
  const [isListVisible, setIsListVisible] = useState(true);
  const listRegionId = useId();

  return (
    <section className="products-section">
      <Container>
        <div className="products-section__header">
          <h2 className="products-section__title">{title}</h2>
          <Button
            type="button"
            variant="outline"
            className="products-section__toggle"
            onClick={() => setIsListVisible((current) => !current)}
            aria-expanded={isListVisible}
            aria-controls={listRegionId}
          >
            {isListVisible ? "Скрыть" : "Показать"}
          </Button>
        </div>
        <ProductsBar
          entityName={entityName}
          createLabel={createLabel}
          showList={isListVisible}
          listRegionId={listRegionId}
        />
      </Container>
    </section>
  );
}
