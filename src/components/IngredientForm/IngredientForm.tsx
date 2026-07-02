"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import Select from "@/shared/select/Select";
import {
  CUSTOM_CATALOG_OPTION,
  type CatalogIngredient,
} from "@/types/ingredient";
import type { IngredientItem, Unit } from "@/types/product";
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

type IngredientFormFieldsProps = {
  initialCatalogId: string;
  initialDefaults: FormDefaults;
  catalogIngredients: CatalogIngredient[];
  editingItemId: string | null;
  editingIngredient: IngredientItem | null;
  isSaving: boolean;
  onSubmitted: () => void;
  onCancelEdit: () => void;
};

const IngredientFormFields = forwardRef<
  HTMLFormElement,
  IngredientFormFieldsProps
>(function IngredientFormFields(
  {
    initialCatalogId,
    initialDefaults,
    catalogIngredients,
    editingItemId,
    editingIngredient,
    isSaving,
    onSubmitted,
    onCancelEdit,
  },
  ref,
) {
  const { addIngredient, updateIngredient } = useProducts();
  const formRef = useRef<HTMLFormElement>(null);
  const unitRef = useRef<Unit>(initialDefaults.unit);
  const packageUnitRef = useRef<Unit>(initialDefaults.packageUnit);
  const catalogIdRef = useRef<string>(initialCatalogId);
  const [fieldsResetKey, setFieldsResetKey] = useState(0);
  const [selectedCatalogId, setSelectedCatalogId] = useState(initialCatalogId);
  const [formDefaults, setFormDefaults] = useState(initialDefaults);

  useImperativeHandle(ref, () => formRef.current as HTMLFormElement);

  const isEditing = Boolean(editingIngredient);

  const catalogOptions = [
    { value: CUSTOM_CATALOG_OPTION, label: "Свой ингредиент" },
    ...catalogIngredients.map((ingredient) => ({
      value: ingredient.id,
      label: ingredient.name,
    })),
  ];

  function handleCatalogChange(catalogId: string) {
    catalogIdRef.current = catalogId;
    setSelectedCatalogId(catalogId);

    if (catalogId === CUSTOM_CATALOG_OPTION) {
      setFormDefaults((current) => ({
        ...EMPTY_DEFAULTS,
        amount: current.amount,
        unit: current.unit,
      }));
      setFieldsResetKey((key) => key + 1);
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
    setFieldsResetKey((key) => key + 1);
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

    onSubmitted();
  }

  const inputsKey = `${selectedCatalogId}-${fieldsResetKey}`;

  return (
    <form
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
          key={`name-${inputsKey}`}
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
            key={`amount-${inputsKey}`}
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
            key={`unit-${inputsKey}`}
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
              key={`package-price-${inputsKey}`}
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
              key={`package-amount-${inputsKey}`}
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
              key={`package-unit-${inputsKey}`}
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
            onClick={onCancelEdit}
            disabled={isSaving}
          >
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
});

export default function IngredientForm() {
  const {
    catalogIngredients,
    editingItemId,
    isSaving,
    cancelEditing,
    getEditingIngredient,
  } = useProducts();

  const formRef = useRef<HTMLFormElement>(null);
  const [formResetKey, setFormResetKey] = useState(0);

  const editingIngredient = getEditingIngredient();
  const isEditing = Boolean(editingIngredient);

  const formKey = editingItemId ?? `new-${formResetKey}`;
  const initialSeed = editingIngredient
    ? {
      catalogId:
        editingIngredient.catalogIngredientId ?? CUSTOM_CATALOG_OPTION,
      defaults: getDefaultsFromCompositionItem(editingIngredient),
    }
    : {
      catalogId: CUSTOM_CATALOG_OPTION,
      defaults: EMPTY_DEFAULTS,
    };

  useEffect(() => {
    if (!isEditing) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isEditing, editingItemId]);

  function handleSubmitted() {
    setFormResetKey((key) => key + 1);
  }

  function handleCancelEdit() {
    cancelEditing();
    setFormResetKey((key) => key + 1);
  }

  return (
    <IngredientFormFields
      key={formKey}
      ref={formRef}
      initialCatalogId={initialSeed.catalogId}
      initialDefaults={initialSeed.defaults}
      catalogIngredients={catalogIngredients}
      editingItemId={editingItemId}
      editingIngredient={editingIngredient}
      isSaving={isSaving}
      onSubmitted={handleSubmitted}
      onCancelEdit={handleCancelEdit}
    />
  );
}
