import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../img/Photoroom_20250731_161505.png'; // Assurez-vous que ce nom de fichier est exact
import settingsIcon from '../img/icons8-réglage-48 (3).png';

export default function Navbar({ onOpenSidebar, onImport = ()=>{}, onExport = ()=>{}, onClearData = ()=>{} }) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // État pour la confirmation

  const buttonStyle = {
    background: "none",
    border: "none",
    color: "#aaa",
    fontSize: 24,
    cursor: "pointer",
    padding: 8,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s, background-color 0.2s'
  };

  const buttonHoverStyle = {
    color: "#00BFFF",
    backgroundColor: 'rgba(0, 191, 255, 0.1)'
  };

  // Styles pour les boutons du menu déroulant
  const settingsButtonStyle = {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'transparent', // On utilise backgroundColor avec 'transparent'
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#EAEAEA',
    borderRadius: '6px',
    transition: 'background-color 0.2s, color 0.2s'
  };

  const settingsButtonHoverStyle = {
    backgroundColor: '#00BFFF',
    color: '#1f1f1f'
  };

  return (
    <nav style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // On garde cette propriété pour espacer les 3 blocs
      background: "#1f1f1f",
      color: "#EAEAEA",
      padding: "8px 24px",
      borderBottom: '1px solid #2a2a2a'
    }}>
      {/* --- Section Gauche --- */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
        <button
          style={buttonStyle}
          onMouseEnter={e => e.currentTarget.style.color = buttonHoverStyle.color}
          onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
          onClick={onOpenSidebar}
          title="Menu"
        >☰</button>
        {/* Le logo est maintenant une image */}
        <img 
          src={logo}
          alt="Logo"
          style={{ height: '36px', cursor: 'pointer' }}
          onClick={() => navigate("/")}
        />
      </div>

      {/* --- Titre Central --- */}
      <div 
        style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
        onClick={() => navigate("/")}
      >
        <h2 style={{
          fontFamily: "'ZCOOL XiaoWei', serif",
          margin: 0,
          fontSize: '2.2rem',
          fontWeight: 'normal',
          userSelect: 'none', // Empêche la sélection du texte
          // Application du dégradé
          background: 'linear-gradient(90deg, #1E90FF, #00BFFF)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          System
        </h2>
      </div>

      {/* --- Section Droite --- */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          style={buttonStyle}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => setShowSettings(v => !v)}
          title="Réglages"
        >
          <img src={settingsIcon} alt="Réglages" style={{ width: 28, height: 28 }} />
        </button>
        {showSettings && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 24,
            background: "#1f1f1f",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            padding: 8,
            zIndex: 1000,
            width: 180
          }}>
            <button
              onClick={() => { onImport(); setShowSettings(false); }}
              style={settingsButtonStyle}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = settingsButtonHoverStyle.backgroundColor;
                e.currentTarget.style.color = settingsButtonHoverStyle.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = settingsButtonStyle.backgroundColor;
                e.currentTarget.style.color = settingsButtonStyle.color;
              }}
            >
              Importer JSON
            </button>
            <button
              onClick={() => { onExport(); setShowSettings(false); }}
              style={settingsButtonStyle}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = settingsButtonHoverStyle.backgroundColor;
                e.currentTarget.style.color = settingsButtonHoverStyle.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = settingsButtonStyle.backgroundColor;
                e.currentTarget.style.color = settingsButtonStyle.color;
              }}
            >
              Exporter JSON
            </button>
            {/* --- NOUVEAU BOUTON --- */}
            <button
              onClick={() => {
                setShowConfirmDialog(true); // Ouvre la confirmation
                setShowSettings(false); // Ferme le menu
              }}
              style={settingsButtonStyle}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#c0392b'; // Rouge pour danger
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = settingsButtonStyle.backgroundColor;
                e.currentTarget.style.color = settingsButtonStyle.color;
              }}
            >
              Vider les données
            </button>
          </div>
        )}
      </div>

      {/* --- NOUVELLE BOÎTE DE DIALOGUE DE CONFIRMATION --- */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#1f1f1f',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #2a2a2a',
            textAlign: 'center',
            maxWidth: '90%',
            width: '350px'
          }}>
            <h3 style={{ marginTop: 0, color: '#EAEAEA' }}>Êtes-vous sûr ?</h3>
            <p style={{ color: '#aaa', marginBottom: '24px' }}>
              Toutes vos données (stats, quêtes, etc.) seront définitivement supprimées. Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{ ...settingsButtonStyle, flex: 1, textAlign: 'center', backgroundColor: '#2a2a2a' }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onClearData();
                  setShowConfirmDialog(false);
                }}
                style={{ ...settingsButtonStyle, flex: 1, textAlign: 'center', backgroundColor: '#c0392b', color: '#fff' }}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}