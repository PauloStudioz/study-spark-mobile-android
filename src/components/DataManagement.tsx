
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useGamification } from "@/contexts/GamificationContext";

// Storage keys
const NOTIF_LS_KEY = "studymate-notification-prefs";
const DISPLAY_LS_KEY = "studymate-display-prefs";
const QUIZZES_LS_KEY = "studymate-quizzes";
const FLASHCARDS_LS_KEY = "studymate-flashcards";

function exportData() {
  const notif = localStorage.getItem(NOTIF_LS_KEY);
  const display = localStorage.getItem(DISPLAY_LS_KEY);
  const quizzes = localStorage.getItem(QUIZZES_LS_KEY);
  const flashcards = localStorage.getItem(FLASHCARDS_LS_KEY);

  const data = {
    notificationPrefs: notif ? JSON.parse(notif) : {},
    displayPrefs: display ? JSON.parse(display) : {},
    quizzes: quizzes ? JSON.parse(quizzes) : [],
    flashcards: flashcards ? JSON.parse(flashcards) : [],
    // Add other relevant data as needed
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "studymate-pro-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
        if (data.notificationPrefs) localStorage.setItem(NOTIF_LS_KEY, JSON.stringify(data.notificationPrefs));
        if (data.displayPrefs) localStorage.setItem(DISPLAY_LS_KEY, JSON.stringify(data.displayPrefs));
        if (Array.isArray(data.quizzes)) localStorage.setItem(QUIZZES_LS_KEY, JSON.stringify(data.quizzes));
        if (Array.isArray(data.flashcards)) localStorage.setItem(FLASHCARDS_LS_KEY, JSON.stringify(data.flashcards));
        // add more as needed
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
          Backup and restore your data<br />
          <span className="font-semibold">Note: Quizzes and flashcards are included in export/import!</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={exportData} variant="outline" className="w-full">
          <Download className="mr-2" size={16} />
          Export Data (including Quizzes & Flashcards)
        </Button>
        <Button onClick={importData} variant="outline" className="w-full">
          <Upload className="mr-2" size={16} />
          Import Data (including Quizzes & Flashcards)
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataManagement;

