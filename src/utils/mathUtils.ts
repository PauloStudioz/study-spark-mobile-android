
/**
 * Utility helpers for math step-by-step
 */

export const normalizeExpression = (expr: string) =>
  expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/=/g, '')
    .replace(/%/g, '/100')
    .trim();

export const hasComplexOperations = (expr: string) =>
  /[\(\)^√]|sin|cos|tan|log|sqrt|abs/.test(expr);

export const hasMultipleOperations = (expr: string) => {
  const operators = expr.match(/[\+\-\*\/\^]/g);
  return operators && operators.length > 1;
};

export const formatResult = (result: any): string => {
  if (typeof result === 'number') {
    // Round to 10 decimal places to avoid floating point errors
    const rounded = Math.round(result * 10000000000) / 10000000000;
    return rounded.toString();
  }
  return result.toString();
};
