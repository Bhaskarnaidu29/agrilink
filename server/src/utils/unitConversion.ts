/**
 * AgriLink Server Unit Conversion Utility
 * Standardizes commodity prices to ₹/kg and handles Quintal-to-Kg math (1 quintal = 100 kg).
 */

export interface UnitConversionResult {
  pricePerKg: number;
  originalPrice: number;
  originalUnit: string;
  isConverted: boolean;
}

export function convertPriceToKg(price: number, cropName?: string, unit?: string): UnitConversionResult {
  const normUnit = (unit || '').toLowerCase();
  const normCrop = (cropName || '').toLowerCase();

  // If explicit unit is quintal or crop is Cotton with price > 500 (mandi benchmark stored per quintal)
  if (normUnit === 'quintal' || normUnit === 'qtl' || (normCrop === 'cotton' && price > 500)) {
    return {
      pricePerKg: Math.round((price / 100) * 10) / 10,
      originalPrice: price,
      originalUnit: 'quintal',
      isConverted: true,
    };
  }

  return {
    pricePerKg: price,
    originalPrice: price,
    originalUnit: unit || 'kg',
    isConverted: false,
  };
}
