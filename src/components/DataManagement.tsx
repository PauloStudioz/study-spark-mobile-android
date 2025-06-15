
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useGamification } from "@/contexts/GamificationContext";

const NOTIF_LS_KEY = "studymate-notification-prefs";
const DISPLAY_LS_KEY = "studymate-display-prefs";

function exportData() {
  const notif = localStorage.getItem(NOTIF_LS_KEY);
  const display = localStorage.getItem(DISPLAY_LS_KEY);
  // Add other relevant data as needed
  const data = {
    notificationPrefs: notif ? JSON.parse(notif) : {},
    displayPrefs: display ? JSON.parse(display) : {},
    // add more as needed
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
        // add more as needed
        window.location.reload(); // reload to apply imported settings
      } catch (err) {
        alert("Failed to import data.");
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
          Backup and restore your data
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={exportData} variant="outline" className="w-full">
          <Download className="mr-2" size={16} />
          Export Data
        </Button>
        <Button onClick={importData} variant="outline" className="w-full">
          <Upload className="mr-2" size={16} />
          Import Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataManagement;

