
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/FlashcardStudy";

interface FlashcardExportImportProps {
  flashcards: Flashcard[];
  onImport: (cards: Flashcard[]) => void;
}

const FlashcardExportImport: React.FC<FlashcardExportImportProps> = ({ flashcards, onImport }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Export as JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flashcards_backup.json";
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
        // Minimal type check
        const cards = imported.filter(
          (fc) =>
            fc &&
            typeof fc.front === "string" &&
            typeof fc.back === "string" &&
            typeof fc.id === "string" &&
            typeof fc.nextReview === "string" &&
            fc.state
        );
        onImport(cards);
      } catch {
        alert("Failed to import flashcards (invalid JSON or format).");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2 mt-3">
      <Button variant="outline" onClick={handleExport}>
        Export Flashcards
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
        Import Flashcards
      </Button>
    </div>
  );
};

export default FlashcardExportImport;
