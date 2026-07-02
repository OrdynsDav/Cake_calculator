"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import Button from "@/shared/button/Button";
import Field from "@/shared/field/Field";
import Input from "@/shared/input/Input";
import Modal from "@/shared/modal/Modal";
import { useProducts } from "@/components/ProductsProvider/ProductsProvider";
import "./ProductsBar.css";

type ProductToDelete = {
  id: string;
  name: string;
};

type ProductsBarProps = {
  entityName?: string;
  createLabel?: string;
  showList?: boolean;
  listRegionId?: string;
};

export default function ProductsBar({
  entityName = "изделие",
  createLabel = "Создать",
  showList = true,
  listRegionId,
}: ProductsBarProps) {
  const {
    products,
    activeProduct,
    createProduct,
    selectProduct,
    deleteProduct,
    isSaving,
  } = useProducts();
  const [isCreating, setIsCreating] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductToDelete | null>(
    null,
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("productName") ?? "");
    const outputGrams =
      entityName === "десерт"
        ? 1000
        : Number(formData.get("outputGrams") ?? 1000);

    await createProduct(name, outputGrams);
    setIsCreating(false);
  }

  function handleCancelCreate() {
    setIsCreating(false);
  }

  function handleDeleteClick(id: string, name: string) {
    setProductToDelete({ id, name });
  }

  function handleCancelDelete() {
    setProductToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return;

    await deleteProduct(productToDelete.id);
    setProductToDelete(null);
  }

  return (
    <>
      <div className="products-bar">
        {products.length > 0 && (
          <div
            id={listRegionId}
            className={
              showList
                ? "products-bar__list-region products-bar__list-region--expanded"
                : "products-bar__list-region"
            }
            aria-hidden={!showList}
          >
            <div className="products-bar__list" role="tablist" aria-label={createLabel}>
              {products.map((product) => {
                const isActive = product.id === activeProduct?.id;

                return (
                  <div
                    key={product.id}
                    className={
                      isActive
                        ? "products-bar__item products-bar__item--active"
                        : "products-bar__item"
                    }
                  >
                    <Button
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      className="products-bar__item-button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectProduct(product.id)}
                      disabled={isSaving || !showList}
                    >
                      {product.name}
                    </Button>
                    <Button
                      type="button"
                      variant="icon"
                      className="products-bar__delete"
                      onClick={() => handleDeleteClick(product.id, product.name)}
                      aria-label={`Удалить ${product.name}`}
                      disabled={isSaving || !showList}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCreating ? (
          <form className="products-bar__create-form" onSubmit={handleCreate}>
            <Field label="Название" htmlFor="product-name">
              <Input
                id="product-name"
                name="productName"
                placeholder={
                  entityName === "десерт"
                    ? "Трайфл, капкейк, пирожное..."
                    : "Торт, бисквит, крем..."
                }
                required
                autoComplete="off"
                autoFocus
                disabled={isSaving}
              />
            </Field>
            {entityName !== "десерт" && (
              <Field label="Выход, г" htmlFor="product-output-grams">
                <Input
                  id="product-output-grams"
                  name="outputGrams"
                  type="number"
                  min="0.01"
                  step="any"
                  defaultValue="1000"
                  required
                  disabled={isSaving}
                />
              </Field>
            )}
            <div className="products-bar__create-actions">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Создание..." : createLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCreate}
                disabled={isSaving}
              >
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="products-bar__create-button"
            onClick={() => setIsCreating(true)}
            disabled={isSaving}
          >
            <Plus size={16} />
            {createLabel}
          </Button>
        )}

        {products.length === 0 && !isCreating && (
          <p className="products-bar__hint">
            {entityName === "десерт"
              ? "Создайте десерт и добавьте в него готовые изделия"
              : "Создайте изделие — торт, бисквит или что угодно — и добавьте в него состав"}
          </p>
        )}
      </div>

      <Modal
        open={productToDelete !== null}
        title={`Удалить ${entityName}?`}
        onClose={handleCancelDelete}
      >
        <p className="modal__text">
          «{productToDelete?.name}» будет удален и убран из всех составов.
        </p>
        <div className="modal__actions">
          <Button type="button" onClick={handleConfirmDelete} disabled={isSaving}>
            {isSaving ? "Удаление..." : "Удалить"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelDelete}
            disabled={isSaving}
          >
            Отмена
          </Button>
        </div>
      </Modal>
    </>
  );
}
