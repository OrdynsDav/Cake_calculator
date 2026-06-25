import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonVariant = "default" | "outline" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

export default function Button({
    variant = "default",
    className = "",
    type = "button",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={["button", `button--${variant}`, className]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            {children}
        </button>
    );
}
