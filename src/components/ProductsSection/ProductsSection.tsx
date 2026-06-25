import Container from "@/shared/container/Container";
import ProductsBar from "@/components/ProductsBar/ProductsBar";
import "./ProductsSection.css";

export default function ProductsSection() {
  return (
    <section className="products-section">
      <Container>
        <h2 className="products-section__title">Изделия</h2>
        <ProductsBar />
      </Container>
    </section>
  );
}
