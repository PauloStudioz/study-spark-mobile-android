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

  const handleButtonPress = (button: any) => {
    if (button.value === 'clear') {
      clearAll();
    } else if (button.value === 'equals') {
      solveExpression();
    } else if (button.value === 'negate') {
      setExpression(prev => {
        if (prev.startsWith('-')) {
          return prev.substring(1);
        } else {
          return '-' + prev;
        }
      });
    } else {
      insertSymbol(button.value);
    }
  };

  // Calculator layout - numbers and operators
  const numberButtons = [
    { label: 'C', value: 'clear', type: 'action' },
    { label: '±', value: 'negate', type: 'action' },
    { label: '%', value: '%', type: 'operator' },
    { label: '÷', value: '÷', type: 'operator' },
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '×', value: '×', type: 'operator' },
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '-', value: '-', type: 'operator' },
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '+', value: '+', type: 'operator' },
    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'number' },
    { label: '=', value: 'equals', type: 'equals' },
  ];

  const scientificButtons = [
    { label: 'sin', value: 'sin(' },
    { label: 'cos', value: 'cos(' },
    { label: 'tan', value: 'tan(' },
    { label: 'ln', value: 'log(' },
    { label: 'log', value: 'log10(' },
    { label: 'π', value: 'pi' },
    { label: 'e', value: 'e' },
    { label: '^', value: '^' },
    { label: '√', value: 'sqrt(' },
    { label: 'x²', value: '^2' },
    { label: '!', value: '!' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: 'abs', value: 'abs(' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card border shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-2xl text-foreground">
              <Calculator className="mr-2" size={24} />
              Scientific Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display */}
            <div className="bg-background border rounded-lg p-4 space-y-2">
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="0"
                className="text-right text-2xl h-16 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 shadow-none"
                onKeyPress={(e) => e.key === 'Enter' && solveExpression()}
              />
              
              {result && !error && (
                <div className="text-right text-xl text-muted-foreground">
                  = {result}
                </div>
              )}
              
              {error && (
                <div className="text-right text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>

            {/* Scientific Functions */}
            <div className="grid grid-cols-7 gap-2">
              {scientificButtons.map((button) => (
                <Button
                  key={button.label}
                  onClick={() => handleButtonPress(button)}
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm"
                >
                  {button.label}
                </Button>
              ))}
            </div>

            {/* Main Calculator Grid */}
            <div className="grid grid-cols-4 gap-3">
              {numberButtons.map((button) => (
                <Button
                  key={button.label}
                  onClick={() => handleButtonPress(button)}
                  variant={
                    button.type === 'equals' ? 'default' :
                    button.type === 'operator' ? 'secondary' :
                    button.type === 'action' ? 'outline' :
                    'ghost'
                  }
                  size="lg"
                  className={`h-14 text-lg font-semibold ${
                    button.label === '0' ? 'col-span-2' : ''
                  } ${
                    button.type === 'equals' ? 'bg-primary text-primary-foreground hover:bg-primary/90' :
                    button.type === 'operator' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
                    'hover:bg-accent'
                  }`}
                >
                  {button.label}
                </Button>
              ))}
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
                className="text-muted-foreground"
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
                  className="bg-muted p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setExpression(item.expression)}
                >
                  <div className="text-sm text-muted-foreground">{item.expression}</div>
                  <div className="text-lg font-semibold text-foreground">= {item.result}</div>
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
