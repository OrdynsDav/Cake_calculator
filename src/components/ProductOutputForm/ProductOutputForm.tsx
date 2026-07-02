"use client";

import { useEffect, useState, type FormEvent } from "react";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./ProductOutputForm.css";

export default function ProductOutputForm() {
  const { activeProduct, isSaving, updateActiveProductOutputGrams } = useProducts();
  const [draftValue, setDraftValue] = useState("");

  useEffect(() => {
    setDraftValue("");
  }, [activeProduct?.id]);

  if (!activeProduct) return null;

  const currentValue =
    draftValue === "" ? String(activeProduct.outputGrams) : draftValue;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const outputGrams = Number(draftValue || activeProduct.outputGrams);
    await updateActiveProductOutputGrams(outputGrams);
    setDraftValue("");
  }

  return (
    <form className="product-output-form" onSubmit={handleSubmit}>
      <Field label="Выход изделия, г" htmlFor="product-output-grams-current">
        <Input
          id="product-output-grams-current"
          type="number"
          min="0.01"
          step="any"
          value={currentValue}
          onChange={(event) => setDraftValue(event.target.value)}
          disabled={isSaving}
          required
        />
      </Field>
      <Button type="submit" variant="outline" disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить выход"}
      </Button>
    </form>
  );
}
