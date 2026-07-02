"use client";

import { useRef, useState, type FormEvent } from "react";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import Select from "@/shared/select/Select";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./ProductRefForm.css";

export default function ProductRefForm() {
  const {
    availableProductRefs,
    addProductRef,
    isSaving,
    productReferenceMode,
  } = useProducts();
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
    const amount = Number(
      formData.get(productReferenceMode === "grams" ? "amountGrams" : "quantity") ??
      (productReferenceMode === "grams" ? 100 : 1),
    );
    const productId = productIdRef.current || defaultProductId;

    if (!productId || amount <= 0) return;

    await addProductRef(productId, amount);
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
      <p className="product-ref-form__title">
        {productReferenceMode === "grams"
          ? "Добавить готовое изделие по граммовке"
          : "Добавить готовое изделие"}
      </p>

      <div className="product-ref-form__row">
        <Field label="Изделие" htmlFor="product-ref-select">
          <Select
            id="product-ref-select"
            defaultValue={defaultProductId}
            options={options}
            disabled={isSaving}
            onValueChange={(value) => {
              productIdRef.current = value;
            }}
          />
        </Field>

        <Field
          label={productReferenceMode === "grams" ? "Граммовка" : "Кол-во"}
          htmlFor={
            productReferenceMode === "grams"
              ? "product-ref-amount-grams"
              : "product-ref-quantity"
          }
        >
          <Input
            id={
              productReferenceMode === "grams"
                ? "product-ref-amount-grams"
                : "product-ref-quantity"
            }
            name={productReferenceMode === "grams" ? "amountGrams" : "quantity"}
            type="number"
            min={productReferenceMode === "grams" ? "0.01" : "1"}
            step={productReferenceMode === "grams" ? "any" : "1"}
            defaultValue={productReferenceMode === "grams" ? "100" : "1"}
            required
            disabled={isSaving}
          />
        </Field>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving
          ? "Добавление..."
          : productReferenceMode === "grams"
            ? "Добавить в десерт"
            : "Добавить изделие"}
      </Button>
    </form>
  );
}
