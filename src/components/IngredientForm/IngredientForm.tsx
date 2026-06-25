"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import Select from "@/shared/select/Select";
import type { Unit } from "@/types/product";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./IngredientForm.css";

const UNIT_OPTIONS = (["г", "кг", "мл", "л", "шт"] as Unit[]).map((unit) => ({
  value: unit,
  label: unit,
}));

export default function IngredientForm() {
  const {
    editingItemId,
    addIngredient,
    updateIngredient,
    cancelEditing,
    getEditingIngredient,
  } = useProducts();

  const formRef = useRef<HTMLFormElement>(null);
  const unitRef = useRef<Unit>("г");
  const [formResetKey, setFormResetKey] = useState(0);

  const editingIngredient = getEditingIngredient();
  const isEditing = Boolean(editingIngredient);

  useEffect(() => {
    unitRef.current = editingIngredient?.unit ?? "г";
  }, [editingIngredient?.unit, editingItemId]);

  useEffect(() => {
    if (!isEditing) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isEditing, editingItemId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const data = {
      name: String(formData.get("name") ?? ""),
      amount: String(formData.get("amount") ?? ""),
      unit: unitRef.current,
      pricePerUnit: String(formData.get("pricePerUnit") ?? ""),
    };

    if (editingItemId && editingIngredient) {
      await updateIngredient(editingItemId, data);
    } else {
      await addIngredient(data);
    }

    form.reset();
    unitRef.current = "г";
    setFormResetKey((key) => key + 1);
  }

  function handleCancel() {
    cancelEditing();
    formRef.current?.reset();
    unitRef.current = "г";
    setFormResetKey((key) => key + 1);
  }

  const formKey = editingItemId ?? `new-${formResetKey}`;

  return (
    <form
      key={formKey}
      ref={formRef}
      className="ingredient-form"
      onSubmit={handleSubmit}
    >
      {isEditing && (
        <p className="ingredient-form__editing">Редактирование ингредиента</p>
      )}

      <Field label="Ингредиент" htmlFor="ingredient-name">
        <Input
          id="ingredient-name"
          name="name"
          placeholder="Мука, сахар, яйца..."
          defaultValue={editingIngredient?.name ?? ""}
          required
          autoComplete="off"
        />
      </Field>

      <div className="ingredient-form__row">
        <Field label="Количество" htmlFor="ingredient-amount">
          <Input
            id="ingredient-amount"
            name="amount"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            defaultValue={
              editingIngredient ? String(editingIngredient.amount) : undefined
            }
            required
          />
        </Field>

        <Field label="Ед. изм." htmlFor="ingredient-unit">
          <Select
            id="ingredient-unit"
            defaultValue={editingIngredient?.unit ?? "г"}
            options={UNIT_OPTIONS}
            onValueChange={(unit) => {
              unitRef.current = unit as Unit;
            }}
          />
        </Field>
      </div>

      <Field label="Цена за ед." htmlFor="ingredient-price">
        <Input
          id="ingredient-price"
          name="pricePerUnit"
          type="number"
          min="0"
          step="any"
          placeholder="0"
          defaultValue={
            editingIngredient
              ? String(editingIngredient.pricePerUnit)
              : undefined
          }
          required
        />
      </Field>

      <div className="ingredient-form__actions">
        <Button type="submit">{isEditing ? "Сохранить" : "Добавить"}</Button>
        {isEditing && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
