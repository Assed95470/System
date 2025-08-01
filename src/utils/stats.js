export const statsList = ['Force','Endurance','Intelligence','Beauté','Santé','Spiritualité','Compétences Tech','Argent','Famille'];

export const xpThresholds = {
  1: 0, 2: 100, 3: 250, 4: 500, 5: 1000, 6: 1750, 7: 2500, 8: 3500, 9: 4750, 10: 6250,
  11: 8000, 12: 10000, 13: 12500, 14: 15250, 15: 18250,
  16: 21500, 17: 25000, 18: 28750, 19: 32750, 20: 37000,
  21: 41500, 22: 46250, 23: 51250, 24: 56500, 25: 62000,
  26: 67750, 27: 73750, 28: 80000, 29: 86500, 30: 93250,
  31: 100250, 32: 107500, 33: 115000, 34: 122750, 35: 130750,
  36: 139000, 37: 147500, 38: 156250, 39: 165250, 40: 174500,
  41: 184000, 42: 193750, 43: 203750, 44: 214000, 45: 224500,
  46: 235250, 47: 246250, 48: 257500, 49: 269000, 50: 280750,
  51: 292750, 52: 305000, 53: 317500, 54: 330250, 55: 343250,
  56: 356500, 57: 370000, 58: 383750, 59: 397750, 60: 412000,
  61: 426500, 62: 441250, 63: 456250, 64: 471500, 65: 487000,
  66: 502750, 67: 518750, 68: 535000, 69: 551500, 70: 568250,
  71: 585250, 72: 602500, 73: 620000, 74: 637750, 75: 655750,
  76: 674000, 77: 692500, 78: 711250, 79: 730250, 80: 749500,
  81: 769000, 82: 788750, 83: 808750, 84: 829000, 85: 849500,
  86: 870250, 87: 891250, 88: 912500, 89: 934000, 90: 955750,
  91: 977750, 92: 1000000, 93: 1022500, 94: 1045000, 95: 1068000,
  96: 1091500, 97: 1115500, 98: 1140000, 99: 1165000, 100: 1190500
};

export const getStatLevel = (xp) => {
  if (xp <= 0) return 1;
  let level = 1;
  for (const lvl in xpThresholds) {
    if (xp >= xpThresholds[lvl]) {
      level = parseInt(lvl, 10);
    } else {
      break;
    }
  }
  return level;
};

export const levelTitles = [
  { level: 2, title: 'Humain ordinaire' },
  { level: 4, title: 'Sensitif spirituel' },
  { level: 6, title: 'Shinigami débutant' },
  { level: 8, title: 'Shinigami confirmé' },
  { level: 10, title: 'Apprenti du Shikai' },
  { level: 12, title: 'Manieur du Shikai' },
  { level: 14, title: 'Vice-Capitaine' },
  { level: 16, title: 'Maître du Kido' },
  { level: 18, title: 'Manieur du Bankai' },
  { level: 20, title: 'Capitaine du Gotei 13' },
  { level: 22, title: 'Capitaine d’élite' },
  { level: 24, title: 'Capitaine-Commandant' },
  { level: 26, title: 'Arrancar' },
  { level: 28, title: 'Arrancar confirmé' },
  { level: 30, title: 'Vasto Lorde' },
  { level: 32, title: 'Espada inférieur' },
  { level: 34, title: 'Espada moyen' },
  { level: 36, title: 'Espada supérieur' },
  { level: 38, title: 'Espada Primera' },
  { level: 40, title: 'Vizard' },
  { level: 42, title: 'Vizard confirmé' },
  { level: 44, title: 'Transcendant fusionné au Hōgyoku' },
  { level: 46, title: 'Être en métamorphose spirituelle' },
  { level: 48, title: 'Forme chrysalis' },
  { level: 50, title: 'Forme ultime instable' },
  { level: 52, title: 'Dangai User' },
  { level: 54, title: 'Forme Mugetsu' },
  { level: 56, title: 'Quincy confirmé' },
  { level: 58, title: 'Sternritter' },
  { level: 60, title: 'Sternritter élite' },
  { level: 62, title: 'Schutzstaffel' },
  { level: 64, title: 'Haut gradé du Wandenreich' },
  { level: 66, title: 'Souverain Quincy' },
  { level: 68, title: 'Membre de la Division 0' },
  { level: 70, title: 'Officier supérieur de la Division 0' },
  { level: 72, title: 'Stratège du Reiōkyū' },
  { level: 74, title: 'Maître du Reiatsu' },
  { level: 76, title: 'Hybride complet' },
  { level: 78, title: "Porteur d'équilibre" },
  { level: 80, title: 'Gardien du cycle spirituel' },
  { level: 82, title: 'Harmonisateur du flux' },
  { level: 84, title: 'Émissaire royal' },
  { level: 86, title: 'Autorité spirituelle suprême' },
  { level: 88, title: 'Manifestation du Getsuga' },
  { level: 90, title: 'Main du trône' },
  { level: 92, title: 'Sentinelle des mondes' },
  { level: 94, title: 'Pilier du Seireitei' },
  { level: 96, title: 'Maître des trois natures' },
  { level: 98, title: 'Esprit purifié' },
  { level: 100, title: 'Reiō (Roi Spirituel)' }
];

export const getTitleByLevel = level => {
  for (let i = level; i >= 1; i--) {
    const entry = levelTitles.find(e => e.level === i);
    if (entry) return entry.title;
  }
  return '';
};