import Image from "next/image";
import Link from "next/link";
import Container from "@/shared/container/Container";
import "@/shared/button/Button.css";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <Container>
        <div className="header__wrapper">
          <Link href="/" className="header__brand">
            <Image src="/logo.png" alt="Логотип" width={80} height={80} />
            <h1 className="header__title">Калькулятор</h1>
          </Link>
        </div>
      </Container>
    </header>
  );
}
