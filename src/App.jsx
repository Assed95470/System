import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import QuestManager from "./QuestManager";
import QuestsErrors from "./QuestsErrors";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { Toaster, toast } from 'react-hot-toast';

// --- Fonctions pour la persistance des données ---
const saveDataToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('questAppData', serializedState);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données :", error);
  }
};

const loadDataFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('questAppData');
    if (serializedState === null) {
      return undefined; // Aucune donnée sauvegardée
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
    return undefined;
  }
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const persistedData = loadDataFromLocalStorage();

  // L'état reste centralisé ici, mais est initialisé avec les données du localStorage
  const [stats, setStats] = useState(persistedData?.stats || {
    Force: 0,
    Endurance: 0,
    Intelligence: 0,
    Beauté: 0,
    Santé: 0,
    Spiritualité: 0,
    "Compétences Tech": 0,
    Argent: 0,
    Famille: 0,
  });
  const [quests, setQuests] = useState(persistedData?.quests || {
    quotidienne: [],
    secondaire: [],
    principale: [],
  });
  const [errors, setErrors] = useState(persistedData?.errors || []);
  const [validatedHistory, setValidatedHistory] = useState(persistedData?.validatedHistory || []);

  // Hook qui sauvegarde l'état dans le localStorage à chaque modification
  useEffect(() => {
    const currentState = { stats, quests, errors, validatedHistory };
    saveDataToLocalStorage(currentState);
  }, [stats, quests, errors, validatedHistory]);


  // --- Fonctions d'import/export ---
  const handleExport = () => {
    const dataToExport = {
      stats,
      quests,
      errors,
      validatedHistory,
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quest-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Données exportées avec succès !');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            // On met à jour chaque état avec les données importées ou des valeurs par défaut
            setStats(importedData.stats || {});
            setQuests(importedData.quests || { quotidienne: [], secondaire: [], principale: [] });
            setErrors(importedData.errors || []);
            setValidatedHistory(importedData.validatedHistory || []);
            toast.success('Données importées avec succès !');
          } catch (error) {
            console.error("Erreur lors de l'importation du fichier JSON:", error);
            toast.error("Le fichier sélectionné n'est pas un JSON valide.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // On retire la balise <Router> qui enveloppait le tout
  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#2a2a2a',
            color: '#EAEAEA',
            border: '1px solid #444',
          },
        }}
      />
      <Navbar
        onOpenSidebar={() => setSidebarOpen(true)}
        onImport={handleImport}
        onExport={handleExport}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Routes>
        <Route
          path="/"
          element={
            <QuestManager
              stats={stats}
              quests={quests}
              errors={errors}
              validatedHistory={validatedHistory}
            />
          }
        />
        <Route
          path="/quests-errors"
          element={
            <QuestsErrors
              stats={stats}
              quests={quests}
              errors={errors}
              validatedHistory={validatedHistory}
              setStats={setStats}
              setQuests={setQuests}
              setErrors={setErrors}
              setValidatedHistory={setValidatedHistory}
            />
          }
        />
        {/* On réactive la route pour la page Analytics */}
        <Route
          path="/analytics"
          element={
            <AnalyticsDashboard
              stats={stats}
              quests={quests}
              errors={errors}
              validatedHistory={validatedHistory}
            />
          }
        />
      </Routes>
    </>
  );
}
