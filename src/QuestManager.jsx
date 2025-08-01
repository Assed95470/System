import React, { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { statsList, xpThresholds, getStatLevel, getTitleByLevel } from "./utils/stats";
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

// --- NOUVEAUX COMPOSANTS STYLISÉS ---

const Card = ({ children, style, isMobile }) => (
  <div style={{
    background: '#1f1f1f',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '24px',
    margin: '16px 0',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
    border: '1px solid #2a2a2a',
    ...style
  }}>
    {children}
  </div>
);

const Progress = ({ value }) => (
  <div style={{ background: '#333', width: '100%', height: 8, borderRadius: 4, overflow: 'hidden' }}>
    <div style={{ 
      width: `${value * 100}%`, 
      background: 'linear-gradient(90deg, #9400D3, #00BFFF)', // Dégradé appliqué ici
      height: '100%', 
      transition: 'width 0.5s ease-in-out' 
    }} />
  </div>
);

// --- Fonctions utilitaires (à garder en haut du fichier) ---
const formatStatXp = (value) => {
  if (value >= 100000) {
    return `${Math.round(value / 1000)}k`;
  }
  return value.toLocaleString();
};

// petit composant pour positionner le point actif exactement au coord. du dataPoint
const CustomActiveDot = ({ cx, cy }) => (
  <circle cx={cx} cy={cy} r={6} fill="#8884d8" />
);

// --- Tooltip Corrigé et Stylisé ---
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#1f1f1f',
        border: '1px solid #444',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ margin: 0, fontWeight: "bold", color: '#EAEAEA' }}>{data.subject}</p>
        <p style={{ margin: 0, color: '#00BFFF' }}>
          Niveau : {Math.floor(data.value)}
        </p>
      </div>
    );
  }
  return null;
};


export default function QuestManager({
  name = "Ꞩ",
  stats = {},
  profilePicUrl,
  setProfilePicUrl,
  userDocId,
  style = {}
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isLoadingPic, setIsLoadingPic] = useState(false);

  // --- Fonction pour gérer le changement de la photo ---
  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoadingPic(true);
    const toastId = toast.loading('Téléchargement de l\'image...');

    const storageRef = ref(storage, `profile-pictures/${userDocId}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfilePicUrl(downloadURL);

      toast.success('Photo de profil mise à jour !', { id: toastId });
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      toast.error("Échec du téléchargement.", { id: toastId });
    } finally {
      setIsLoadingPic(false);
    }
  };

  // --- Logique de calcul ---
  const statLevels = statsList.map(s => getStatLevel(stats[s] || 0));
  
  // 1. On calcule la moyenne des niveaux (ex: 27.65)
  const avgLevel = statLevels.reduce((a, b) => a + b, 0) / statLevels.length;
  
  // 2. Le niveau général est la partie entière (ex: 27)
  const generalLevel = Math.floor(avgLevel);
  const generalTitle = getTitleByLevel(generalLevel);

  // 3. La progression est la partie décimale (ex: 0.65, soit 65%)
  const generalProgress = avgLevel % 1;

  // --- Logique pour le Radar et Strengths/Weaknesses (inchangée) ---
  const maxLevel = Math.max(...statLevels, 1);
  const radarData = statsList.map((statName, index) => ({
    subject: statName,
    value: statLevels[index], // Correction : on accède à l'index correctement
  }));
  const sortedStats = statsList
    .map(s => [s, stats[s] || 0])
    .sort((a, b) => b[1] - a[1]);
  const strengths = sortedStats.slice(0, 2).map(([s]) => s);
  const weaknesses = sortedStats.slice(-2).map(([s]) => s);

  return (
    <div style={{ padding: isMobile ? '3px 16px' : '3px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{
        // On supprime la ligne fontFamily: "'ZCOOL XiaoWei', serif",
        textAlign: "center",
        marginBottom: '16px', // Marge réduite pour resserrer l'espace
        fontSize: isMobile ? '2rem' : '2.8rem',
        fontWeight: 'normal',
        color: '#EAEAEA' // Changé en blanc pur
      }}>
        {name}
      </h1>

      <Card isMobile={isMobile}>
        {/* --- Section Photo de Profil --- */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <input
            type="file"
            id="profilePicInput"
            accept="image/*"
            style={{ display: 'none' }} // On cache l'input moche
            onChange={handleProfilePicChange}
          />
          {/* Ce label est cliquable et active l'input caché */}
          <label htmlFor="profilePicInput" style={{ cursor: 'pointer' }}>
            {isLoadingPic ? (
              <div style={{ width: isMobile ? 100 : 120, height: isMobile ? 100 : 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Simple spinner ou texte */}
                <p>Chargement...</p>
              </div>
            ) : profilePicUrl ? (
              // --- NOUVEAU CONTENEUR POUR LE DÉGRADÉ ---
              <div style={{
                padding: '3px', // Simule l'épaisseur de la bordure
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #9400D3, #00BFFF)',
                display: 'inline-block' // Pour que la div s'adapte à l'image
              }}>
                <img 
                  src={profilePicUrl} 
                  alt="Profile" 
                  style={{ 
                    width: isMobile ? 100 : 120, 
                    height: isMobile ? 100 : 120, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    display: 'block', // Pour éviter les espaces indésirables
                    border: '2px solid #1f1f1f' // Bordure intérieure pour séparer l'image du dégradé
                  }} 
                />
              </div>
            ) : (
              // L'icône par défaut reste inchangée
              <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 100 : 120} height={isMobile ? 100 : 120} fill="none" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <path fill="#ccc" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </label>
        </div>

        {/* --- Section Niveau Général (Améliorée) --- */}
        <div style={{ marginBottom: '28px' }}>
          {/* Remplacement du <p> par un div flexbox pour un meilleur contrôle */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            fontSize: isMobile ? '1rem' : '1.25rem',
            fontWeight: 'bold',
            margin: '0 0 12px 0',
          }}>
            <span style={{ color: '#EAEAEA' }}>Level {generalLevel} •&nbsp;</span>
            <span style={{
              // Application du dégradé au titre du niveau
              background: 'linear-gradient(90deg, #1E90FF, #00BFFF)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>{generalTitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Progress value={generalProgress} />
            <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#888', whiteSpace: 'nowrap' }}>
              {Math.round(generalProgress * 100)}%
            </span>
          </div>
        </div>

        {/* --- Liste des Stats (Améliorée) --- */}
        <div style={{ marginBottom: '20px' }}>
          {statsList.map((s, index) => {
            const xp = stats[s] || 0;
            const lvl = getStatLevel(xp);
            const nextThreshold = xpThresholds[lvl + 1];

            return (
              <div key={s} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: isMobile ? '10px 0' : '14px 0',
                borderBottom: index < statsList.length - 1 ? '1px solid #2a2a2a' : 'none'
              }}>
                <span style={{ color: '#EAEAEA', fontSize: isMobile ? '0.9rem' : '1rem' }}>{s}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: isMobile ? '12px' : '16px' }}>
                  <span style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#888', whiteSpace: 'nowrap' }}>
                    {formatStatXp(xp)} / {nextThreshold ? formatStatXp(nextThreshold) : 'MAX'}
                  </span>
                  {/* On applique tous les styles à une seule div pour plus de robustesse */}
                  <div style={{
                    width: '60px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    background: 'linear-gradient(90deg, #0052D4, #00BFFF)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}>
                    LV {lvl}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Strengths & Weaknesses (Nouveau Design) --- */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingTop: '20px',
          marginTop: '20px',
          borderTop: '1px solid #2a2a2a',
          flexDirection: 'row', // Toujours en ligne
          gap: '20px'
        }}>
          {/* Colonne des Points Forts */}
          <div style={{ textAlign: 'center' }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #0052D4, #00BFFF)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              Strengths
            </h4>
            <div>
              {strengths.map(stat => (
                <p key={stat} style={{ margin: '4px 0', color: '#EAEAEA', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {stat}
                </p>
              ))}
            </div>
          </div>

          {/* Colonne des Points Faibles */}
          <div style={{ textAlign: 'center' }}>
            <h4 style={{
              margin: '0 0 8px 0',
              color: '#888', // Couleur neutre/sombre
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Weaknesses
            </h4>
            <div>
              {weaknesses.map(stat => (
                <p key={stat} style={{ margin: '4px 0', color: '#EAEAEA', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {stat}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* --- Titre pour la carte Radar --- */}
      <h3 style={{
        fontFamily: "'ZCOOL XiaoWei', serif",
        textAlign: 'center',
        margin: '32px 0 8px 0',
        color: '#EAEAEA',
        fontSize: '1.5rem'
      }}>
        Reiatsu Radar
      </h3>

      {/* --- CARTE RADAR (Améliorée) --- */}
      <Card isMobile={isMobile}>
        <div style={{ width: '100%', height: isMobile ? 300 : 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="80%">
              <PolarGrid gridType="polygon" stroke="#444" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: "#aaa", fontSize: isMobile ? 11 : 13 }} // Labels plus lisibles
              />
              <PolarRadiusAxis domain={[0, maxLevel]} axisLine={false} tick={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00BFFF', strokeWidth: 1 }} />
              <Radar dataKey="value" stroke="#00BFFF" fill="#00BFFF" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
