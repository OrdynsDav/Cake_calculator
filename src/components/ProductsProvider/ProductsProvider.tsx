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
  updateProductOutputGramsAction,
  updateIngredientAction,
} from "@/app/actions/products";
import {
  createCatalogIngredientAction,
  deleteCatalogIngredientAction,
  updateCatalogIngredientAction,
} from "@/app/actions/ingredients";
import type {
  CatalogIngredient,
  CatalogIngredientFormData,
} from "@/types/ingredient";
import type {
  CompositionRow,
  IngredientFormData,
  IngredientItem,
  Product,
  ProductReferenceMode,
  ProductType,
} from "@/types/product";
import {
  buildCompositionRows,
  getProductTotal,
} from "@/lib/product";

type ProductsContextValue = {
  products: Product[];
  catalogIngredients: CatalogIngredient[];
  activeProduct: Product | null;
  compositionRows: CompositionRow[];
  total: number;
  editingItemId: string | null;
  editingCatalogId: string | null;
  availableProductRefs: Product[];
  productType: ProductType;
  productReferenceMode: ProductReferenceMode;
  isSaving: boolean;
  createProduct: (name: string, outputGrams: number) => Promise<void>;
  updateActiveProductOutputGrams: (outputGrams: number) => Promise<void>;
  selectProduct: (id: string) => void;
  deleteProduct: (id: string) => Promise<void>;
  createCatalogIngredient: (data: CatalogIngredientFormData) => Promise<void>;
  updateCatalogIngredient: (
    id: string,
    data: CatalogIngredientFormData,
  ) => Promise<void>;
  deleteCatalogIngredient: (id: string) => Promise<void>;
  startEditingCatalog: (id: string) => void;
  cancelEditingCatalog: () => void;
  getEditingCatalogIngredient: () => CatalogIngredient | null;
  addIngredient: (data: IngredientFormData) => Promise<void>;
  updateIngredient: (itemId: string, data: IngredientFormData) => Promise<void>;
  addProductRef: (productId: string, amount: number) => Promise<void>;
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
  initialIngredients: CatalogIngredient[];
  productType?: ProductType;
  availableProductRefs?: Product[];
};

export function ProductsProvider({
  children,
  initialProducts,
  initialIngredients,
  productType = "product",
  availableProductRefs: initialAvailableProductRefs,
}: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [catalogIngredients, setCatalogIngredients] = useState(
    initialIngredients,
  );
  const [activeProductId, setActiveProductId] = useState<string | null>(
    initialProducts[0]?.id ?? null,
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const productReferenceMode: ProductReferenceMode =
    productType === "dessert" ? "grams" : "count";

  const referenceProducts = initialAvailableProductRefs ?? products;

  const productsById = useMemo(() => {
    const combined = new Map<string, Product>();

    for (const product of referenceProducts) {
      combined.set(product.id, product);
    }

    for (const product of products) {
      combined.set(product.id, product);
    }

    return combined;
  }, [referenceProducts, products]);

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

    return referenceProducts.filter(
      (product) =>
        product.id !== activeProduct.id &&
        !wouldCreateCycle(activeProduct.id, product.id, productsById),
    );
  }, [activeProduct, productsById, referenceProducts]);

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
    async (name: string, outputGrams: number) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const result = await runMutation(() =>
        createProductAction(trimmed, productType, outputGrams),
      );
      if (!result) return;

      setProducts(result.products);
      setActiveProductId(result.createdId);
      setEditingItemId(null);
    },
    [productType, runMutation],
  );

  const selectProduct = useCallback((id: string) => {
    setActiveProductId(id);
    setEditingItemId(null);
  }, []);

  const updateActiveProductOutputGrams = useCallback(
    async (outputGrams: number) => {
      if (!activeProductId || outputGrams <= 0) return;

      const nextProducts = await runMutation(() =>
        updateProductOutputGramsAction(activeProductId, outputGrams, productType),
      );

      if (nextProducts) {
        setProducts(nextProducts);
      }
    },
    [activeProductId, productType, runMutation],
  );

  const createCatalogIngredient = useCallback(
    async (data: CatalogIngredientFormData) => {
      const nextIngredients = await runMutation(() =>
        createCatalogIngredientAction(data),
      );

      if (nextIngredients) {
        setCatalogIngredients(nextIngredients);
        setEditingCatalogId(null);
      }
    },
    [runMutation],
  );

  const updateCatalogIngredient = useCallback(
    async (id: string, data: CatalogIngredientFormData) => {
      const nextIngredients = await runMutation(() =>
        updateCatalogIngredientAction(id, data),
      );

      if (nextIngredients) {
        setCatalogIngredients(nextIngredients);
        setEditingCatalogId(null);
      }
    },
    [runMutation],
  );

  const deleteCatalogIngredient = useCallback(
    async (id: string) => {
      const nextIngredients = await runMutation(() =>
        deleteCatalogIngredientAction(id),
      );

      if (!nextIngredients) return;

      setEditingCatalogId((currentId) =>
        currentId === id ? null : currentId,
      );
      setCatalogIngredients(nextIngredients);
    },
    [runMutation],
  );

  const startEditingCatalog = useCallback((id: string) => {
    setEditingCatalogId(id);
    setEditingItemId(null);
  }, []);

  const cancelEditingCatalog = useCallback(() => {
    setEditingCatalogId(null);
  }, []);

  const getEditingCatalogIngredient = useCallback((): CatalogIngredient | null => {
    if (!editingCatalogId) return null;

    return (
      catalogIngredients.find(
        (ingredient) => ingredient.id === editingCatalogId,
      ) ?? null
    );
  }, [catalogIngredients, editingCatalogId]);

  const deleteProduct = useCallback(
    async (id: string) => {
      const nextProducts = await runMutation(() =>
        deleteProductAction(id, productType),
      );
      if (!nextProducts) return;

      setEditingItemId(null);
      setProducts(nextProducts);
      setActiveProductId((activeId) =>
        activeId === id ? (nextProducts[0]?.id ?? null) : activeId,
      );
    },
    [productType, runMutation],
  );

  const addIngredient = useCallback(
    async (data: IngredientFormData) => {
      if (!activeProductId) return;

      const nextProducts = await runMutation(() =>
        addIngredientAction(activeProductId, data, productType),
      );

      if (nextProducts) {
        setProducts(nextProducts);
      }
    },
    [activeProductId, productType, runMutation],
  );

  const updateIngredient = useCallback(
    async (itemId: string, data: IngredientFormData) => {
      if (!activeProductId) return;

      const nextProducts = await runMutation(() =>
        updateIngredientAction(activeProductId, itemId, data, productType),
      );

      if (nextProducts) {
        setProducts(nextProducts);
        setEditingItemId(null);
      }
    },
    [activeProductId, productType, runMutation],
  );

  const addProductRef = useCallback(
    async (productId: string, amount: number) => {
      if (!activeProductId || amount <= 0) return;

      const nextProducts = await runMutation(() =>
        addProductRefAction(activeProductId, productId, amount, productType),
      );

      if (nextProducts) {
        setProducts(nextProducts);
      }
    },
    [activeProductId, productType, runMutation],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!activeProductId) return;

      const nextProducts = await runMutation(() =>
        removeItemAction(activeProductId, itemId, productType),
      );

      if (nextProducts) {
        setProducts(nextProducts);
        setEditingItemId((currentId) =>
          currentId === itemId ? null : currentId,
        );
      }
    },
    [activeProductId, productType, runMutation],
  );

  const startEditing = useCallback((itemId: string) => {
    setEditingItemId(itemId);
    setEditingCatalogId(null);
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
      catalogIngredients,
      activeProduct,
      compositionRows,
      total,
      editingItemId,
      editingCatalogId,
      availableProductRefs,
      productType,
      productReferenceMode,
      isSaving,
      createProduct,
      updateActiveProductOutputGrams,
      selectProduct,
      deleteProduct,
      createCatalogIngredient,
      updateCatalogIngredient,
      deleteCatalogIngredient,
      startEditingCatalog,
      cancelEditingCatalog,
      getEditingCatalogIngredient,
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
      catalogIngredients,
      activeProduct,
      compositionRows,
      total,
      editingItemId,
      editingCatalogId,
      availableProductRefs,
      productType,
      productReferenceMode,
      isSaving,
      createProduct,
      updateActiveProductOutputGrams,
      selectProduct,
      deleteProduct,
      createCatalogIngredient,
      updateCatalogIngredient,
      deleteCatalogIngredient,
      startEditingCatalog,
      cancelEditingCatalog,
      getEditingCatalogIngredient,
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
