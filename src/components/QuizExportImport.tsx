
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

// Adjust these types to your app's quiz object structure
interface Quiz {
  id: string;
  title: string;
  questions: any[];
}

interface QuizExportImportProps {
  quizzes: Quiz[];
  onImport: (quizzes: Quiz[]) => void;
}

const QuizExportImport: React.FC<QuizExportImportProps> = ({ quizzes, onImport }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Export as JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(quizzes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quizzes_backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Import JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        onImport(imported);
      } catch {
        alert("Failed to import quizzes (invalid JSON or format).");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2 mt-3">
      <Button variant="outline" onClick={handleExport}>
        Export Quizzes
      </Button>
      <input
        type="file"
        ref={inputRef}
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        Import Quizzes
      </Button>
    </div>
  );
};

export default QuizExportImport;
