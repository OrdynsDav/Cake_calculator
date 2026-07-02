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
            Для локальной разработки создайте файл <code>.env</code> с{" "}
            <code>DATABASE_URL=file:./data/sqlite.db</code>
          </li>
          <li>
            Чтобы вручную выбрать базу, добавьте{" "}
            <code>DATABASE_MODE=local</code> или <code>DATABASE_MODE=remote</code>.
            Этот выбор имеет приоритет над автоопределением по окружению.
          </li>
          <li>
            Для продакшена или удаленной базы создайте базу на{" "}
            <a href="https://turso.tech" target="_blank" rel="noreferrer">
              turso.tech
            </a>{" "}
            и добавьте переменные <code>TURSO_DATABASE_URL</code> и{" "}
            <code>TURSO_AUTH_TOKEN</code>
          </li>
          <li>Выполните <code>yarn db:migrate</code> и перезапустите сервер</li>
        </ol>
      </Container>
    </section>
  );
}
