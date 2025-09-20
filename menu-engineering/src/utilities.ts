export const UNITS = ["cup", "tablespoon", "teaspoon"] as const;

export function convertVolume(
  value: number,
  inputUnit: (typeof UNITS)[number],
  outputUnit: (typeof UNITS)[number]
): number {
  const conversionTable: Record<(typeof UNITS)[number], number> = {
    cup: 1,
    tablespoon: 16, // 1 cup = 16 tbsp
    teaspoon: 48, // 1 cup = 48 tsp
  };

  // Convert input → cups
  const valueInCups = value / conversionTable[inputUnit];

  // Convert cups → output
  return valueInCups * conversionTable[outputUnit];
}
