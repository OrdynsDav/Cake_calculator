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
    const isProductsPage = pathname === "/";
    const isDessertsPage = pathname === "/desserts";
    const isIngredientsPage = pathname === "/ingredients";

    return (
        <Container>
            <nav className="nav" aria-label="Навигация">
                <Link
                    href="/"
                    className={getLinkClassName(isProductsPage)}
                    aria-current={isProductsPage ? "page" : undefined}
                >
                    Изделия
                </Link>
                <Link
                    href="/desserts"
                    className={getLinkClassName(isDessertsPage)}
                    aria-current={isDessertsPage ? "page" : undefined}
                >
                    Десерты
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
