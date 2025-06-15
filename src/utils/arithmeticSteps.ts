
import { parse, simplify } from 'mathjs';
import type { MathStep } from './mathSteps';
import { formatResult } from './mathUtils';

type Reduction =
  | { before: string; after: string; explanation: string; opType?: string }
  | null;

function getRuleDescription(op: string) {
  switch (op) {
    case '^':
      return 'Exponentiation (Orders): Compute exponents before multiplying or adding.';
    case '*':
    case '/':
      return 'Multiplication/Division: Do these before addition/subtraction, according to PEMDAS/BODMAS rules.';
    case '+':
    case '-':
      return 'Addition/Subtraction: These are performed after multiplication/division unless in parentheses.';
    default:
      return '';
  }
}

function getParenthesisTip() {
  return 'According to the order of operations (PEMDAS/BODMAS), always solve the expressions inside parentheses first.';
}

function getFunctionTip(func: string) {
  switch (func) {
    case 'sin':
    case 'cos':
    case 'tan':
      return `Trigonometric function: ${func}(x) computes the trigonometric ratio for angle x in radians.`;
    case 'sqrt':
      return 'Square root: sqrt(x) finds the value that, when multiplied by itself, gives x.';
    case 'log':
      return 'Logarithm: log(x) finds the exponent to which the base (usually e or 10) must be raised to yield x.';
    case 'abs':
      return 'Absolute value: abs(x) gives the distance of x from zero, always non-negative.';
    default:
      return '';
  }
}

/**
 * Explains a single math step, covering: what's being performed, why (mathematical rule), and a tip/fact.
 */
function explainOperation(op: string, args: string[], opType: string) {
  const opDescs: Record<string, string> = {
    '^': `Raise ${args[0]} to the power of ${args[1]}.`,
    '*': `Multiply ${args[0]} by ${args[1]}.`,
    '/': `Divide ${args[0]} by ${args[1]}.`,
    '+': `Add ${args[0]} and ${args[1]}.`,
    '-': `Subtract ${args[1]} from ${args[0]}.`,
  };
  return (
    `${opType} — ${opDescs[op] || 'Calculate operation.'} ${getRuleDescription(op)}`
  );
}

function explainFunctionStep(func: string, args: string[]) {
  const funcExpl: Record<string, string> = {
    sqrt: `Take the square root of ${args[0]}.`,
    sin: `Find the sine of ${args[0]} (measured in radians).`,
    cos: `Find the cosine of ${args[0]} (measured in radians).`,
    tan: `Find the tangent of ${args[0]} (measured in radians).`,
    log: `Take the logarithm of ${args[0]}.`,
    abs: `Get the absolute value of ${args[0]}.`,
  };
  return `Function Step — ${funcExpl[func] || `Evaluate ${func}(${args.join(', ')})`} ${getFunctionTip(func)}`;
}

function getOpType(op: string): string {
  switch (op) {
    case '^':
      return 'Exponentiation Step';
    case '*':
      return 'Multiplication Step';
    case '/':
      return 'Division Step';
    case '+':
      return 'Addition Step';
    case '-':
      return 'Subtraction Step';
    default:
      return 'Operation Step';
  }
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

/**
 * Reduce one operation in the tree, giving a clear, educational explanation.
 */
function reduceOne(node: any): Reduction {
  // Parentheses
  if (node.type === 'ParenthesisNode') {
    const innerEval = simplify(node.content);
    return {
      before: node.toString(),
      after: innerEval.toString(),
      explanation: `Parentheses Step — Calculate inside parentheses: ${node.toString()}. ${getParenthesisTip()}`,
      opType: 'Parentheses',
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
        explanation: `Focus on the left-side first as per precedence.`,
        opType: getOpType(op),
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
          explanation: `Now solve the right side of the ${getOpType(op).toLowerCase()}.`,
          opType: getOpType(op),
        };
      }
    }

    // Evaluate the operator if both sides are numbers
    if (node.args.length === 2 && isNumeric(node.args[0]) && isNumeric(node.args[1])) {
      const before = node.toString();
      const value = simplify(node).toString();
      const opType = getOpType(op);
      return {
        before,
        after: value,
        explanation: explainOperation(op, node.args.map((a: any) => a.toString()), opType),
        opType,
      };
    }

    // Unary operators
    if (node.args.length === 1 && isNumeric(node.args[0])) {
      const val = simplify(node).toString();
      let ex = '';
      let opType = '';
      if (op === '-') {
        ex = 'Unary Minus Step — Make positive number negative or vice versa.';
        opType = 'Negation Step';
      }
      else if (op === '+') {
        ex = 'Unary Plus Step — This does not change the value of the number.';
        opType = 'Plus Step';
      }
      else ex = `Operate: ${op}`;
      return {
        before: node.toString(),
        after: val,
        explanation: ex,
        opType,
      };
    }
  }

  // Functions: explain deeply
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
          explanation: `First, evaluate the argument for function "${node.name}". ${getFunctionTip(node.name)}`,
          opType: 'Function Step',
        };
      }
    }
    if (node.args.every(isNumeric)) {
      const val = simplify(node).toString();
      return {
        before: node.toString(),
        after: val,
        explanation: explainFunctionStep(node.name, node.args.map((a: any) => a.toString())),
        opType: 'Function Step',
      };
    }
  }

  return null;
}

/**
 * Step-by-step solver for arithmetic,
 * now with rich, instructional explanations for each step.
 */
export function arithmeticStepBreakdown(expr: string): MathStep[] {
  let exprStr = expr;
  let steps: MathStep[] = [];
  for (let i = 0; i < 40; i++) {
    const node = parse(exprStr);
    const next = reduceOne(node);
    if (!next) break;
    if (next.before !== next.after) {
      steps.push({
        step: next.after,
        result: next.after,
        explanation: next.explanation,
        opType: next.opType,
        isIntermediate: true,
      });
      exprStr = next.after;
    } else {
      break;
    }
  }
  return steps;
}
