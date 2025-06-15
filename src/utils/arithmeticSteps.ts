
import { parse, simplify } from 'mathjs';
import type { MathStep } from './mathSteps';
import { formatResult } from './mathUtils';

type Reduction =
  | { before: string; after: string; explanation: string }
  | null;

/**
 * Find and reduce one operation in the syntax tree at a time,
 * explaining with user-friendly wording.
 */
function reduceOne(node: any): Reduction {
  // Parentheses
  if (node.type === 'ParenthesisNode') {
    const innerEval = simplify(node.content);
    return {
      before: node.toString(),
      after: innerEval.toString(),
      explanation: 'Evaluate the contents inside the parentheses.',
    };
  }

  // Operators
  if (node.type === 'OperatorNode') {
    const op = node.op;
    // Recursively try left child
    const reducedLeft = reduceOne(node.args[0]);
    if (reducedLeft) {
      const argsClone = [parse(reducedLeft.after), node.args[1]];
      const newNode = node.clone();
      newNode.args = argsClone;
      return {
        before: node.toString(),
        after: newNode.toString(),
        explanation: leftOpExplanation(op, node),
      };
    }
    // Recursively try right child
    if (node.args.length > 1) {
      const reducedRight = reduceOne(node.args[1]);
      if (reducedRight) {
        const argsClone = [node.args[0], parse(reducedRight.after)];
        const newNode = node.clone();
        newNode.args = argsClone;
        return {
          before: node.toString(),
          after: newNode.toString(),
          explanation: rightOpExplanation(op, node),
        };
      }
    }
    // Evaluate the operator if both sides are numbers
    if (node.args.length === 2 && isNumeric(node.args[0]) && isNumeric(node.args[1])) {
      const before = node.toString();
      const value = simplify(node).toString();
      return {
        before,
        after: value,
        explanation: opToExplanation(op, node.args.map((a: any) => a.toString())),
      };
    }
    // Unary
    if (node.args.length === 1 && isNumeric(node.args[0])) {
      const val = simplify(node).toString();
      let ex = '';
      if (op === '-') ex = 'Apply unary minus.';
      else if (op === '+') ex = 'Apply unary plus.';
      else ex = `Operate: ${op}`;
      return {
        before: node.toString(),
        after: val,
        explanation: ex,
      };
    }
  }

  // Functions: explain each
  if (node.type === 'FunctionNode') {
    for (let i = 0; i < node.args.length; i++) {
      const reducedArg = reduceOne(node.args[i]);
      if (reducedArg) {
        const argsClone = [...node.args];
        argsClone[i] = parse(reducedArg.after);
        const newNode = node.clone();
        newNode.args = argsClone;
        return {
          before: node.toString(),
          after: newNode.toString(),
          explanation: `First, simplify the argument of “${node.name}”.`,
        };
      }
    }
    if (node.args.every(isNumeric)) {
      const val = simplify(node).toString();
      return {
        before: node.toString(),
        after: val,
        explanation: funcToExplanation(node.name, node.args.map((a: any) => a.toString())),
      };
    }
  }

  return null;
}

function isNumeric(node: any): boolean {
  try {
    if (node.type === 'ConstantNode') return true;
    const val = node.evaluate ? node.evaluate() : simplify(node).valueOf();
    return typeof val === 'number' && isFinite(val);
  } catch {
    return false;
  }
}

function opToExplanation(op: string, args: string[]) {
  switch (op) {
    case '^':
      return `Calculate the power: raise ${args[0]} to the ${args[1]}th power.`;
    case '*':
      return `Multiply ${args[0]} × ${args[1]}.`;
    case '/':
      return `Divide ${args[0]} by ${args[1]}.`;
    case '+':
      return `Add ${args[0]} plus ${args[1]}.`;
    case '-':
      return `Subtract ${args[1]} from ${args[0]}.`;
    default:
      return `Evaluate operation (“${op}”).`;
  }
}
function leftOpExplanation(op: string, node: any) {
  return (
    {
      '+': 'First, simplify the term on the left side.',
      '-': 'First, simplify the left side.',
      '*': 'First, compute multiplication on the left.',
      '/': 'First, simplify the numerator.',
      '^': 'Evaluate the base first.',
    }[op] || 'Simplify left side.'
  );
}
function rightOpExplanation(op: string, node: any) {
  return (
    {
      '+': 'Then, simplify the right side.',
      '-': 'Now, simplify the right side.',
      '*': 'Now, multiply the right factor.',
      '/': 'Now, simplify the denominator.',
      '^': 'Then, simplify the exponent.',
    }[op] || 'Simplify right side.'
  );
}

function funcToExplanation(func: string, args: string[]) {
  switch (func) {
    case 'sqrt':
      return `Compute the square root of ${args[0]}.`;
    case 'sin':
      return `Compute the sine of ${args[0]} (radians).`;
    case 'cos':
      return `Compute the cosine of ${args[0]} (radians).`;
    case 'tan':
      return `Compute the tangent of ${args[0]} (radians).`;
    case 'log':
      return `Compute the logarithm of ${args[0]}.`;
    case 'abs':
      return `Find the absolute value of ${args[0]}.`;
    default:
      return `Evaluate function “${func}”.`;
  }
}

/** Step-by-step solver for arithmetic, returns all steps with human explanations. */
export function arithmeticStepBreakdown(expr: string): MathStep[] {
  let exprStr = expr;
  let steps: MathStep[] = [];
  for (let i = 0; i < 25; i++) {
    const node = parse(exprStr);
    const next = reduceOne(node);
    if (!next) break;
    if (next.before !== next.after) {
      steps.push({
        step: next.after,
        result: next.after,
        explanation: next.explanation,
        isIntermediate: true,
      });
      exprStr = next.after;
    } else {
      break;
    }
  }
  return steps;
}
