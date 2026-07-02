import Container from "@/shared/container/Container";
import "@/components/ProductsSection/ProductsSection.css";

const SKELETON_ITEMS = 5;

export default function Loading() {
  return (
    <section className="products-section">
      <Container>
        <h2 className="products-section__title">Десерты</h2>

        <div className="products-section__skeleton" aria-hidden>
          {Array.from({ length: SKELETON_ITEMS }, (_, index) => (
            <div
              key={index}
              className="products-section__skeleton-item"
              style={{ width: `${160 + index * 18}px` }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
