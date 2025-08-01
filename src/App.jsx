import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import QuestManager from "./QuestManager";
import QuestsErrors from "./QuestsErrors";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { Toaster, toast } from 'react-hot-toast';
import useMobileViewport from './hooks/useMobileViewport'; // <-- 1. IMPORTER LE HOOK

export default function App() {
  useMobileViewport(); // <-- 2. APPELER LE HOOK

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Pour savoir quand les données sont prêtes

  // L'état initial est vide, il sera rempli par Firebase
  const [stats, setStats] = useState({});
  const [quests, setQuests] = useState({ quotidienne: [], secondaire: [], principale: [] });
  const [errors, setErrors] = useState([]);
  const [validatedHistory, setValidatedHistory] = useState([]);
  const [profilePicUrl, setProfilePicUrl] = useState(null); // <-- AJOUTER CETTE LIGNE

  // ID unique pour les données de l'utilisateur. Pour l'instant, il est fixe.
  const userDocId = "mainUserData";

  // Ce hook se connecte à Firebase et écoute les changements en temps réel
  useEffect(() => {
    const docRef = doc(db, "userData", userDocId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(data.stats || {});
        setQuests(data.quests || { quotidienne: [], secondaire: [], principale: [] });
        setErrors(data.errors || []);
        setValidatedHistory(data.validatedHistory || []);
        setProfilePicUrl(data.profilePicUrl || null); // <-- AJOUTER CETTE LIGNE
      } else {
        // Si le document n'existe pas, on peut le créer avec des valeurs par défaut
        console.log("Aucune donnée trouvée, initialisation avec des valeurs par défaut.");
      }
      setIsDataLoaded(true); // Marquer que les données sont chargées
    });

    // Nettoyer l'écouteur quand le composant est démonté
    return () => unsubscribe();
  }, []); // Le tableau vide [] assure que cet effet ne s'exécute qu'une fois

  // Ce hook sauvegarde les données dans Firebase à chaque modification
  useEffect(() => {
    // Ne pas sauvegarder si les données initiales ne sont pas encore chargées
    if (!isDataLoaded) return;

    const saveData = async () => {
      const docRef = doc(db, "userData", userDocId);
      const payload = { stats, quests, errors, validatedHistory, profilePicUrl }; // <-- MODIFIER CETTE LIGNE
      try {
        await setDoc(docRef, payload, { merge: true }); // merge: true pour ne pas écraser les champs non modifiés
      } catch (error) {
        console.error("Erreur de sauvegarde sur Firebase:", error);
        toast.error("Erreur de synchronisation.");
      }
    };

    saveData();
  }, [stats, quests, errors, validatedHistory, profilePicUrl, isDataLoaded]); // <-- MODIFIER CETTE LIGNE


  // --- Fonctions d'import/export (restent les mêmes mais agissent sur l'état actuel) ---
  const handleExport = () => {
    const dataToExport = {
      stats,
      quests,
      errors,
      validatedHistory,
      profilePicUrl, // <-- AJOUTER CETTE LIGNE
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
            setProfilePicUrl(importedData.profilePicUrl || null); // <-- AJOUTER CETTE LIGNE
            toast.success('Données importées avec succès ! La synchronisation va suivre.');
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

  // --- NOUVELLE FONCTION POUR VIDER LES DONNÉES ---
  const handleClearData = () => {
    // Remet tous les états à leurs valeurs par défaut
    setStats({});
    setQuests({ quotidienne: [], secondaire: [], principale: [] });
    setErrors([]);
    setValidatedHistory([]);
    setProfilePicUrl(null);
    toast.success('Toutes les données ont été réinitialisées.');
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
        onClearData={handleClearData} // On passe la fonction ici
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Routes>
        <Route
          path="/"
          element={
            <QuestManager
              stats={stats}
              profilePicUrl={profilePicUrl}
              setProfilePicUrl={setProfilePicUrl}
              userDocId={userDocId}
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
