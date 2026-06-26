import type { Unit } from "@/types/product";

type UnitFamily = "mass" | "volume" | "count";

export function getUnitFamily(unit: Unit): UnitFamily {
  switch (unit) {
    case "г":
    case "кг":
      return "mass";
    case "мл":
    case "л":
      return "volume";
    case "шт":
      return "count";
  }
}

export function areUnitsCompatible(a: Unit, b: Unit): boolean {
  return getUnitFamily(a) === getUnitFamily(b);
}

export function toBaseAmount(amount: number, unit: Unit): number {
  switch (unit) {
    case "кг":
      return amount * 1000;
    case "г":
      return amount;
    case "л":
      return amount * 1000;
    case "мл":
      return amount;
    case "шт":
      return amount;
  }
}

export function getProportionalCost(
  usageAmount: number,
  usageUnit: Unit,
  packagePrice: number,
  packageAmount: number,
  packageUnit: Unit,
): number {
  if (packageAmount <= 0 || packagePrice < 0) return 0;
  if (!areUnitsCompatible(usageUnit, packageUnit)) return 0;

  const usageBase = toBaseAmount(usageAmount, usageUnit);
  const packageBase = toBaseAmount(packageAmount, packageUnit);

  if (packageBase <= 0) return 0;

  return packagePrice * (usageBase / packageBase);
}
