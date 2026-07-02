"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import Select from "@/shared/select/Select";
import type { CatalogIngredient, CatalogIngredientFormData } from "@/types/ingredient";
import type { Unit } from "@/types/product";
import "./CatalogIngredientForm.css";

const UNIT_OPTIONS = (["г", "кг", "мл", "л", "шт"] as Unit[]).map((unit) => ({
  value: unit,
  label: unit,
}));

type CatalogIngredientFormProps = {
  editingIngredient?: CatalogIngredient | null;
  onSubmit: (data: CatalogIngredientFormData) => Promise<void>;
  onCancel?: () => void;
};

export default function CatalogIngredientForm({
  editingIngredient,
  onSubmit,
  onCancel,
}: CatalogIngredientFormProps) {
  const { isSaving } = useProducts();
  const formRef = useRef<HTMLFormElement>(null);
  const packageUnitRef = useRef<Unit>(editingIngredient?.packageUnit ?? "кг");
  const [formResetKey, setFormResetKey] = useState(0);
  const isEditing = Boolean(editingIngredient);

  useEffect(() => {
    packageUnitRef.current = editingIngredient?.packageUnit ?? "кг";
  }, [editingIngredient?.packageUnit, editingIngredient?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    await onSubmit({
      name: String(formData.get("name") ?? ""),
      packagePrice: String(formData.get("packagePrice") ?? ""),
      packageAmount: String(formData.get("packageAmount") ?? ""),
      packageUnit: packageUnitRef.current,
    });

    form.reset();
    packageUnitRef.current = "кг";
    setFormResetKey((key) => key + 1);
  }

  function handleCancel() {
    onCancel?.();
    formRef.current?.reset();
    packageUnitRef.current = "кг";
    setFormResetKey((key) => key + 1);
  }

  const formKey = editingIngredient?.id ?? `new-${formResetKey}`;

  return (
    <form
      key={formKey}
      ref={formRef}
      className="catalog-ingredient-form"
      onSubmit={handleSubmit}
    >
      {isEditing && (
        <p className="catalog-ingredient-form__editing">
          Редактирование ингредиента
        </p>
      )}

      <Field label="Название" htmlFor="catalog-ingredient-name">
        <Input
          id="catalog-ingredient-name"
          name="name"
          placeholder="Мука, сахар, яйца..."
          defaultValue={editingIngredient?.name ?? ""}
          required
          autoComplete="off"
          disabled={isSaving}
        />
      </Field>

      <fieldset className="catalog-ingredient-form__price-group">
        <legend className="catalog-ingredient-form__price-legend">
          Стоимость покупки
        </legend>

        <div className="catalog-ingredient-form__price-row">
          <Field label="Цена, ₽" htmlFor="catalog-ingredient-package-price">
            <Input
              id="catalog-ingredient-package-price"
              name="packagePrice"
              type="number"
              min="0"
              step="any"
              placeholder="400"
              defaultValue={
                editingIngredient
                  ? String(editingIngredient.packagePrice)
                  : undefined
              }
              required
              disabled={isSaving}
            />
          </Field>

          <span className="catalog-ingredient-form__price-separator">за</span>

          <Field label="Количество" htmlFor="catalog-ingredient-package-amount">
            <Input
              id="catalog-ingredient-package-amount"
              name="packageAmount"
              type="number"
              min="0"
              step="any"
              placeholder="2"
              defaultValue={
                editingIngredient
                  ? String(editingIngredient.packageAmount)
                  : undefined
              }
              required
              disabled={isSaving}
            />
          </Field>

          <Field label="Ед. изм." htmlFor="catalog-ingredient-package-unit">
            <Select
              id="catalog-ingredient-package-unit"
              defaultValue={editingIngredient?.packageUnit ?? "кг"}
              options={UNIT_OPTIONS}
              disabled={isSaving}
              onValueChange={(unit) => {
                packageUnitRef.current = unit as Unit;
              }}
            />
          </Field>
        </div>
      </fieldset>

      <div className="catalog-ingredient-form__actions">
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? isEditing
              ? "Сохранение..."
              : "Добавление..."
            : isEditing
              ? "Сохранить"
              : "Добавить"}
        </Button>
        {isEditing && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
