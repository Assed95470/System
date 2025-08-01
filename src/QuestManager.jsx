import React, { useState, useEffect, useCallback } from "react"; // Modifiez cette ligne
import Cropper from 'react-easy-crop'; // Ajoutez cette ligne
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

// --- FONCTION UTILITAIRE POUR RECADRER L'IMAGE ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
}


// --- DÉFINITION DES COMPOSANTS (GARDER CEUX-CI) ---
const Card = ({ children, style, isMobile }) => (
  <div style={{
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 12,
    padding: isMobile ? '16px' : '20px 24px',
    color: '#EAEAEA',
    ...style
  }}>
    {children}
  </div>
);

const Progress = ({ value }) => (
  <div style={{
    flex: 1,
    height: '8px',
    backgroundColor: '#2a2a2a',
    borderRadius: '4px',
    overflow: 'hidden'
  }}>
    <div style={{
      width: `${value * 100}%`,
      height: '100%',
      background: 'linear-gradient(90deg, #1E90FF, #00BFFF)',
      transition: 'width 0.5s ease-in-out'
    }} />
  </div>
);

const formatStatXp = (xp) => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(31, 31, 31, 0.9)',
        border: '1px solid #444',
        padding: '8px 12px',
        borderRadius: '8px',
        color: '#EAEAEA'
      }}>
        <p style={{ margin: 0 }}>{`${payload[0].payload.subject}: LV ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};


// --- LE NOUVEAU SYMBOLE SVG DE HAUTE QUALITÉ ---
const TitleIcon = ({ size = '3.2rem', isMobile }) => {
  const iconSize = isMobile ? '2.5rem' : size;
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle' }}
    >
      <text
        x="50%"
        y="50%"
        dy="0.35em"
        textAnchor="middle"
        fill="#EAEAEA"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '90px',
          fontWeight: 600, // Police légèrement affinée
        }}
      >
        S
      </text>
      {/* Barre diagonale de bas-gauche à haut-droite, fine et courte */}
      <line
        x1="35" y1="55" x2="65" y2="45" 
        stroke="#EAEAEA"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};


export default function QuestManager({
  name = "Ꞩ", // Ce n'est plus utilisé pour le titre
  stats = {},
  profilePicUrl,
  setProfilePicUrl,
  userDocId,
  style = {}
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isLoadingPic, setIsLoadingPic] = useState(false);

  // --- NOUVEAUX ÉTATS ET LOGIQUE POUR L'ÉDITEUR D'IMAGE ---
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result);
      });
      reader.addEventListener('error', (e) => {
        // Optionnellement gérer l'erreur
      });
      reader.readAsDataURL(event.target.files[0]);
      event.target.value = ""; // Important pour iOS
    }
  };

  const handleUploadCroppedImage = async () => {
    if (!croppedAreaPixels || !imageToCrop) return;

    setIsLoadingPic(true);
    setImageToCrop(null); // Ferme la modale
    const toastId = toast.loading('Téléchargement de l\'image...');

    try {
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const storageRef = ref(storage, `profile-pictures/${userDocId}`);
      
      await uploadBytes(storageRef, croppedImageBlob);
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

  const statLevels = statsList.map(s => getStatLevel(stats[s] || 0));
  const avgLevel = statLevels.reduce((a, b) => a + b, 0) / statLevels.length;
  const generalLevel = Math.floor(avgLevel);
  const generalTitle = getTitleByLevel(generalLevel);
  const generalProgress = avgLevel % 1;

  const maxLevel = Math.max(...statLevels, 1);
  const radarData = statsList.map((statName, index) => ({
    subject: statName,
    value: statLevels[index],
  }));
  const sortedStats = statsList
    .map(s => [s, stats[s] || 0])
    .sort((a, b) => b[1] - a[1]);
  const strengths = sortedStats.slice(0, 2).map(([s]) => s);
  const weaknesses = sortedStats.slice(-2).map(([s]) => s);

  return (
    <>
      {/* --- MODALE DE RECADRAGE --- */}
      {imageToCrop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: 'calc(var(--vh, 1vh) * 100)',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <Cropper
            image={imageToCrop}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                flex: 1,
                minHeight: 0,
                position: 'relative'
              }
            }}
          />
          <div style={{
            flexShrink: 0,
            paddingTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', width: '250px' }}>
              <span>Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1} max={3} step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setImageToCrop(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #555', background: '#333', color: 'white' }}>Annuler</button>
              <button onClick={handleUploadCroppedImage} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#007BFF', color: 'white' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: isMobile ? '3px 16px' : '3px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          textAlign: "center",
          marginBottom: '16px',
          marginTop: '16px', // Espace ajouté au-dessus de l'icône
        }}>
          <TitleIcon isMobile={isMobile} />
        </div>

        <Card isMobile={isMobile}>
          {/* --- Section Photo de Profil --- */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <input
              type="file"
              id="profilePicInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <label htmlFor="profilePicInput" style={{ cursor: 'pointer' }}>
              {isLoadingPic ? (
                <div style={{ width: isMobile ? 100 : 120, height: isMobile ? 100 : 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p>Chargement...</p>
                </div>
              ) : profilePicUrl ? (
                <div style={{
                  padding: '3px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #9400D3, #00BFFF)',
                  display: 'inline-block'
                }}>
                  <img 
                    src={profilePicUrl} 
                    alt="Profile" 
                    style={{ 
                      width: isMobile ? 100 : 120, 
                      height: isMobile ? 100 : 120, 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      display: 'block',
                      border: '2px solid #1f1f1f'
                    }} 
                  />
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 100 : 120} height={isMobile ? 100 : 120} fill="none" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <path fill="#ccc" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </label>
          </div>

          <div style={{ marginBottom: '28px' }}>
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

          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            paddingTop: '20px',
            marginTop: '20px',
            borderTop: '1px solid #2a2a2a',
            flexDirection: 'row',
            gap: '20px'
          }}>
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

            <div style={{ textAlign: 'center' }}>
              <h4 style={{
                margin: '0 0 8px 0',
                color: '#888',
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

        <h3 style={{
          fontFamily: "'ZCOOL XiaoWei', serif",
          textAlign: 'center',
          margin: '32px 0 8px 0',
          color: '#EAEAEA',
          fontSize: '1.5rem'
        }}>
          Reiatsu Radar
        </h3>

        <Card isMobile={isMobile}>
          <div style={{ width: '100%', height: isMobile ? 300 : 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid gridType="polygon" stroke="#444" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: "#aaa", fontSize: isMobile ? 11 : 13 }}
                />
                <PolarRadiusAxis domain={[0, maxLevel]} axisLine={false} tick={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00BFFF', strokeWidth: 1 }} />
                <Radar dataKey="value" stroke="#00BFFF" fill="#00BFFF" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
};
