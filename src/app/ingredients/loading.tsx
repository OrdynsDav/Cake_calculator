import Container from "@/shared/container/Container";
import "@/components/IngredientsSection/IngredientsSection.css";

const SKELETON_ITEMS = 6;

export default function Loading() {
  return (
    <section className="ingredients-section">
      <Container>
        <h2 className="ingredients-section__title">Ингредиенты</h2>
        <p className="ingredients-section__description">
          Загружаем справочник ингредиентов...
        </p>

        <div className="ingredients-section__skeleton" aria-hidden>
          {Array.from({ length: SKELETON_ITEMS }, (_, index) => (
            <div key={index} className="ingredients-section__skeleton-item">
              <div className="ingredients-section__skeleton-content">
                <div className="ingredients-section__skeleton-line ingredients-section__skeleton-line--title" />
                <div className="ingredients-section__skeleton-line ingredients-section__skeleton-line--meta" />
              </div>
              <div className="ingredients-section__skeleton-actions">
                <div className="ingredients-section__skeleton-action" />
                <div className="ingredients-section__skeleton-action" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
