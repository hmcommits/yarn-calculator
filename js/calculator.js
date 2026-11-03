/**
 * Yarn Calculation Engine
 * Implements strict textile industry count formulas:
 * 
 * 1. Tex = (g ÷ L) × 1000
 * 2. eng = 590.5 ÷ Tex  (English Cotton Count Ne)
 * 3. Denier = 5315 ÷ eng
 * 4. Metric = eng ÷ 0.59 (Metric Count Nm)
 */

export const FORMULAS = {
  tex: {
    name: 'Tex',
    symbol: 'tex',
    system: 'Direct',
    systemDesc: 'Weight in grams per 1,000 meters',
    formula: '(g ÷ L) × 1000',
    unit: 'tex',
    description: 'ISO standard universal direct yarn numbering system. Higher value = thicker yarn.'
  },
  eng: {
    name: 'English Count',
    symbol: 'Ne / NeC',
    system: 'Indirect',
    systemDesc: 'Hanks of 840 yards per 1 lb',
    formula: '590.5 ÷ Tex',
    unit: 's Ne',
    description: 'Traditional cotton count system used worldwide. Higher value = finer yarn.'
  },
  denier: {
    name: 'Denier',
    symbol: 'Den / D',
    system: 'Direct',
    systemDesc: 'Weight in grams per 9,000 meters',
    formula: '5315 ÷ eng',
    unit: 'D',
    description: 'Standard for silk, nylon, polyester, and continuous filament yarns.'
  },
  metric: {
    name: 'Metric Count',
    symbol: 'Nm',
    system: 'Indirect',
    systemDesc: 'Meters of yarn per 1 gram',
    formula: 'eng ÷ 0.59',
    unit: 'Nm',
    description: 'European metric system used for spun yarns, worsted, and woolens.'
  }
};

/**
 * Calculates all 4 yarn counts from length (L in meters) and weight (g in grams)
 * @param {number} lengthMeters - Length in meters (L)
 * @param {number} weightGrams - Weight in grams (g)
 * @returns {object} Calculated yarn counts and metadata
 */
export function calculateYarnCount(lengthMeters, weightGrams) {
  const L = parseFloat(lengthMeters);
  const g = parseFloat(weightGrams);

  if (isNaN(L) || isNaN(g) || L <= 0 || g <= 0) {
    return {
      isValid: false,
      error: L <= 0 && g <= 0 
        ? 'Please enter positive values for length and weight'
        : L <= 0 
          ? 'Length must be greater than zero' 
          : 'Weight must be greater than zero',
      tex: null,
      eng: null,
      denier: null,
      metric: null,
      classification: null
    };
  }

  // 1. Tex = (g ÷ L) × 1000
  const tex = (g / L) * 1000;

  // 2. eng = 590.5 ÷ Tex
  const eng = 590.5 / tex;

  // 3. Denier = 5315 ÷ eng
  const denier = 5315 / eng;

  // 4. Metric = eng ÷ 0.59
  const metric = eng / 0.59;

  return {
    isValid: true,
    error: null,
    inputs: { lengthMeters: L, weightGrams: g },
    tex,
    eng,
    denier,
    metric,
    classification: classifyYarn(tex, eng, denier)
  };
}

/**
 * Classifies the yarn by thickness category and textile application
 */
export function classifyYarn(tex, eng, denier) {
  if (tex < 6 || eng > 100 || denier < 54) {
    return {
      category: 'Ultra Fine / Microfiber',
      badgeClass: 'badge-ultra-fine',
      description: 'Filament silk, sheer hosiery, micro denier synthetics, luxury voiles.',
      gaugePercent: 12
    };
  } else if (tex < 15 || eng > 40 || denier < 135) {
    return {
      category: 'Fine Count',
      badgeClass: 'badge-fine',
      description: 'Fine shirting, sewing thread (40s-80s Ne), poplin, light knitwear.',
      gaugePercent: 32
    };
  } else if (tex < 35 || eng > 17 || denier < 315) {
    return {
      category: 'Medium Count',
      badgeClass: 'badge-medium',
      description: 'Standard apparel, t-shirt jersey (20s-30s Ne), bed linen, casual knits.',
      gaugePercent: 55
    };
  } else if (tex < 100 || eng > 6 || denier < 900) {
    return {
      category: 'Coarse / Heavy',
      badgeClass: 'badge-coarse',
      description: 'Denim warp/weft (7s-16s Ne), twill, heavy canvas, chino fabrics.',
      gaugePercent: 78
    };
  } else {
    return {
      category: 'Extra Heavy / Cordage',
      badgeClass: 'badge-heavy',
      description: 'Carpet yarns, upholstery, industrial cords, heavyweight technical textiles.',
      gaugePercent: 95
    };
  }
}

/**
 * Formats a numeric yarn count value with specified decimal precision
 * @param {number|null} value 
 * @param {number|string} precision - 0, 1, 2, 3, 4, or 'exact'
 */
export function formatValue(value, precision = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }

  if (precision === 'exact') {
    return Number(value.toPrecision(7)).toString();
  }

  const p = parseInt(precision, 10);
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: p,
    maximumFractionDigits: p
  });
}

/**
 * Reverse calculate weight or length given a target count
 */
export function reverseCalculate({ type, countValue, targetLength, targetWeight }) {
  const count = parseFloat(countValue);
  if (isNaN(count) || count <= 0) return null;

  // Convert given count to Tex first
  let tex;
  if (type === 'tex') {
    tex = count;
  } else if (type === 'eng') {
    tex = 590.5 / count;
  } else if (type === 'denier') {
    tex = count / 9; // or 5315 / (5315 / (count / 9))
  } else if (type === 'metric') {
    tex = 1000 / count; // or 590.5 / (count * 0.59)
  }

  // Tex = (g / L) * 1000  =>  g = (Tex * L) / 1000,  L = (g * 1000) / Tex
  if (targetLength && !isNaN(parseFloat(targetLength))) {
    const L = parseFloat(targetLength);
    const weightGrams = (tex * L) / 1000;
    return { weightGrams, lengthMeters: L, tex };
  } else if (targetWeight && !isNaN(parseFloat(targetWeight))) {
    const g = parseFloat(targetWeight);
    const lengthMeters = (g * 1000) / tex;
    return { lengthMeters, weightGrams: g, tex };
  }

  return null;
}
