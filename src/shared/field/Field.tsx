import "./Field.css";

type FieldProps = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export default function Field({
  label,
  htmlFor,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
