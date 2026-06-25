import Container from "@/shared/container/Container";
import Image from "next/image";
import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <Container>
                <div className="header__wrapper">
                    <Image src='/logo.jpeg' alt="Логотип" width={80} height={80} />
                    <h1 className="header__title">Калькулятор</h1>
                </div>
            </Container>
        </header>
    );
}