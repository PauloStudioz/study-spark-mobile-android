
import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';

interface Grade {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
}

const GradeCalculator = () => {
  const { isDarkMode } = useTheme();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [newGrade, setNewGrade] = useState({
    name: '',
    score: '',
    maxScore: '',
    weight: ''
  });

  const addGrade = () => {
    if (newGrade.name && newGrade.score && newGrade.maxScore && newGrade.weight) {
      const grade: Grade = {
        id: Date.now().toString(),
        name: newGrade.name,
        score: parseFloat(newGrade.score),
        maxScore: parseFloat(newGrade.maxScore),
        weight: parseFloat(newGrade.weight)
      };
      setGrades([...grades, grade]);
      setNewGrade({ name: '', score: '', maxScore: '', weight: '' });
    }
  };

  const removeGrade = (id: string) => {
    setGrades(grades.filter(grade => grade.id !== id));
  };

  const calculateOverallGrade = () => {
    if (grades.length === 0) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;

    grades.forEach(grade => {
      const percentage = (grade.score / grade.maxScore) * 100;
      totalWeightedScore += percentage * grade.weight;
      totalWeight += grade.weight;
    });

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    return 'F';
  };

  const overallGrade = calculateOverallGrade();

  return (
    <div className="space-y-6">
      <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200'} shadow-xl`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Grade Calculator
          </CardTitle>
          <div className="mt-4">
            <div className={`text-4xl font-bold ${getGradeColor(overallGrade)}`}>
              {overallGrade.toFixed(1)}%
            </div>
            <div className={`text-2xl font-semibold ${getGradeColor(overallGrade)}`}>
              {getLetterGrade(overallGrade)}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {grades.map(grade => {
          const percentage = (grade.score / grade.maxScore) * 100;
          return (
            <Card key={grade.id} className={`${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {grade.name}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {grade.score}/{grade.maxScore} • Weight: {grade.weight}% • 
                      <span className={`ml-1 font-medium ${getGradeColor(percentage)}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeGrade(grade.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className={`${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
        <CardContent className="p-4 space-y-3">
          <Input
            placeholder="Assignment name"
            value={newGrade.name}
            onChange={(e) => setNewGrade({...newGrade, name: e.target.value})}
            className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Score"
              type="number"
              value={newGrade.score}
              onChange={(e) => setNewGrade({...newGrade, score: e.target.value})}
              className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
            <Input
              placeholder="Max Score"
              type="number"
              value={newGrade.maxScore}
              onChange={(e) => setNewGrade({...newGrade, maxScore: e.target.value})}
              className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
            <Input
              placeholder="Weight %"
              type="number"
              value={newGrade.weight}
              onChange={(e) => setNewGrade({...newGrade, weight: e.target.value})}
              className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>
          <Button onClick={addGrade} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            <Plus size={20} className="mr-2" />
            Add Grade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeCalculator;
