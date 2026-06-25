"use client";

import { useRef, useState, type FormEvent } from "react";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import Select from "@/shared/select/Select";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./ProductRefForm.css";

export default function ProductRefForm() {
  const { availableProductRefs, addProductRef } = useProducts();
  const productIdRef = useRef("");
  const [formResetKey, setFormResetKey] = useState(0);

  if (availableProductRefs.length === 0) {
    return null;
  }

  const options = availableProductRefs.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  const defaultProductId = availableProductRefs[0]?.id ?? "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const quantity = Number(formData.get("quantity") ?? 1);
    const productId = productIdRef.current || defaultProductId;

    if (!productId || quantity <= 0) return;

    await addProductRef(productId, quantity);
    form.reset();
    productIdRef.current = defaultProductId;
    setFormResetKey((key) => key + 1);
  }

  return (
    <form
      key={formResetKey}
      className="product-ref-form"
      onSubmit={handleSubmit}
    >
      <p className="product-ref-form__title">Добавить готовое изделие</p>

      <div className="product-ref-form__row">
        <Field label="Изделие" htmlFor="product-ref-select">
          <Select
            id="product-ref-select"
            defaultValue={defaultProductId}
            options={options}
            onValueChange={(value) => {
              productIdRef.current = value;
            }}
          />
        </Field>

        <Field label="Кол-во" htmlFor="product-ref-quantity">
          <Input
            id="product-ref-quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            defaultValue="1"
            required
          />
        </Field>
      </div>

      <Button type="submit">Добавить изделие</Button>
    </form>
  );
}
