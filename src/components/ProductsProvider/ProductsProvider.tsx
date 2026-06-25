"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addIngredientAction,
  addProductRefAction,
  createProductAction,
  deleteProductAction,
  removeItemAction,
  updateIngredientAction,
} from "@/app/actions/products";
import type {
  CompositionRow,
  IngredientFormData,
  IngredientItem,
  Product,
} from "@/types/product";
import {
  buildCompositionRows,
  getProductTotal,
} from "@/lib/product";

type ProductsContextValue = {
  products: Product[];
  activeProduct: Product | null;
  compositionRows: CompositionRow[];
  total: number;
  editingItemId: string | null;
  availableProductRefs: Product[];
  isSaving: boolean;
  createProduct: (name: string) => Promise<void>;
  selectProduct: (id: string) => void;
  deleteProduct: (id: string) => Promise<void>;
  addIngredient: (data: IngredientFormData) => Promise<void>;
  updateIngredient: (itemId: string, data: IngredientFormData) => Promise<void>;
  addProductRef: (productId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  startEditing: (itemId: string) => void;
  cancelEditing: () => void;
  getEditingIngredient: () => IngredientItem | null;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

function wouldCreateCycle(
  ownerId: string,
  refId: string,
  productsById: Map<string, Product>,
): boolean {
  if (ownerId === refId) return true;

  function isDescendant(
    targetId: string,
    ancestorId: string,
    stack: string[] = [],
  ): boolean {
    if (stack.includes(ancestorId)) return false;

    const ancestor = productsById.get(ancestorId);
    if (!ancestor) return false;

    for (const item of ancestor.items) {
      if (item.kind !== "product") continue;

      if (item.productId === targetId) return true;

      if (isDescendant(targetId, item.productId, [...stack, ancestorId])) {
        return true;
      }
    }

    return false;
  }

  return isDescendant(ownerId, refId);
}

type ProductsProviderProps = {
  children: ReactNode;
  initialProducts: Product[];
};

export function ProductsProvider({
  children,
  initialProducts,
}: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeProductId, setActiveProductId] = useState<string | null>(
    initialProducts[0]?.id ?? null,
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) ?? null,
    [products, activeProductId],
  );

  const compositionRows = useMemo(
    () =>
      activeProduct
        ? buildCompositionRows(
          activeProduct.items,
          productsById,
          activeProduct.id,
        )
        : [],
    [activeProduct, productsById],
  );

  const total = useMemo(
    () =>
      activeProduct
        ? getProductTotal(activeProduct.id, productsById)
        : 0,
    [activeProduct, productsById],
  );

  const availableProductRefs = useMemo(() => {
    if (!activeProduct) return [];

    return products.filter(
      (product) =>
        product.id !== activeProduct.id &&
        !wouldCreateCycle(activeProduct.id, product.id, productsById),
    );
  }, [activeProduct, products, productsById]);

  const runMutation = useCallback(
    async <T,>(mutation: () => Promise<T>): Promise<T | undefined> => {
      setIsSaving(true);

      try {
        return await mutation();
      } catch (error) {
        console.error(error);
        return undefined;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const createProduct = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const result = await runMutation(() => createProductAction(trimmed));
      if (!result) return;

      setProducts(result.products);
      setActiveProductId(result.createdId);
      setEditingItemId(null);
    },
    [runMutation],
  );

  const selectProduct = useCallback((id: string) => {
    setActiveProductId(id);
    setEditingItemId(null);
  }, []);

  const deleteProduct = useCallback(
    async (id: string) => {
      const nextProducts = await runMutation(() => deleteProductAction(id));
      if (!nextProducts) return;

      setEditingItemId(null);
      setProducts(nextProducts);
      setActiveProductId((activeId) =>
        activeId === id ? (nextProducts[0]?.id ?? null) : activeId,
      );
    },
    [runMutation],
  );

  const addIngredient = useCallback(
    async (data: IngredientFormData) => {
      if (!activeProductId) return;

      const nextProducts = await runMutation(() =>
        addIngredientAction(activeProductId, data),
      );

      if (nextProducts) {
        setProducts(nextProducts);
      }
    },
    [activeProductId, runMutation],
  );

  const updateIngredient = useCallback(
    async (itemId: string, data: IngredientFormData) => {
      if (!activeProductId) return;

      const nextProducts = await runMutation(() =>
        updateIngredientAction(activeProductId, itemId, data),
      );

      if (nextProducts) {
        setProducts(nextProducts);
        setEditingItemId(null);
      }
    },
    [activeProductId, runMutation],
  );

  const addProductRef = useCallback(
    async (productId: string, quantity: number) => {
      if (!activeProductId || quantity <= 0) return;

      const nextProducts = await runMutation(() =>
        addProductRefAction(activeProductId, productId, quantity),
      );

      if (nextProducts) {
        setProducts(nextProducts);
      }
    },
    [activeProductId, runMutation],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!activeProductId) return;

      const nextProducts = await runMutation(() =>
        removeItemAction(activeProductId, itemId),
      );

      if (nextProducts) {
        setProducts(nextProducts);
        setEditingItemId((currentId) =>
          currentId === itemId ? null : currentId,
        );
      }
    },
    [activeProductId, runMutation],
  );

  const startEditing = useCallback((itemId: string) => {
    setEditingItemId(itemId);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingItemId(null);
  }, []);

  const getEditingIngredient = useCallback((): IngredientItem | null => {
    if (!activeProduct || !editingItemId) return null;

    const item = activeProduct.items.find(
      (entry) => entry.id === editingItemId,
    );

    return item?.kind === "ingredient" ? item : null;
  }, [activeProduct, editingItemId]);

  const value = useMemo(
    () => ({
      products,
      activeProduct,
      compositionRows,
      total,
      editingItemId,
      availableProductRefs,
      isSaving,
      createProduct,
      selectProduct,
      deleteProduct,
      addIngredient,
      updateIngredient,
      addProductRef,
      removeItem,
      startEditing,
      cancelEditing,
      getEditingIngredient,
    }),
    [
      products,
      activeProduct,
      compositionRows,
      total,
      editingItemId,
      availableProductRefs,
      isSaving,
      createProduct,
      selectProduct,
      deleteProduct,
      addIngredient,
      updateIngredient,
      addProductRef,
      removeItem,
      startEditing,
      cancelEditing,
      getEditingIngredient,
    ],
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }

  return context;
}
