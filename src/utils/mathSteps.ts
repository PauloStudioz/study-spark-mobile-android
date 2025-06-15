import { evaluate, parse, simplify } from 'mathjs';
import { arithmeticStepBreakdown } from './arithmeticSteps';
import {
  normalizeExpression,
  hasComplexOperations,
  hasMultipleOperations,
  formatResult,
} from './mathUtils';

export interface MathStep {
  step: string;
  result: string;
  explanation: string;
  opType?: string;
  isIntermediate?: boolean;
}

export const calculateWithSteps = (expression: string): { result: string; steps: MathStep[] } => {
  try {
    const normExpr = normalizeExpression(expression);
    const steps: MathStep[] = [];

    // 1. Original input
    steps.push({
      step: expression,
      result: expression,
      explanation: 'Original expression you entered.',
    });

    // 2. Normalize and show if changed
    if (normExpr !== expression) {
      steps.push({
        step: normExpr,
        result: normExpr,
        explanation: 'Expression converted to calculator-friendly format.',
        isIntermediate: true,
      });
    }

    // 3. Show preview of simplification only if meaningful
    const parsed = parse(normExpr);
    const simplified = hasComplexOperations(normExpr) ? simplify(parsed) : parsed;
    if (
      simplified.toString() !== normExpr &&
      hasComplexOperations(normExpr)
    ) {
      steps.push({
        step: simplified.toString(),
        result: simplified.toString(),
        explanation: 'Expression simplified for easier calculation.',
        isIntermediate: true,
      });
    }

    // 4. Detailed arithmetic step-by-step (the big improvement!)
    if (hasMultipleOperations(normExpr) || hasComplexOperations(normExpr)) {
      const breakdown = arithmeticStepBreakdown(normExpr);
      breakdown.forEach((step, i) => {
        // Give a much more visible, easy-to-understand step index and keep all helpful explanation content
        steps.push({
          ...step,
          explanation: `Step #${steps.length}: ${step.explanation}`,
        });
      });
    }

    // 5. Final answer (always at the end)
    const result = evaluate(normExpr);
    const resultString = formatResult(result);
    steps.push({
      step: `= ${resultString}`,
      result: resultString,
      explanation: 'Final answer. All calculations above were performed step-by-step with rules of precedence followed.',
    });

    return { result: resultString, steps };
  } catch (error) {
    return {
      result: 'Error',
      steps: [
        {
          step: expression,
          result: 'Error',
          explanation: 'Invalid mathematical expression. Please check your syntax.',
        },
      ],
    };
  }
};

export const solveEquation = (equation: string): { steps: MathStep[]; solution?: string } => {
  try {
    const steps: MathStep[] = [];
    
    if (equation.includes('=')) {
      const [left, right] = equation.split('=');

      steps.push({
        step: equation,
        result: equation,
        explanation: 'Original equation to solve.',
      });

      // Try to solve simple linear equations of the form ax + b = c
      if (left.includes('x') && !right.includes('x')) {
        steps.push({
          step: `${left} = ${right}`,
          result: `Isolate x`,
          explanation: 'Rearrange to solve for x.',
          isIntermediate: true,
        });

        try {
          const solution = evaluate(right);
          steps.push({
            step: `x = ${solution}`,
            result: solution.toString(),
            explanation: 'Solution found.',
          });

          return { steps, solution: solution.toString() };
        } catch {
          steps.push({
            step: equation,
            result: 'Cannot solve',
            explanation: 'This equation is too complex for automatic solving.',
          });
        }
      } else {
        steps.push({
          step: equation,
          result: 'Cannot solve',
          explanation: 'Equation solving for this type is not supported yet.',
        });
      }
    }
    
    return { steps };
  } catch (error) {
    return {
      steps: [{
        step: equation,
        result: 'Error',
        explanation: 'Cannot solve equation - invalid format.',
      }]
    };
  }
};
