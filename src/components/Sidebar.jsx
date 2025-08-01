import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  const linkStyle = {
    display: 'block',
    width: '100%',
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    color: '#EAEAEA',
    textAlign: 'left',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background-color 0.2s, color 0.2s'
  };

  return (
    <>
      {/* Fond semi-transparent qui ferme le menu au clic */}
      <div 
        onClick={onClose}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 999
        }}
      />
      <div style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: 250,
        background: "rgba(31, 31, 31, 0.85)", // Fond semi-transparent
        backdropFilter: "blur(10px)", // Effet de flou
        color: "#EAEAEA",
        zIndex: 1000,
        padding: "24px",
        borderRight: "1px solid #2a2a2a"
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32}}>
          <h3 style={{fontFamily: "'ZCOOL XiaoWei', serif", margin: 0}}>Menu</h3>
          <button style={{ background: "none", border: "none", color: "#aaa", fontSize: 24, cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><button style={linkStyle} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 191, 255, 0.1)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => { navigate("/"); onClose(); }}>Accueil</button></li>
          <li><button style={linkStyle} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 191, 255, 0.1)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => { navigate("/quests-errors"); onClose(); }}>Quêtes & Erreurs</button></li>
          <li><button style={linkStyle} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 191, 255, 0.1)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => { navigate("/analytics"); onClose(); }}>Analytics</button></li>
        </ul>
      </div>
    </>
  );
}