"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/shared/container/Container";
import "@/shared/button/Button.css";
import "./Navigation.css";

function getLinkClassName(isActive: boolean): string {
    return [
        "button",
        isActive ? "button--default" : "button--outline",
        "nav__link",
    ].join(" ");
}

export default function Navigation() {
    const pathname = usePathname();
    const isIngredientsPage = pathname === "/ingredients";

    return (
        <Container>
            <nav className="nav" aria-label="Навигация">
                <Link
                    href="/"
                    className={getLinkClassName(!isIngredientsPage)}
                    aria-current={!isIngredientsPage ? "page" : undefined}
                >
                    Изделия
                </Link>
                <Link
                    href="/ingredients"
                    className={getLinkClassName(isIngredientsPage)}
                    aria-current={isIngredientsPage ? "page" : undefined}
                >
                    Ингредиенты
                </Link>
            </nav>
        </Container>
    );
}
