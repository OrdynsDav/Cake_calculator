"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import Select from "@/shared/select/Select";
import {
  CUSTOM_CATALOG_OPTION,
  type CatalogIngredient,
} from "@/types/ingredient";
import type { Unit } from "@/types/product";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./IngredientForm.css";

const UNIT_OPTIONS = (["г", "кг", "мл", "л", "шт"] as Unit[]).map((unit) => ({
  value: unit,
  label: unit,
}));

type FormDefaults = {
  name: string;
  amount: string;
  unit: Unit;
  packagePrice: string;
  packageAmount: string;
  packageUnit: Unit;
};

function getPackageDefaults(ingredient: {
  packagePrice?: number;
  packageAmount?: number;
  packageUnit?: Unit;
  pricePerUnit?: number;
  unit: Unit;
}) {
  if (
    ingredient.packagePrice != null &&
    ingredient.packageAmount != null &&
    ingredient.packageUnit != null
  ) {
    return {
      packagePrice: String(ingredient.packagePrice),
      packageAmount: String(ingredient.packageAmount),
      packageUnit: ingredient.packageUnit,
    };
  }

  if (ingredient.pricePerUnit != null) {
    return {
      packagePrice: String(ingredient.pricePerUnit),
      packageAmount: "1",
      packageUnit: ingredient.unit,
    };
  }

  return {
    packagePrice: "",
    packageAmount: "",
    packageUnit: ingredient.unit,
  };
}

function getDefaultsFromCatalog(ingredient: CatalogIngredient): FormDefaults {
  return {
    name: ingredient.name,
    amount: "",
    unit: "г",
    packagePrice: String(ingredient.packagePrice),
    packageAmount: String(ingredient.packageAmount),
    packageUnit: ingredient.packageUnit,
  };
}

function getDefaultsFromCompositionItem(ingredient: {
  name: string;
  amount: number;
  unit: Unit;
  packagePrice?: number;
  packageAmount?: number;
  packageUnit?: Unit;
  pricePerUnit?: number;
}): FormDefaults {
  const packageDefaults = getPackageDefaults(ingredient);

  return {
    name: ingredient.name,
    amount: String(ingredient.amount),
    unit: ingredient.unit,
    packagePrice: packageDefaults.packagePrice,
    packageAmount: packageDefaults.packageAmount,
    packageUnit: packageDefaults.packageUnit,
  };
}

const EMPTY_DEFAULTS: FormDefaults = {
  name: "",
  amount: "",
  unit: "г",
  packagePrice: "",
  packageAmount: "",
  packageUnit: "кг",
};

export default function IngredientForm() {
  const {
    catalogIngredients,
    editingItemId,
    isSaving,
    addIngredient,
    updateIngredient,
    cancelEditing,
    getEditingIngredient,
  } = useProducts();

  const formRef = useRef<HTMLFormElement>(null);
  const unitRef = useRef<Unit>("г");
  const packageUnitRef = useRef<Unit>("кг");
  const catalogIdRef = useRef<string>(CUSTOM_CATALOG_OPTION);
  const [formResetKey, setFormResetKey] = useState(0);
  const [selectedCatalogId, setSelectedCatalogId] = useState(
    CUSTOM_CATALOG_OPTION,
  );
  const [formDefaults, setFormDefaults] = useState<FormDefaults>(EMPTY_DEFAULTS);

  const editingIngredient = getEditingIngredient();
  const isEditing = Boolean(editingIngredient);

  const catalogOptions = [
    { value: CUSTOM_CATALOG_OPTION, label: "Свой ингредиент" },
    ...catalogIngredients.map((ingredient) => ({
      value: ingredient.id,
      label: ingredient.name,
    })),
  ];

  useEffect(() => {
    if (editingIngredient) {
      const catalogId =
        editingIngredient.catalogIngredientId ?? CUSTOM_CATALOG_OPTION;
      const defaults = getDefaultsFromCompositionItem(editingIngredient);

      catalogIdRef.current = catalogId;
      unitRef.current = defaults.unit;
      packageUnitRef.current = defaults.packageUnit;
      setSelectedCatalogId(catalogId);
      setFormDefaults(defaults);
      setFormResetKey((key) => key + 1);
      return;
    }

    catalogIdRef.current = CUSTOM_CATALOG_OPTION;
    unitRef.current = "г";
    packageUnitRef.current = "кг";
    setSelectedCatalogId(CUSTOM_CATALOG_OPTION);
    setFormDefaults(EMPTY_DEFAULTS);
  }, [editingIngredient, editingItemId]);

  useEffect(() => {
    if (!isEditing) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isEditing, editingItemId]);

  function handleCatalogChange(catalogId: string) {
    catalogIdRef.current = catalogId;
    setSelectedCatalogId(catalogId);

    if (catalogId === CUSTOM_CATALOG_OPTION) {
      setFormDefaults((current) => ({
        ...EMPTY_DEFAULTS,
        amount: current.amount,
        unit: current.unit,
      }));
      setFormResetKey((key) => key + 1);
      return;
    }

    const catalogIngredient = catalogIngredients.find(
      (ingredient) => ingredient.id === catalogId,
    );

    if (!catalogIngredient) return;

    setFormDefaults((current) => ({
      ...getDefaultsFromCatalog(catalogIngredient),
      amount: current.amount,
      unit: current.unit,
    }));
    packageUnitRef.current = catalogIngredient.packageUnit;
    setFormResetKey((key) => key + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const catalogIngredientId =
      catalogIdRef.current === CUSTOM_CATALOG_OPTION
        ? undefined
        : catalogIdRef.current;

    const data = {
      name: String(formData.get("name") ?? ""),
      amount: String(formData.get("amount") ?? ""),
      unit: unitRef.current,
      packagePrice: String(formData.get("packagePrice") ?? ""),
      packageAmount: String(formData.get("packageAmount") ?? ""),
      packageUnit: packageUnitRef.current,
      catalogIngredientId,
    };

    if (editingItemId && editingIngredient) {
      await updateIngredient(editingItemId, data);
    } else {
      await addIngredient(data);
    }

    form.reset();
    catalogIdRef.current = CUSTOM_CATALOG_OPTION;
    unitRef.current = "г";
    packageUnitRef.current = "кг";
    setSelectedCatalogId(CUSTOM_CATALOG_OPTION);
    setFormDefaults(EMPTY_DEFAULTS);
    setFormResetKey((key) => key + 1);
  }

  function handleCancel() {
    cancelEditing();
    catalogIdRef.current = CUSTOM_CATALOG_OPTION;
    unitRef.current = "г";
    packageUnitRef.current = "кг";
    setSelectedCatalogId(CUSTOM_CATALOG_OPTION);
    setFormDefaults(EMPTY_DEFAULTS);
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

      {catalogIngredients.length > 0 && (
        <Field label="Из справочника" htmlFor="ingredient-catalog">
          <Select
            id="ingredient-catalog"
            value={selectedCatalogId}
            options={catalogOptions}
            onValueChange={handleCatalogChange}
            disabled={isSaving}
          />
        </Field>
      )}

      <Field label="Ингредиент" htmlFor="ingredient-name">
        <Input
          id="ingredient-name"
          name="name"
          placeholder="Мука, сахар, яйца..."
          defaultValue={formDefaults.name}
          required
          autoComplete="off"
          disabled={isSaving}
        />
      </Field>

      <div className="ingredient-form__row">
        <Field label="Количество в рецепте" htmlFor="ingredient-amount">
          <Input
            id="ingredient-amount"
            name="amount"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            defaultValue={formDefaults.amount || undefined}
            required
            disabled={isSaving}
          />
        </Field>

        <Field label="Ед. изм." htmlFor="ingredient-unit">
          <Select
            id="ingredient-unit"
            defaultValue={formDefaults.unit}
            options={UNIT_OPTIONS}
            disabled={isSaving}
            onValueChange={(unit) => {
              unitRef.current = unit as Unit;
            }}
          />
        </Field>
      </div>

      <fieldset className="ingredient-form__price-group">
        <legend className="ingredient-form__price-legend">Стоимость покупки</legend>
        <p className="ingredient-form__price-hint">
          Укажите, сколько стоит упаковка. Можно изменить значения из
          справочника под конкретное изделие.
        </p>

        <div className="ingredient-form__price-row">
          <Field label="Цена, ₽" htmlFor="ingredient-package-price">
            <Input
              id="ingredient-package-price"
              name="packagePrice"
              type="number"
              min="0"
              step="any"
              placeholder="400"
              defaultValue={formDefaults.packagePrice || undefined}
              required
              disabled={isSaving}
            />
          </Field>

          <span className="ingredient-form__price-separator">за</span>

          <Field label="Количество" htmlFor="ingredient-package-amount">
            <Input
              id="ingredient-package-amount"
              name="packageAmount"
              type="number"
              min="0"
              step="any"
              placeholder="2"
              defaultValue={formDefaults.packageAmount || undefined}
              required
              disabled={isSaving}
            />
          </Field>

          <Field label="Ед. изм." htmlFor="ingredient-package-unit">
            <Select
              id="ingredient-package-unit"
              defaultValue={formDefaults.packageUnit}
              options={UNIT_OPTIONS}
              disabled={isSaving}
              onValueChange={(unit) => {
                packageUnitRef.current = unit as Unit;
              }}
            />
          </Field>
        </div>
      </fieldset>

      <div className="ingredient-form__actions">
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? isEditing
              ? "Сохранение..."
              : "Добавление..."
            : isEditing
              ? "Сохранить"
              : "Добавить"}
        </Button>
        {isEditing && (
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
