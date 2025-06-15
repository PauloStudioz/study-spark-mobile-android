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

    // Step 5: Show *actual* order-of-operations steps for arithmetic expressions (NEW)
    if (hasMultipleOperations(normalizedExpression)) {
      const stepBreakdown = getConcreteArithmeticSteps(normalizedExpression);
      steps.push(...stepBreakdown);
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

/**
 * Produces step-by-step solutions showing each arithmetic operation as performed according to PEMDAS.
 * Returns a list of MathStep, each showing an intermediate calculation.
 */
const getConcreteArithmeticSteps = (expr: string): MathStep[] => {
  try {
    let exprStr = expr;
    let steps: MathStep[] = [];

    // Use mathjs parser systematically to simplify one operation at a time
    // Loop until you reach a "primitive" (no operations left)
    for (let i = 0; i < 20; i++) { // max 20 steps to avoid accidental infinite loop
      // Parse expression tree
      const node = parse(exprStr);

      // Try to find the deepest operation (parentheses, then exponents, then mult/div, then add/sub)
      const nextReduction = findAndReduceNext(node);
      if (!nextReduction) break;

      const { before, after, explanation } = nextReduction;
      // Only push if expression truly changed to avoid infinite repeats
      if (before !== after) {
        steps.push({
          step: after,
          result: after,
          explanation,
          isIntermediate: true
        });
        exprStr = after;
      } else {
        break;
      }
    }
    return steps;
  } catch {
    // Fallback: no steps shown
    return [];
  }
};

/**
 * Given a mathjs node, finds and reduces the next operation step-by-step.
 * Returns an object { before, after, explanation } or null if no more reductions.
 */
function findAndReduceNext(node: any): { before: string; after: string; explanation: string } | null {
  // 1. Parentheses
  if (node.type === 'ParenthesisNode') {
    // Evaluate inside the parentheses only, keep the rest
    const innerEval = simplify(node.content);
    const after = innerEval.toString();
    return {
      before: node.toString(),
      after: after,
      explanation: 'Evaluate inside parentheses'
    };
  }

  // 2. For OperatorNode, recursively reduce children
  if (node.type === 'OperatorNode') {
    // Recursively try left first
    const reducedLeft = findAndReduceNext(node.args[0]);
    if (reducedLeft) {
      // Replace left child with its reduction, keep right as is
      const argsClone = [parse(reducedLeft.after), node.args[1]];
      const newNode = node.clone();
      newNode.args = argsClone;
      return {
        before: node.toString(),
        after: newNode.toString(),
        explanation: 'Simplify left side'
      };
    }

    // Then try right child
    if (node.args.length > 1) {
      const reducedRight = findAndReduceNext(node.args[1]);
      if (reducedRight) {
        const argsClone = [node.args[0], parse(reducedRight.after)];
        const newNode = node.clone();
        newNode.args = argsClone;
        return {
          before: node.toString(),
          after: newNode.toString(),
          explanation: 'Simplify right side'
        };
      }
    }

    // If both children are numeric, evaluate the operation itself
    if (
      node.args.length === 2 &&
      isNumericNode(node.args[0]) &&
      isNumericNode(node.args[1])
    ) {
      const before = node.toString();
      // Safe evaluation for this binary operation
      const value = simplify(node).toString();
      const opSymbol = node.op;
      let explanation = '';
      switch (opSymbol) {
        case '^': explanation = 'Calculate exponentiation'; break;
        case '*': explanation = 'Multiply'; break;
        case '/': explanation = 'Divide'; break;
        case '+': explanation = 'Add'; break;
        case '-': explanation = 'Subtract'; break;
        default: explanation = `Operate (${opSymbol})`;
      }
      return {
        before,
        after: value,
        explanation
      };
    }
    // For unary ops like negation, factorial
    if (
      node.args.length === 1 &&
      isNumericNode(node.args[0])
    ) {
      const before = node.toString();
      const value = simplify(node).toString();
      let explanation = '';
      if (node.op === '-') explanation = 'Apply unary minus';
      else if (node.op === '+') explanation = 'Apply unary plus';
      else if (node.fn === 'factorial') explanation = 'Apply factorial';
      else explanation = `Operate (${node.op || node.fn})`;
      return {
        before,
        after: value,
        explanation
      };
    }
  }

  // 3. For FunctionNodes like sqrt, sin, cos, etc. Reduce arguments first
  if (node.type === 'FunctionNode') {
    // Reduce arguments recursively
    for (let i = 0; i < node.args.length; i++) {
      const reducedArg = findAndReduceNext(node.args[i]);
      if (reducedArg) {
        const argsClone = [...node.args];
        argsClone[i] = parse(reducedArg.after);
        const newNode = node.clone();
        newNode.args = argsClone;
        return {
          before: node.toString(),
          after: newNode.toString(),
          explanation: `Reduce argument of ${node.name}`
        };
      }
    }
    // All arguments primitive? Try evaluating
    if (node.args.every(isNumericNode)) {
      const before = node.toString();
      const value = simplify(node).toString();
      return {
        before,
        after: value,
        explanation: `Compute ${node.name}`
      };
    }
  }

  // Nothing left to reduce
  return null;
}

function isNumericNode(node: any): boolean {
  // mathjs ConstantNode or a numeric output
  try {
    if (node.type === 'ConstantNode') return true;
    // For negative numbers or results, try evaluating
    const val = node.evaluate ? node.evaluate() : simplify(node).valueOf();
    return typeof val === 'number' && isFinite(val);
  } catch {
    return false;
  }
}

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
