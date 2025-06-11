import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { evaluate, parse, simplify } from 'mathjs';
import { Calculator, Trash2, Equal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const MathSolver = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<Array<{expression: string, result: string}>>([]);
  const [error, setError] = useState('');

  const normalizeExpression = (expr: string) => {
    // Replace common mathematical symbols with mathjs compatible ones
    return expr
      .replace(/×/g, '*')      // Multiplication symbol
      .replace(/÷/g, '/')      // Division symbol
      .replace(/=/g, '')       // Remove equals signs
      .replace(/!/g, '!')      // Factorial (mathjs supports this)
      .replace(/%/g, '/100')   // Convert percentage to decimal
      .trim();
  };

  const solveExpression = () => {
    if (!expression.trim()) return;

    try {
      setError('');
      const normalizedExpression = normalizeExpression(expression);
      console.log('Original expression:', expression);
      console.log('Normalized expression:', normalizedExpression);
      
      const parsedExpression = parse(normalizedExpression);
      const simplified = simplify(parsedExpression);
      const evaluated = evaluate(normalizedExpression);
      
      const resultString = typeof evaluated === 'number' 
        ? evaluated.toString() 
        : evaluated.toString();
      
      setResult(resultString);
      setHistory(prev => [...prev, { expression, result: resultString }].slice(-10));
      
      console.log('Parsed:', parsedExpression.toString());
      console.log('Simplified:', simplified.toString());
      console.log('Result:', evaluated);
    } catch (err) {
      setError('Invalid expression. Please check your input.');
      console.error('Math error:', err);
    }
  };

  const clearAll = () => {
    setExpression('');
    setResult('');
    setError('');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const insertSymbol = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  const quickButtons = [
    { label: 'π', value: 'pi' },
    { label: 'e', value: 'e' },
    { label: '√', value: 'sqrt(' },
    { label: 'sin', value: 'sin(' },
    { label: 'cos', value: 'cos(' },
    { label: 'tan', value: 'tan(' },
    { label: 'log', value: 'log(' },
    { label: 'ln', value: 'log(' },
    { label: '^', value: '^' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: 'abs', value: 'abs(' },
    { label: '×', value: '×' },
    { label: '÷', value: '÷' },
    { label: '%', value: '%' },
    { label: '!', value: '!' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
              <Calculator className="mr-2" size={24} />
              Advanced Math Solver
            </CardTitle>
            <p className="text-purple-600 mt-2">Supports +, -, ×, ÷, %, !, ^, and more</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter mathematical expression... (e.g., 2×3+5÷2)"
                className="text-lg h-12 rounded-xl border-2 focus:border-purple-400"
                onKeyPress={(e) => e.key === 'Enter' && solveExpression()}
              />
              
              {error && (
                <motion.p 
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              {result && !error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 p-4 rounded-xl border-2 border-green-200"
                >
                  <div className="flex items-center justify-center">
                    <Equal className="text-green-600 mr-2" size={20} />
                    <span className="text-2xl font-bold text-green-800">{result}</span>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {quickButtons.map((button) => (
                <Button
                  key={button.label}
                  onClick={() => insertSymbol(button.value)}
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm rounded-lg hover:bg-purple-100"
                >
                  {button.label}
                </Button>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={solveExpression}
                className="flex-1 bg-purple-600 hover:bg-purple-700 h-12 rounded-xl text-lg"
              >
                Solve
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="px-6 h-12 rounded-xl"
              >
                <Trash2 size={20} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Calculation History</CardTitle>
              <Button
                onClick={clearHistory}
                variant="ghost"
                size="sm"
                className="text-gray-500"
              >
                Clear
              </Button>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto space-y-2">
              {history.slice().reverse().map((item, index) => (
                <motion.div
                  key={history.length - index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => setExpression(item.expression)}
                >
                  <div className="text-sm text-gray-600">{item.expression}</div>
                  <div className="text-lg font-semibold text-purple-700">= {item.result}</div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default MathSolver;
