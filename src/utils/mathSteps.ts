
import { evaluate, parse, simplify, derivative } from 'mathjs';

export interface MathStep {
  step: string;
  result: string;
  explanation: string;
  isIntermediate?: boolean;
}

export const calculateWithSteps = (expression: string): { result: string; steps: MathStep[] } => {
  try {
    const normalizedExpression = normalizeExpression(expression);
    const steps: MathStep[] = [];
    
    // Step 1: Show original expression
    steps.push({
      step: expression,
      result: expression,
      explanation: 'Original expression entered by user'
    });
    
    // Step 2: Show normalized expression if different
    if (normalizedExpression !== expression) {
      steps.push({
        step: normalizedExpression,
        result: normalizedExpression,
        explanation: 'Expression normalized (× → *, ÷ → /, % → /100)',
        isIntermediate: true
      });
    }
    
    // Step 3: Parse and analyze the expression
    const parsed = parse(normalizedExpression);
    
    // Step 4: Show simplification steps for complex expressions
    if (hasComplexOperations(normalizedExpression)) {
      const simplified = simplify(parsed);
      if (simplified.toString() !== normalizedExpression) {
        steps.push({
          step: simplified.toString(),
          result: simplified.toString(),
          explanation: 'Mathematical simplification applied',
          isIntermediate: true
        });
      }
    }
    
    // Step 5: Show order of operations breakdown for complex expressions
    if (hasMultipleOperations(normalizedExpression)) {
      const operationSteps = getOperationOrderSteps(normalizedExpression);
      steps.push(...operationSteps);
    }
    
    // Step 6: Calculate final result
    const result = evaluate(normalizedExpression);
    const resultString = formatResult(result);
    
    steps.push({
      step: `= ${resultString}`,
      result: resultString,
      explanation: 'Final calculated result'
    });
    
    return { result: resultString, steps };
    
  } catch (error) {
    return {
      result: 'Error',
      steps: [{
        step: expression,
        result: 'Error',
        explanation: 'Invalid mathematical expression. Please check syntax.'
      }]
    };
  }
};

const normalizeExpression = (expr: string) => {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/=/g, '')
    .replace(/%/g, '/100')
    .trim();
};

const hasComplexOperations = (expr: string): boolean => {
  return /[\(\)^√]|sin|cos|tan|log|sqrt|abs/.test(expr);
};

const hasMultipleOperations = (expr: string): boolean => {
  const operators = expr.match(/[\+\-\*\/\^]/g);
  return operators && operators.length > 1;
};

const getOperationOrderSteps = (expr: string): MathStep[] => {
  const steps: MathStep[] = [];
  
  // This is a simplified version - for a complete implementation,
  // you'd need a more sophisticated expression parser
  if (expr.includes('(') && expr.includes(')')) {
    steps.push({
      step: expr,
      result: expr,
      explanation: 'First, solve expressions in parentheses ()',
      isIntermediate: true
    });
  }
  
  if (expr.includes('^')) {
    steps.push({
      step: expr,
      result: expr,
      explanation: 'Next, calculate exponents and powers (^)',
      isIntermediate: true
    });
  }
  
  if (expr.includes('*') || expr.includes('/')) {
    steps.push({
      step: expr,
      result: expr,
      explanation: 'Then, perform multiplication (×) and division (÷) from left to right',
      isIntermediate: true
    });
  }
  
  if (expr.includes('+') || (expr.includes('-') && expr.lastIndexOf('-') > 0)) {
    steps.push({
      step: expr,
      result: expr,
      explanation: 'Finally, perform addition (+) and subtraction (-) from left to right',
      isIntermediate: true
    });
  }
  
  return steps;
};

const formatResult = (result: any): string => {
  if (typeof result === 'number') {
    // Round to 10 decimal places to avoid floating point errors
    const rounded = Math.round(result * 10000000000) / 10000000000;
    return rounded.toString();
  }
  return result.toString();
};

export const solveEquation = (equation: string): { steps: MathStep[], solution?: string } => {
  try {
    const steps: MathStep[] = [];
    
    if (equation.includes('=')) {
      const [left, right] = equation.split('=');
      
      steps.push({
        step: equation,
        result: equation,
        explanation: 'Original equation to solve'
      });
      
      // Try to solve simple linear equations of the form ax + b = c
      if (left.includes('x') && !right.includes('x')) {
        steps.push({
          step: `${left} = ${right}`,
          result: `Isolate x`,
          explanation: 'Rearrange to solve for x',
          isIntermediate: true
        });
        
        try {
          const solution = evaluate(right);
          steps.push({
            step: `x = ${solution}`,
            result: solution.toString(),
            explanation: 'Solution found'
          });
          
          return { steps, solution: solution.toString() };
        } catch {
          steps.push({
            step: equation,
            result: 'Cannot solve',
            explanation: 'This equation is too complex for automatic solving'
          });
        }
      } else {
        steps.push({
          step: equation,
          result: 'Cannot solve',
          explanation: 'Equation solving for this type is not supported yet'
        });
      }
    }
    
    return { steps };
  } catch (error) {
    return {
      steps: [{
        step: equation,
        result: 'Error',
        explanation: 'Cannot solve equation - invalid format'
      }]
    };
  }
};
