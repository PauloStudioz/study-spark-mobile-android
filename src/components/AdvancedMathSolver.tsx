
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Trash2, Equal, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { calculateWithSteps, solveEquation, MathStep } from '@/utils/mathSteps';

const AdvancedMathSolver = () => {
  const { currentTheme } = useTheme();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<MathStep[]>([]);
  const [history, setHistory] = useState<Array<{expression: string, result: string, steps: MathStep[]}>>([]);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(true);

  const solveExpression = () => {
    if (!expression.trim()) return;

    try {
      setError('');
      console.log('Solving expression:', expression);
      
      const { result: calculatedResult, steps: calculationSteps } = calculateWithSteps(expression);
      
      setResult(calculatedResult);
      setSteps(calculationSteps);
      setHistory(prev => [...prev, { 
        expression, 
        result: calculatedResult, 
        steps: calculationSteps 
      }].slice(-10));
      
    } catch (err) {
      setError('Invalid expression. Please check your input.');
      console.error('Math error:', err);
    }
  };

  const clearAll = () => {
    setExpression('');
    setResult('');
    setSteps([]);
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
    { label: 'ln', value: 'ln(' },
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
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl text-${currentTheme.textColor}`}>
              <Calculator className="mr-2" size={24} />
              Advanced Math Solver
            </CardTitle>
            <p className={`text-${currentTheme.textColor} mt-2 opacity-80`}>
              Solve complex equations with step-by-step solutions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter mathematical expression... (e.g., 2×3+5÷2, sin(45), x^2+3x+2)"
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
                  <div className="flex items-center justify-center mb-2">
                    <Equal className="text-green-600 mr-2" size={20} />
                    <span className="text-2xl font-bold text-green-800">{result}</span>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setShowSteps(!showSteps)}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      <BookOpen size={16} className="mr-2" />
                      {showSteps ? 'Hide' : 'Show'} Steps
                    </Button>
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
                className={`flex-1 bg-gradient-to-r ${currentTheme.headerGradient} hover:opacity-90 h-12 rounded-xl text-lg`}
              >
                <Zap size={20} className="mr-2" />
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

      {/* Solution Steps */}
      {steps.length > 0 && showSteps && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="mr-2" size={20} />
                Solution Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <Badge variant="outline" className="min-w-0 font-mono text-xs">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-gray-800 break-all">
                      {step.step}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {step.explanation}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
                  className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpression(item.expression)}
                >
                  <div className="text-sm text-gray-600 font-mono break-all">{item.expression}</div>
                  <div className="text-lg font-semibold text-purple-700">= {item.result}</div>
                  {item.steps.length > 1 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.steps.length} steps • Click to reuse
                    </div>
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
