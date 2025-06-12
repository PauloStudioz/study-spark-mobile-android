
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { evaluate, parse, simplify, derivative, format } from 'mathjs';
import { Calculator, Trash2, Equal, TrendingUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

interface CalculationResult {
  expression: string;
  result: string;
  steps?: string[];
  derivative?: string;
}

const AdvancedMathSolver = () => {
  const { currentTheme } = useTheme();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  const normalizeExpression = (expr: string) => {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/=/g, '')
      .replace(/!/g, '!')
      .replace(/%/g, '/100')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/\^/g, '^')
      .replace(/sin/g, 'sin')
      .replace(/cos/g, 'cos')
      .replace(/tan/g, 'tan')
      .replace(/ln/g, 'log')
      .replace(/log/g, 'log10')
      .trim();
  };

  const generateSteps = (expr: string) => {
    try {
      const steps = [];
      const parsed = parse(expr);
      
      steps.push(`Original: ${expr}`);
      
      // Show simplified form
      const simplified = simplify(parsed);
      if (simplified.toString() !== parsed.toString()) {
        steps.push(`Simplified: ${simplified.toString()}`);
      }
      
      // Calculate result
      const evaluated = evaluate(expr);
      steps.push(`Result: ${evaluated}`);
      
      return steps;
    } catch {
      return [`Expression: ${expr}`, 'Unable to show detailed steps'];
    }
  };

  const solveExpression = () => {
    if (!expression.trim()) return;

    try {
      setError('');
      const normalizedExpression = normalizeExpression(expression);
      console.log('Solving expression:', normalizedExpression);
      
      const evaluated = evaluate(normalizedExpression);
      const steps = showSteps ? generateSteps(normalizedExpression) : undefined;
      
      // Try to calculate derivative for expressions with variables
      let derivativeResult;
      try {
        if (normalizedExpression.includes('x')) {
          derivativeResult = derivative(normalizedExpression, 'x').toString();
        }
      } catch {
        // Derivative calculation failed, skip it
      }
      
      const resultString = typeof evaluated === 'number' 
        ? format(evaluated, { precision: 10 })
        : evaluated.toString();
      
      const calculationResult: CalculationResult = {
        expression,
        result: resultString,
        steps,
        derivative: derivativeResult
      };
      
      setResult(calculationResult);
      setHistory(prev => [calculationResult, ...prev].slice(0, 15));
      
    } catch (err) {
      setError('Invalid expression. Check your syntax.');
      console.error('Math error:', err);
    }
  };

  const clearAll = () => {
    setExpression('');
    setResult(null);
    setError('');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const insertSymbol = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  const scientificButtons = [
    { label: 'π', value: 'π' },
    { label: 'e', value: 'e' },
    { label: '√', value: 'sqrt(' },
    { label: 'x²', value: '^2' },
    { label: 'xʸ', value: '^' },
    { label: '1/x', value: '1/(' },
    { label: 'sin', value: 'sin(' },
    { label: 'cos', value: 'cos(' },
    { label: 'tan', value: 'tan(' },
    { label: 'ln', value: 'ln(' },
    { label: 'log', value: 'log(' },
    { label: '|x|', value: 'abs(' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '×', value: '×' },
    { label: '÷', value: '÷' },
    { label: '%', value: '%' },
    { label: '!', value: '!' },
  ];

  const basicButtons = [
    { label: '+', value: '+' },
    { label: '-', value: '-' },
    { label: '×', value: '×' },
    { label: '÷', value: '÷' },
    { label: '=', value: '=' },
    { label: '%', value: '%' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: 'π', value: 'π' },
    { label: '√', value: 'sqrt(' },
    { label: '^', value: '^' },
    { label: '!', value: '!' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl text-${currentTheme.textColor}`}>
              <Calculator className="mr-2" size={24} />
              Advanced Math Solver
            </CardTitle>
            <p className={`text-${currentTheme.textColor} mt-2 opacity-80`}>
              Scientific calculator with step-by-step solutions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter expression: 2×3+√16, sin(π/2), x^2+2x+1..."
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
                  className="bg-green-50 p-4 rounded-xl border-2 border-green-200 space-y-3"
                >
                  <div className="flex items-center justify-center">
                    <Equal className="text-green-600 mr-2" size={20} />
                    <span className="text-2xl font-bold text-green-800">{result.result}</span>
                  </div>
                  
                  {result.derivative && (
                    <div className="text-center">
                      <Badge variant="outline" className="mb-2">
                        <TrendingUp size={12} className="mr-1" />
                        Derivative
                      </Badge>
                      <p className="text-sm text-gray-700">d/dx = {result.derivative}</p>
                    </div>
                  )}
                  
                  {result.steps && showSteps && (
                    <div className="border-t pt-3">
                      <p className="font-medium text-gray-700 mb-2">Solution Steps:</p>
                      <div className="space-y-1">
                        {result.steps.map((step, index) => (
                          <p key={index} className="text-sm text-gray-600 bg-white p-2 rounded">
                            {index + 1}. {step}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="scientific">Scientific</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {basicButtons.map((button) => (
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
              </TabsContent>
              
              <TabsContent value="scientific" className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {scientificButtons.map((button) => (
                    <Button
                      key={button.label}
                      onClick={() => insertSymbol(button.value)}
                      variant="outline"
                      size="sm"
                      className="h-10 text-xs rounded-lg hover:bg-purple-100"
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex space-x-3">
              <Button
                onClick={solveExpression}
                className={`flex-1 bg-gradient-to-r ${currentTheme.headerGradient} hover:opacity-90 h-12 rounded-xl text-lg`}
              >
                Calculate
              </Button>
              <Button
                onClick={() => setShowSteps(!showSteps)}
                variant="outline"
                className="px-4 h-12 rounded-xl"
              >
                Steps
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="px-4 h-12 rounded-xl"
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
                <RotateCcw size={16} />
              </Button>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto space-y-2">
              {history.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => setExpression(item.expression)}
                >
                  <div className="text-sm text-gray-600">{item.expression}</div>
                  <div className="text-lg font-semibold text-purple-700">= {item.result}</div>
                  {item.derivative && (
                    <div className="text-xs text-gray-500">d/dx = {item.derivative}</div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedMathSolver;
