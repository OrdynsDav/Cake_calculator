import Container from "@/shared/container/Container";
import IngredientsBar from "@/components/IngredientsBar/IngredientsBar";
import "./IngredientsSection.css";

export default function IngredientsSection() {
  return (
    <section className="ingredients-section">
      <Container>
        <h2 className="ingredients-section__title">Ингредиенты</h2>
        <p className="ingredients-section__description">
          Справочник с названием и стоимостью покупки. При добавлении в состав
          можно выбрать из справочника или указать свои значения.
        </p>
        <IngredientsBar />
      </Container>
    </section>
  );
}
