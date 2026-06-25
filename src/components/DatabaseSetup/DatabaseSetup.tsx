import Container from "@/shared/container/Container";
import "./DatabaseSetup.css";

type DatabaseSetupProps = {
  message: string;
};

export default function DatabaseSetup({ message }: DatabaseSetupProps) {
  return (
    <section className="database-setup">
      <Container>
        <h2 className="database-setup__title">Нужна база данных</h2>
        <p className="database-setup__message">{message}</p>
        <ol className="database-setup__steps">
          <li>
            Создайте базу на{" "}
            <a href="https://turso.tech" target="_blank" rel="noreferrer">
              turso.tech
            </a>
          </li>
          <li>
            Добавьте в Vercel переменные{" "}
            <code>TURSO_DATABASE_URL</code> и <code>TURSO_AUTH_TOKEN</code>
          </li>
          <li>Выполните <code>yarn db:migrate</code> и передеплойте проект</li>
        </ol>
      </Container>
    </section>
  );
}
