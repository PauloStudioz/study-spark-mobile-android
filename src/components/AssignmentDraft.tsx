
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AssignmentDraftProps {
  value: { name: string; score: string; maxScore: string; weight: string };
  onChange: (field: string, value: string) => void;
  onAdd: () => void;
  isDarkMode: boolean;
}

const AssignmentDraft: React.FC<AssignmentDraftProps> = ({ value, onChange, onAdd, isDarkMode }) => (
  <div className="space-y-2 pt-2 border-t border-gray-300/10 mt-4">
    <Input
      placeholder="Assignment name"
      value={value.name}
      onChange={e => onChange("name", e.target.value)}
      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
    />
    <div className="grid grid-cols-3 gap-2">
      <Input
        placeholder="Score"
        type="number"
        value={value.score}
        onChange={e => onChange("score", e.target.value)}
        className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
      />
      <Input
        placeholder="Max Score"
        type="number"
        value={value.maxScore}
        onChange={e => onChange("maxScore", e.target.value)}
        className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
      />
      <Input
        placeholder="Weight %"
        type="number"
        value={value.weight}
        onChange={e => onChange("weight", e.target.value)}
        className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
      />
    </div>
    <Button onClick={onAdd} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
      <Plus size={20} className="mr-2" />
      Add Assignment
    </Button>
  </div>
);

export default AssignmentDraft;
