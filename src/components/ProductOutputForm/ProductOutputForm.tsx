"use client";

import type { FormEvent } from "react";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./ProductOutputForm.css";

export default function ProductOutputForm() {
  const { activeProduct, isSaving, updateActiveProductOutputGrams } = useProducts();

  if (!activeProduct) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const outputGrams = Number(
      new FormData(event.currentTarget).get("outputGrams"),
    );
    await updateActiveProductOutputGrams(outputGrams);
  }

  return (
    <form
      key={activeProduct.id}
      className="product-output-form"
      onSubmit={handleSubmit}
    >
      <Field label="Выход изделия, г" htmlFor="product-output-grams-current">
        <Input
          id="product-output-grams-current"
          name="outputGrams"
          type="number"
          min="0.01"
          step="any"
          defaultValue={String(activeProduct.outputGrams)}
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
