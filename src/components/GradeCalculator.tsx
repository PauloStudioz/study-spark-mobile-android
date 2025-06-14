
import React, { useState } from 'react';
import { Plus, Trash2, Calculator, BookOpen } from 'lucide-react';
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

interface Subject {
  id: string;
  name: string;
  grades: Grade[];
}

const GradeCalculator = () => {
  const { isDarkMode } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // For adding grade into a subject
  const [newGrade, setNewGrade] = useState({
    name: '',
    score: '',
    maxScore: '',
    weight: ''
  });

  // Add new subject
  const addSubject = () => {
    if (!newSubject.trim()) return;
    const newSub: Subject = {
      id: Date.now().toString(),
      name: newSubject,
      grades: []
    };
    setSubjects([...subjects, newSub]);
    setNewSubject('');
    setSelectedSubjectId(newSub.id);
    setNewGrade({ name: '', score: '', maxScore: '', weight: '' });
  };

  // Remove subject
  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    if (selectedSubjectId === id) setSelectedSubjectId(null);
  };

  // Select Subject
  const selectSubject = (id: string) => {
    setSelectedSubjectId(id);
    setNewGrade({ name: '', score: '', maxScore: '', weight: '' });
  };

  // Add grade to subject
  const addGrade = () => {
    if (
      !selectedSubjectId ||
      !newGrade.name ||
      !newGrade.score ||
      !newGrade.maxScore ||
      !newGrade.weight
    ) return;
    const grade: Grade = {
      id: Date.now().toString(),
      name: newGrade.name,
      score: parseFloat(newGrade.score),
      maxScore: parseFloat(newGrade.maxScore),
      weight: parseFloat(newGrade.weight)
    };
    setSubjects(subjects =>
      subjects.map(subject =>
        subject.id === selectedSubjectId
          ? { ...subject, grades: [...subject.grades, grade] }
          : subject
      )
    );
    setNewGrade({ name: '', score: '', maxScore: '', weight: '' });
  };

  // Remove grade from subject
  const removeGrade = (subjectId: string, gradeId: string) => {
    setSubjects(subjects =>
      subjects.map(subject =>
        subject.id === subjectId
          ? { ...subject, grades: subject.grades.filter(g => g.id !== gradeId) }
          : subject
      )
    );
  };

  // Average of all subject final percentages (each subject is weighted equally for average)
  const calculateSubjectFinal = (subject: Subject) => {
    if (!subject.grades.length) return 0;
    let totalWeightedScore = 0, totalWeight = 0;
    subject.grades.forEach(g => {
      const pct = (g.score / g.maxScore) * 100;
      totalWeightedScore += pct * g.weight;
      totalWeight += g.weight;
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

  // Total GPA: average of all subject finals
  const subjectFinals = subjects.map(s => calculateSubjectFinal(s));
  const overallGrade =
    subjects.length > 0
      ? subjectFinals.reduce((a, b) => a + b, 0) / subjects.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Total grade + add subject */}
      <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200'} shadow-xl`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl flex items-center justify-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <Calculator className="inline mr-1" /> Grade Calculator
          </CardTitle>
          <div className="mt-4">
            <div className={`text-4xl font-bold ${getGradeColor(overallGrade)}`}>
              {overallGrade.toFixed(1)}%
            </div>
            <div className={`text-2xl font-semibold ${getGradeColor(overallGrade)}`}>
              {getLetterGrade(overallGrade)}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Average across all subjects
            </div>
          </div>
          <div className="flex mt-6 gap-2 max-w-md mx-auto">
            <Input
              placeholder="New Subject (e.g., Math)"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              onKeyDown={e => e.key === "Enter" && addSubject()}
            />
            <Button onClick={addSubject} className="bg-blue-500 hover:bg-blue-600 text-white">
              <BookOpen size={18} className="mr-2" /> Add Subject
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-3">
        {subjects.map(subject => (
          <Card key={subject.id} className={`relative min-w-[220px] flex-1 ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle
                  onClick={() => selectSubject(subject.id)}
                  className={`text-lg cursor-pointer truncate ${selectedSubjectId === subject.id
                    ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                    : (isDarkMode ? 'text-gray-200' : 'text-gray-900')
                  }`}
                >
                  {subject.name}
                </CardTitle>
                <Button
                  onClick={() => removeSubject(subject.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                  title="Remove subject"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="mt-1 mb-1">
                <span className={`font-semibold ${getGradeColor(calculateSubjectFinal(subject))}`}>
                  {calculateSubjectFinal(subject).toFixed(1)}% {getLetterGrade(calculateSubjectFinal(subject))}
                </span>
              </div>
            </CardHeader>
            {/* Grade list for subject */}
            <CardContent>
              <div className="space-y-1">
                {subject.grades.map(grade => {
                  const percentage = (grade.score / grade.maxScore) * 100;
                  return (
                    <div key={grade.id} className="flex justify-between items-center px-2 py-1 rounded">
                      <div className="flex flex-col flex-1">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {grade.name}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {grade.score}/{grade.maxScore} • {grade.weight}%
                          <span className={`ml-1 font-medium ${getGradeColor(percentage)}`}> {percentage.toFixed(1)}%</span>
                        </span>
                      </div>
                      <Button
                        onClick={() => removeGrade(subject.id, grade.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 ml-1"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            {/* If this is the selected subject, show grade entry form */}
            {selectedSubjectId === subject.id && (
              <CardContent>
                <div className="space-y-2 pt-2 border-t border-gray-300/10">
                  <Input
                    placeholder="Assignment name"
                    value={newGrade.name}
                    onChange={e => setNewGrade({ ...newGrade, name: e.target.value })}
                    className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Score"
                      type="number"
                      value={newGrade.score}
                      onChange={e => setNewGrade({ ...newGrade, score: e.target.value })}
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                    <Input
                      placeholder="Max Score"
                      type="number"
                      value={newGrade.maxScore}
                      onChange={e => setNewGrade({ ...newGrade, maxScore: e.target.value })}
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                    <Input
                      placeholder="Weight %"
                      type="number"
                      value={newGrade.weight}
                      onChange={e => setNewGrade({ ...newGrade, weight: e.target.value })}
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                  <Button onClick={addGrade} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    <Plus size={20} className="mr-2" />
                    Add Grade
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GradeCalculator;
