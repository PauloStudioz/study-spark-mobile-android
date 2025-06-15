
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Export all localStorage items starting with studymate-
function exportData() {
  const exportObj: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("studymate-")) {
      try {
        const value = localStorage.getItem(key);
        exportObj[key] = value === null ? null : JSON.parse(value);
      } catch {
        // fallback as string if not JSON
        exportObj[key] = localStorage.getItem(key);
      }
    }
  }
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
  const date = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `studymate-full-backup-${date}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Import: restore everything to localStorage
function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev: any) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (typeof data !== "object" || Array.isArray(data) || !data) {
          alert("Invalid backup format.");
          return;
        }
        // Clear current studymate- data?
        // Optionally, we could clear keys, but it's safer to overwrite only those present in file.
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith("studymate-")) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });
        window.location.reload(); // reload to apply imported settings
      } catch (err) {
        alert("Failed to import data. Make sure you selected a valid backup .json file.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

const DataManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <Card className={`shadow-lg border-0 ${isDarkMode ? "bg-gray-800" : ""}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Data Management</CardTitle>
        <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          Backup and restore <span className="font-semibold">all</span> your StudyMate Pro data.<br />
          <span className="font-semibold">
            <span className="underline">All settings, quizzes, flashcards, XP, decks, and preferences are included!</span>
          </span>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={exportData} variant="outline" className="w-full">
          <Download className="mr-2" size={16} />
          Export <span className="font-bold">ALL DATA</span>
        </Button>
        <Button onClick={importData} variant="outline" className="w-full">
          <Upload className="mr-2" size={16} />
          Import <span className="font-bold">ALL DATA</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataManagement;

