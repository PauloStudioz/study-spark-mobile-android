
import { evaluate, parse, simplify, derivative } from 'mathjs';

export interface MathStep {
  step: string;
  result: string;
  explanation: string;
}

export const calculateWithSteps = (expression: string): { result: string; steps: MathStep[] } => {
  try {
    const normalizedExpression = normalizeExpression(expression);
    const steps: MathStep[] = [];
    
    // Step 1: Show original expression
    steps.push({
      step: expression,
      result: expression,
      explanation: 'Original expression'
    });
    
    // Step 2: Show normalized expression if different
    if (normalizedExpression !== expression) {
      steps.push({
        step: normalizedExpression,
        result: normalizedExpression,
        explanation: 'Normalized expression (converted symbols)'
      });
    }
    
    // Step 3: Parse and simplify
    const parsed = parse(normalizedExpression);
    const simplified = simplify(parsed);
    
    if (simplified.toString() !== normalizedExpression) {
      steps.push({
        step: simplified.toString(),
        result: simplified.toString(),
        explanation: 'Simplified expression'
      });
    }
    
    // Step 4: Calculate final result
    const result = evaluate(normalizedExpression);
    const resultString = typeof result === 'number' ? result.toString() : result.toString();
    
    steps.push({
      step: `= ${resultString}`,
      result: resultString,
      explanation: 'Final result'
    });
    
    return { result: resultString, steps };
    
  } catch (error) {
    return {
      result: 'Error',
      steps: [{
        step: expression,
        result: 'Error',
        explanation: 'Invalid expression'
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

export const solveEquation = (equation: string): { steps: MathStep[], solution?: string } => {
  try {
    const steps: MathStep[] = [];
    
    // Basic equation solving steps
    if (equation.includes('=')) {
      const [left, right] = equation.split('=');
      
      steps.push({
        step: equation,
        result: equation,
        explanation: 'Original equation'
      });
      
      // Try to solve simple linear equations
      if (left.includes('x') && !right.includes('x')) {
        steps.push({
          step: `${left} = ${right}`,
          result: `x = ${evaluate(right)}`,
          explanation: 'Solve for x'
        });
        
        return { steps, solution: evaluate(right).toString() };
      }
    }
    
    return { steps };
  } catch (error) {
    return {
      steps: [{
        step: equation,
        result: 'Error',
        explanation: 'Cannot solve equation'
      }]
    };
  }
};
