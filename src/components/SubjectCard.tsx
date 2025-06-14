
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from "lucide-react";
import AssignmentDraft from "./AssignmentDraft";

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

interface SubjectCardProps {
  subject: Subject;
  draft: { name: string; score: string; maxScore: string; weight: string };
  onDraftChange: (field: string, value: string) => void;
  onAddGrade: () => void;
  onRemoveGrade: (gradeId: string) => void;
  onRemoveSubject: () => void;
  isDarkMode: boolean;
  calculateSubjectFinal: (subject: Subject) => number;
  getGradeColor: (percentage: number) => string;
  getLetterGrade: (percentage: number) => string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject, draft, onDraftChange, onAddGrade, onRemoveGrade, onRemoveSubject,
  isDarkMode, calculateSubjectFinal, getGradeColor, getLetterGrade
}) => (
  <Card className={`relative min-w-[220px] flex-1 ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle
          className={`text-lg truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
        >
          {subject.name}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2"
            title="Add assignment"
            onClick={() => {
              document.getElementById(`add-draft-${subject.id}`)?.scrollIntoView({behavior: 'smooth', block: 'center'});
            }}
          >
            <Plus size={18} />
          </Button>
          <Button
            onClick={onRemoveSubject}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
            title="Remove subject"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      <div className="mt-1 mb-1">
        <span className={`font-semibold ${getGradeColor(calculateSubjectFinal(subject))}`}>
          {calculateSubjectFinal(subject).toFixed(1)}% {getLetterGrade(calculateSubjectFinal(subject))}
        </span>
      </div>
    </CardHeader>
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
                onClick={() => onRemoveGrade(grade.id)}
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
      <div id={`add-draft-${subject.id}`}>
        <AssignmentDraft
          value={draft}
          onChange={onDraftChange}
          onAdd={onAddGrade}
          isDarkMode={isDarkMode}
        />
      </div>
    </CardContent>
  </Card>
);

export default SubjectCard;
