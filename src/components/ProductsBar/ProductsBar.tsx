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

export default function ProductsBar() {
  const { products, activeProduct, createProduct, selectProduct, deleteProduct } =
    useProducts();
  const [isCreating, setIsCreating] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductToDelete | null>(
    null,
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const name = String(new FormData(form).get("productName") ?? "");

    await createProduct(name);
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
          <div className="products-bar__list" role="tablist" aria-label="Изделия">
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
                  >
                    {product.name}
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    className="products-bar__delete"
                    onClick={() => handleDeleteClick(product.id, product.name)}
                    aria-label={`Удалить ${product.name}`}
                  >
                    <X size={16} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {isCreating ? (
          <form className="products-bar__create-form" onSubmit={handleCreate}>
            <Field label="Название" htmlFor="product-name">
              <Input
                id="product-name"
                name="productName"
                placeholder="Торт, бисквит, крем..."
                required
                autoComplete="off"
                autoFocus
              />
            </Field>
            <div className="products-bar__create-actions">
              <Button type="submit">Создать</Button>
              <Button type="button" variant="outline" onClick={handleCancelCreate}>
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
          >
            <Plus size={16} />
            Создать
          </Button>
        )}

        {products.length === 0 && !isCreating && (
          <p className="products-bar__hint">
            Создайте изделие — торт, бисквит или что угодно — и добавьте в него
            состав
          </p>
        )}
      </div>

      <Modal
        open={productToDelete !== null}
        title="Удалить изделие?"
        onClose={handleCancelDelete}
      >
        <p className="modal__text">
          «{productToDelete?.name}» будет удален и убран из всех составов.
        </p>
        <div className="modal__actions">
          <Button type="button" onClick={handleConfirmDelete}>
            Удалить
          </Button>
          <Button type="button" variant="outline" onClick={handleCancelDelete}>
            Отмена
          </Button>
        </div>
      </Modal>
    </>
  );
}
