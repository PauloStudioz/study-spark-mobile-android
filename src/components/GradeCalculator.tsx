import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import SubjectCard from "./SubjectCard";

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

const LOCAL_KEY = 'grade-calculator-data-v1';

const GradeCalculator = () => {
  const { isDarkMode } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, { name: string, score: string, maxScore: string, weight: string }>>({});

  // Load subjects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) setSubjects(JSON.parse(saved));
  }, []);

  // Save subjects to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(subjects));
  }, [subjects]);

  // Add new subject
  const addSubject = () => {
    if (!newSubject.trim()) return;
    const newSub: Subject = {
      id: Date.now().toString(),
      name: newSubject.trim(),
      grades: []
    };
    setSubjects([...subjects, newSub]);
    setNewSubject('');
    setAssignmentDrafts(drafts => ({ ...drafts, [newSub.id]: { name: '', score: '', maxScore: '', weight: '' } }));
  };

  // Remove subject
  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    setAssignmentDrafts(drafts => {
      const newDrafts = { ...drafts };
      delete newDrafts[id];
      return newDrafts;
    });
  };

  // Handle subject draft values (one per subject)
  const handleDraftChange = (subjectId: string, field: string, value: string) => {
    setAssignmentDrafts(drafts => ({
      ...drafts,
      [subjectId]: {
        ...drafts[subjectId],
        [field]: value
      }
    }));
  };

  // Add grade to subject (refined: only reset if successful, always keep fields visible)
  const addGrade = (subjectId: string) => {
    const draft = assignmentDrafts[subjectId];
    if (
      !draft ||
      !draft.name.trim() ||
      !draft.score.trim() ||
      !draft.maxScore.trim() ||
      !draft.weight.trim()
    ) return;
    const grade: Grade = {
      id: Date.now().toString(),
      name: draft.name.trim(),
      score: parseFloat(draft.score),
      maxScore: parseFloat(draft.maxScore),
      weight: parseFloat(draft.weight)
    };
    setSubjects(subjects =>
      subjects.map(subject =>
        subject.id === subjectId
          ? { ...subject, grades: [...subject.grades, grade] }
          : subject
      )
    );
    // Only reset if grade added
    setAssignmentDrafts(drafts => ({
      ...drafts,
      [subjectId]: { name: '', score: '', maxScore: '', weight: '' }
    }));
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

  // Weighted average for subject
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
          <SubjectCard
            key={subject.id}
            subject={subject}
            draft={assignmentDrafts[subject.id] || { name: '', score: '', maxScore: '', weight: '' }}
            onDraftChange={(field, value) => handleDraftChange(subject.id, field, value)}
            onAddGrade={() => addGrade(subject.id)}
            onRemoveGrade={(gradeId) => removeGrade(subject.id, gradeId)}
            onRemoveSubject={() => removeSubject(subject.id)}
            isDarkMode={isDarkMode}
            calculateSubjectFinal={calculateSubjectFinal}
            getGradeColor={getGradeColor}
            getLetterGrade={getLetterGrade}
          />
        ))}
      </div>
    </div>
  );
};

export default GradeCalculator;
