"use client";

import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import Button from "@/shared/button/Button";
import Modal from "@/shared/modal/Modal";
import CatalogIngredientForm from "@/components/CatalogIngredientForm/CatalogIngredientForm";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import { formatCatalogPriceLabel } from "@/lib/product";
import type { CatalogIngredient } from "@/types/ingredient";
import "./IngredientsBar.css";

export default function IngredientsBar() {
  const {
    catalogIngredients,
    editingCatalogId,
    isSaving,
    createCatalogIngredient,
    updateCatalogIngredient,
    deleteCatalogIngredient,
    startEditingCatalog,
    cancelEditingCatalog,
    getEditingCatalogIngredient,
  } = useProducts();

  const [isCreating, setIsCreating] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] =
    useState<CatalogIngredient | null>(null);

  const editingIngredient = getEditingCatalogIngredient();
  const showForm = isCreating || Boolean(editingIngredient);

  async function handleCreate(data: Parameters<typeof createCatalogIngredient>[0]) {
    await createCatalogIngredient(data);
    setIsCreating(false);
  }

  async function handleUpdate(data: Parameters<typeof updateCatalogIngredient>[1]) {
    if (!editingCatalogId) return;
    await updateCatalogIngredient(editingCatalogId, data);
  }

  function handleCancelForm() {
    setIsCreating(false);
    cancelEditingCatalog();
  }

  async function handleConfirmDelete() {
    if (!ingredientToDelete) return;
    await deleteCatalogIngredient(ingredientToDelete.id);
    setIngredientToDelete(null);
  }

  return (
    <>
      <div className="ingredients-bar">
      {showForm ? (
          <CatalogIngredientForm
            editingIngredient={editingIngredient}
            onSubmit={editingIngredient ? handleUpdate : handleCreate}
            onCancel={handleCancelForm}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            className="ingredients-bar__create-button"
            onClick={() => {
              cancelEditingCatalog();
              setIsCreating(true);
            }}
            disabled={isSaving}
          >
            <Plus size={16} />
            Добавить ингредиент
          </Button>
        )}
        {catalogIngredients.length > 0 && (
          <ul className="ingredients-bar__list">
            {catalogIngredients.map((ingredient) => (
              <li key={ingredient.id} className="ingredients-bar__item">
                <div className="ingredients-bar__item-content">
                  <span className="ingredients-bar__name">{ingredient.name}</span>
                  <span className="ingredients-bar__price">
                    {formatCatalogPriceLabel(ingredient)}
                  </span>
                </div>
                <div className="ingredients-bar__actions">
                  <Button
                    type="button"
                    variant="icon"
                    onClick={() => {
                      setIsCreating(false);
                      startEditingCatalog(ingredient.id);
                    }}
                    aria-label={`Редактировать ${ingredient.name}`}
                    aria-pressed={editingCatalogId === ingredient.id}
                    disabled={isSaving}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    onClick={() => setIngredientToDelete(ingredient)}
                    aria-label={`Удалить ${ingredient.name}`}
                    disabled={isSaving}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {catalogIngredients.length === 0 && !showForm && (
          <p className="ingredients-bar__hint">
            Создайте ингредиенты в справочнике — их можно будет подставлять в
            состав изделий
          </p>
        )}
      </div>

      <Modal
        open={ingredientToDelete !== null}
        title="Удалить ингредиент?"
        onClose={() => setIngredientToDelete(null)}
      >
        <p className="modal__text">
          «{ingredientToDelete?.name}» будет удалён из справочника. Строки в
          составах изделий сохранятся.
        </p>
        <div className="modal__actions">
          <Button type="button" onClick={handleConfirmDelete} disabled={isSaving}>
            {isSaving ? "Удаление..." : "Удалить"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIngredientToDelete(null)}
            disabled={isSaving}
          >
            Отмена
          </Button>
        </div>
      </Modal>
    </>
  );
}
