import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

// --- Custom Hook pour la détection de la taille de l'écran ---
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
};


// --- Composants UI Stylisés (inchangés) ---
const Card = ({ children, style }) => (
  <div style={{
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    padding: '20px 24px',
    marginBottom: 16,
    position: 'relative', // Ajouté pour le positionnement des icônes
    ...style
  }}>
    {children}
  </div>
);

const Button = ({ children, onClick, style, variant = 'default' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
  };

  const variantStyles = {
    validate: {
      background: '#2ecc71', // Vert vif
      color: 'white',
      boxShadow: isHovered ? '0 0 15px rgba(46, 204, 113, 0.6)' : 'none',
      transform: isHovered ? 'translateY(-2px)' : 'none',
    },
    modify: {
      background: '#59527a', // Violet/Bleu désaturé
      color: 'white',
      boxShadow: isHovered ? '0 0 12px rgba(89, 82, 122, 0.6)' : 'none',
      transform: isHovered ? 'translateY(-2px)' : 'none',
    },
    danger: {
      background: '#c0392b', // Rouge brique
      color: 'white',
      boxShadow: isHovered ? '0 0 15px rgba(192, 57, 43, 0.6)' : 'none',
      transform: isHovered ? 'translateY(-2px)' : 'none',
    },
    primary: {
      background: 'linear-gradient(90deg, #1E90FF, #00BFFF)',
      border: 'none',
      color: 'white',
    },
    secondary: {
      background: 'transparent',
      border: '1px solid #444',
      color: '#aaa',
    }
  };

  const finalStyle = { ...baseStyle, ...(variantStyles[variant] || {}), ...style };

  return (
    <button 
      onClick={onClick} 
      style={finalStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};

const Input = props => <input {...props} style={{ padding: 8, margin: '2px 0', background: '#1f1f1f', border: '1px solid #444', borderRadius: 4, color: '#EAEAEA', width: '100%', ...props.style }} />;
const Label = ({ children, style }) => <label style={{ display: 'block', marginBottom: 8, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', ...style }}>{children}</label>;
const Textarea = props => <textarea {...props} style={{ width: '100%', padding: 8, margin: '2px 0', background: '#1f1f1f', border: '1px solid #444', borderRadius: 4, color: '#EAEAEA', minHeight: 80, ...props.style }} />;

const StatBadge = ({ children, color = '#00BFFF', isMobile }) => (
  <span style={{
    background: 'rgba(0, 129, 178, 0.3)',
    color: color,
    padding: isMobile ? '3px 8px' : '5px 10px',
    borderRadius: 6,
    fontSize: isMobile ? '0.75rem' : '0.85rem',
    fontWeight: 'bold',
    border: '1px solid rgba(0, 129, 178, 0.5)',
  }}>{children}</span>
);

const RewardBadge = ({ children, positive, isMobile }) => (
  <span style={{
    background: positive ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
    color: positive ? '#2ecc71' : '#e74c3c',
    padding: isMobile ? '3px 8px' : '5px 10px',
    borderRadius: 6,
    fontSize: isMobile ? '0.75rem' : '0.85rem',
    fontWeight: '500',
    border: `1px solid ${positive ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`,
  }}>{children}</span>
);

const statsList = ['Force', 'Endurance', 'Intelligence', 'Beauté', 'Santé', 'Spiritualité', 'Compétences Tech', 'Argent', 'Famille'];

// --- Composant Principal ---

export default function QuestsErrors({
  stats = {},
  quests = { quotidienne: [], secondaire: [], principale: [] },
  errors = [],
  setStats,
  setQuests,
  setErrors,
  setValidatedHistory,
  generalLevel = 1
}) {
  const [tab, setTab] = useState('quotidienne');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTypes, setFilterTypes] = useState([]);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const tabDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target)) {
        setIsTabDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tabDropdownRef]);

  const handleSubmit = (item, cat, isError) => {
    if (isError) {
      if (editing !== null) setErrors(es => es.map((e, i) => i === editing ? item : e));
      else setErrors(es => [...es, item]);
    } else {
      if (editing !== null) setQuests(qs => ({ ...qs, [cat]: qs[cat].map((q, i) => i === editing ? item : q) }));
      else setQuests(qs => ({
        ...qs,
        [cat]: [...(qs[cat] || []), item]
      }));
    }
    setShowForm(false);
    setEditing(null);
    if (editing !== null) {
      toast.success('Modification enregistrée !');
    }
  };

  const handleDelete = (cat, i, isError) => {
    if (isError) setErrors(es => es.filter((_, j) => j !== i));
    else setQuests(qs => ({ ...qs, [cat]: qs[cat].filter((_, j) => j !== i) }));
    toast.success('Élément supprimé.');
  };

  const handleValidate = (cat, i, isError) => {
    if (isError) {
      const e = errors[i];
      setStats(st => {
        const c = { ...st };
        Object.entries(e.penalty)
          .forEach(([s, x]) => c[s] = Math.max(0, (c[s] || 0) - Math.abs(x)));
        return c;
      });
      setValidatedHistory(h => [...h, { ...JSON.parse(JSON.stringify(e)), date: new Date().toLocaleDateString(), generalLevel }]);
      toast.error('Erreur validée. Pénalités appliquées.');
      // Les erreurs restent dans la liste, donc pas de suppression ici.
    } else {
      const q = quests[cat][i];
      let totalXpGained = 0;
      setStats(st => {
        const c = { ...st };
        Object.entries(q.rewards)
          .forEach(([s, x]) => {
            if (typeof x === 'number' && !isNaN(x)) {
              c[s] = (typeof c[s] === 'number' && !isNaN(c[s]) ? c[s] : 0) + x;
              totalXpGained += x;
            }
          });
        return c;
      });
      setValidatedHistory(h => [...h, { ...JSON.parse(JSON.stringify(q)), date: new Date().toLocaleDateString(), generalLevel }]);
      toast.success(`Quête validée ! +${totalXpGained} XP`);
      // On supprime la quête UNIQUEMENT si elle est secondaire ou principale
      if (cat === 'secondaire' || cat === 'principale') {
        setQuests(qs => ({ ...qs, [cat]: qs[cat].filter((_, j) => j !== i) }));
      }
    }
  };

  const list = tab === 'erreurs' ? (errors || []) : (quests?.[tab] || []);
  const filtered = list.filter(item => {
    const matchSearch = searchTerm === '' ||
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Ancienne logique de filtrage (ET) restaurée
    const matchTypes = filterTypes.length === 0 || 
      (item.types && filterTypes.every(t => item.types.includes(t)));

    return matchSearch && matchTypes;
  });

  const TABS = {
    quotidienne: 'Quêtes Quotidiennes',
    erreurs: 'Erreurs',
    secondaire: 'Quêtes Secondaires',
    principale: 'Quêtes Principales',
  };

  // --- Fonction dédiée à la gestion des styles de la carte ---
  const getCardStyles = (isMobile, isError, hasDescription) => {
    // Styles de base (Desktop)
    const styles = {
      card: {
        background: isError ? 'rgba(139, 0, 0, 0.05)' : '#1a1a1a',
        border: isError ? '1px solid #5c1a1a' : '1px solid #2a2a2a',
        padding: '20px 24px',
      },
      topSection: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      },
      infoWrapper: {
        flex: 1,
        minWidth: 0,
        paddingRight: '120px', // Espace pour les boutons icônes
      },
      title: {
        fontFamily: "'Rajdhani', sans-serif",
        marginTop: 0,
        marginBottom: hasDescription ? 4 : 0,
        textTransform: 'uppercase',
        fontSize: '1.5rem',
        letterSpacing: '1px',
        fontWeight: '700',
        color: 'white',
        wordBreak: 'break-word',
      },
      description: {
        color: '#aaa',
        margin: 0,
        fontSize: '0.95rem',
        wordBreak: 'break-word',
      },
      actions: {
        position: 'absolute',
        top: '20px',
        right: '24px',
        display: 'flex',
        gap: '12px',
      },
      bottomSection: {
        display: 'flex',
        flexDirection: 'row',
        gap: 24,
        alignItems: 'flex-start',
      },
    };

    // Surcharge des styles pour la vue Mobile
    if (isMobile) {
      styles.card.padding = '16px';
      styles.infoWrapper.paddingRight = '100px'; // Espace ajusté pour mobile
      styles.actions.top = '16px';
      styles.actions.right = '16px';
      styles.actions.gap = '8px';
      styles.title.fontSize = '1.2rem';
      styles.description.fontSize = '0.85rem';
      styles.bottomSection.flexDirection = 'column';
      styles.bottomSection.gap = 16;
    }

    return styles;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '20px auto', padding: isMobile ? '0 16px' : '0 20px', color: '#EAEAEA' }}>
      <h1 style={{ fontFamily: "'ZCOOL XiaoWei', serif", textAlign: 'center', fontSize: isMobile ? '2rem' : '2.8rem', marginBottom: 30, fontWeight: 'normal' }}>
        Steel Ball Run
      </h1>

      {/* Barre d'onglets et bouton de création (maintenant responsive) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2a2a', marginBottom: 24 }}>
        {isMobile ? (
          <div ref={tabDropdownRef} style={{ position: 'relative', flex: 1, marginRight: 8 }}>
            <button
              onClick={() => setIsTabDropdownOpen(v => !v)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1f1f1f',
                border: '1px solid #444',
                borderRadius: 6,
                color: '#EAEAEA',
                fontSize: '1rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{TABS[tab]}</span>
              <span style={{ transform: isTabDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>
            {isTabDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: 8,
                padding: '8px',
                marginTop: 4,
                zIndex: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}>
                {Object.entries(TABS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTab(key);
                      setShowForm(false);
                      setEditing(null);
                      setSearchTerm('');
                      setFilterTypes([]);
                      setIsTabDropdownOpen(false);
                    }}
                    onMouseEnter={e => { if (tab !== key) e.currentTarget.style.background = '#3c3c3c'; }}
                    onMouseLeave={e => { if (tab !== key) e.currentTarget.style.background = 'none'; }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 12px',
                      background: tab === key ? '#1E90FF' : 'none',
                      border: 'none',
                      borderRadius: 4,
                      color: tab === key ? 'white' : '#EAEAEA',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'background 0.2s ease-in-out',
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex' }}>
            {Object.entries(TABS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setShowForm(false); setEditing(null); setSearchTerm(''); setFilterTypes([]); }}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  background: 'none',
                  color: tab === key ? '#1E90FF' : '#aaa',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  borderBottom: tab === key ? '3px solid #1E90FF' : '3px solid transparent',
                  marginBottom: -1,
                }}
              >
                {value}
              </button>
            ))}
          </div>
        )}
        <Button 
          variant="primary" 
          onClick={() => { setShowForm(true); setEditing(null); }}
          style={isMobile ? { padding: '12px 16px', fontSize: '1.2rem' } : {}}
        >
          {isMobile ? '+' : (tab === 'erreurs' ? '+ Créer Erreur' : '+ Créer Quête')}
        </Button>
      </div>

      {/* Formulaire (conditionnel) */}
      {showForm && (
        tab === 'erreurs'
          ? <ErrorForm onSubmit={e => handleSubmit(e, tab, true)} onCancel={() => setShowForm(false)} initial={editing !== null ? errors[editing] : undefined} />
          : <QuestForm onSubmit={q => handleSubmit(q, tab, false)} onCancel={() => setShowForm(false)} initial={editing !== null ? quests[tab][editing] : undefined} />
      )}

      {/* Filtres et Liste */}
      {!showForm && (
        <>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Rechercher</Label>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
                <Input
                  placeholder=""
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ padding: '10px 14px', fontSize: '0.9rem', flex: 1 }}
                />
                <div style={{ position: 'relative', display: 'flex' }}>
                  <Button 
                    onClick={() => setFilterVisible(v => !v)}
                    style={{ padding: '8px 10px' }}
                    title="Filtrer par type"
                  >
                    <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}>&#9776;</span>
                  </Button>
                  {isFilterVisible && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: 8,
                      padding: 16,
                      marginTop: 8,
                      zIndex: 10,
                      width: 280,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px 12px',
                    }}>
                      {statsList.map(s => (
                        <label 
                          key={s} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            transition: 'background 0.2s ease-in-out',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#3c3c3c'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={filterTypes.includes(s)}
                            onChange={() => setFilterTypes(ft =>
                              ft.includes(s) ? ft.filter(t => t !== s) : [...ft, s]
                            )}
                            style={{ accentColor: '#00BFFF', marginRight: 8, width: 16, height: 16, cursor: 'pointer' }}
                          />
                          <span style={{ color: '#EAEAEA', fontSize: '0.9rem' }}>{s}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Liste des quêtes/erreurs */}
          {filtered.map((item, i) => {
            const isError = tab === 'erreurs';
            // On récupère tous les styles nécessaires depuis notre fonction dédiée
            const styles = getCardStyles(isMobile, isError, !!item.description);

            const iconButtonStyle = {
              padding: 0,
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: 1,
              width: isMobile ? '32px' : '36px',
              height: isMobile ? '32px' : '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            };

            return (
              <Card key={i} style={styles.card}>
                {/* Boutons d'action en icônes */}
                <div style={styles.actions}>
                  <Button variant="validate" onClick={() => handleValidate(tab, i, isError)} style={iconButtonStyle} title="Valider">✓</Button>
                  <Button variant="modify" onClick={() => { setEditing(i); setShowForm(true); }} style={iconButtonStyle} title="Modifier">✎</Button>
                  <Button variant="danger" onClick={() => handleDelete(tab, i, isError)} style={iconButtonStyle} title="Supprimer">×</Button>
                </div>

                <div style={styles.topSection}>
                  {/* Titre et Description */}
                  <div style={styles.infoWrapper}>
                    <h3 style={styles.title}>{item.title}</h3>
                    {item.description && <p style={styles.description}>{item.description}</p>}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '16px 0' }} />

                <div style={styles.bottomSection}>
                  {!isError && item.rewards && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: '0.8rem', color: '#888' }}>RÉCOMPENSES:</strong>
                      {Object.entries(item.rewards)
                        .filter(([_, x]) => typeof x === 'number' && !isNaN(x) && x !== 0)
                        .map(([s, x]) => <RewardBadge key={s} positive={x > 0} isMobile={isMobile}>{`${s} ${x > 0 ? '+' : ''}${x}`}</RewardBadge>)}
                    </div>
                  )}

                  {isError && item.penalty && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: '0.8rem', color: '#888' }}>PÉNALITÉS:</strong>
                      {Object.entries(item.penalty)
                        .filter(([_, x]) => typeof x === 'number' && !isNaN(x) && x !== 0)
                        .map(([s, x]) => <RewardBadge key={s} positive={x < 0} isMobile={isMobile}>{`${s} ${x < 0 ? '-' : ''}${Math.abs(x)}`}</RewardBadge>)}
                    </div>
                  )}

                  {item.types && item.types.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: '0.8rem', color: '#888' }}>TYPES:</strong>
                      {item.types.map(t => <StatBadge key={t} isMobile={isMobile}>{t}</StatBadge>)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}


// --- Formulaires (inchangés dans leur logique, mais bénéficieront des composants stylisés) ---

function QuestForm({ onSubmit, onCancel, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [rewards, setRewards] = useState(initial?.rewards || {});
  const [types, setTypes] = useState(initial?.types || []);
  const [durationText, setDurationText] = useState(initial?.durationText || initial?.duration?.value || '');

  const changeType = s => setTypes(ts => ts.includes(s) ? ts.filter(t => t !== s) : [...ts, s]);
  const changeReward = (s, v) => setRewards(r => ({ ...r, [s]: v }));

  const handleSave = () => {
    onSubmit({ title, description: desc, rewards, types, durationText });
  };

  return (
    <Card>
      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 0, marginBottom: 24 }}>
        {initial ? 'Modifier la Quête' : 'Nouvelle Quête'}
      </h3>
      
      <div style={{marginBottom: 16}}><Label>Titre</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div style={{marginBottom: 16}}><Label>Description</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} /></div>
      <div style={{marginBottom: 24}}><Label>Durée</Label><Input type="text" value={durationText} onChange={e => setDurationText(e.target.value)} /></div>
      
      <div style={{marginBottom: 24}}>
        <Label>Types</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', margin: '4px 0' }}>
          {statsList.map(s => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type='checkbox' checked={types.includes(s)} onChange={() => changeType(s)} style={{ accentColor: '#00BFFF', marginRight: 8 }} />
              <span style={{ color: '#EAEAEA' }}>{s}</span>
            </label>
          ))}
        </div>
      </div>
      
      <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 0, marginBottom: 16, borderTop: '1px solid #2a2a2a', paddingTop: 24 }}>
        Récompenses
      </h4>
      {statsList.map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <Label style={{ width: 150, marginBottom: 0, textTransform: 'none', color: '#EAEAEA' }}>{s}</Label>
          <Input
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            placeholder='0'
            value={rewards[s] === undefined ? '' : rewards[s]}
            onChange={e => {
              const v = e.target.value;
              changeReward(s, v === '' ? undefined : Number(v));
            }}
          />
        </div>
      ))}
      
      <div style={{marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12}}>
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button variant="primary" onClick={handleSave}>Enregistrer</Button>
      </div>
    </Card>
  );
}

function ErrorForm({ onSubmit, onCancel, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [penalty, setPenalty] = useState(initial?.penalty || {});
  const [types, setTypes] = useState(initial?.types || []);
  const changeType = s => setTypes(ts => ts.includes(s) ? ts.filter(t=>t!==s) : [...ts, s]);
  const changePenalty = (s, v) => setPenalty(p => ({ ...p, [s]: v }));

  return (
    <Card style={{background:'rgba(139, 0, 0, 0.1)', border: '1px solid #5c1a1a'}}>
      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 0, marginBottom: 24 }}>
        {initial ? "Modifier l'Erreur" : 'Nouvelle Erreur'}
      </h3>
      
      <div style={{marginBottom: 16}}><Label>Titre</Label><Input value={title} onChange={e=>setTitle(e.target.value)} /></div>
      <div style={{marginBottom: 16}}><Label>Description</Label><Textarea value={desc} onChange={e=>setDesc(e.target.value)} /></div>
      
      <div style={{marginBottom: 24}}>
        <Label>Types</Label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', margin:'4px 0' }}>
          {statsList.map(s=>(
            <label key={s} style={{display:'flex',alignItems:'center', cursor: 'pointer'}}>
              <input type="checkbox" checked={types.includes(s)} onChange={()=>changeType(s)} style={{ accentColor: '#c0392b', marginRight: 8 }} />
              <span style={{color: '#EAEAEA'}}>{s}</span>
            </label>
          ))}
        </div>
      </div>
      
      <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 0, marginBottom: 16, borderTop: '1px solid #5c1a1a', paddingTop: 24 }}>
        Pénalités
      </h4>
      {statsList.map(s => (
        <div key={s} style={{display:'flex',alignItems:'center', marginBottom: 8}}>
          <Label style={{ width: 150, marginBottom: 0, textTransform: 'none', color: '#EAEAEA' }}>{s}</Label>
          <Input
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            placeholder='0'
            value={penalty[s] === undefined ? '' : penalty[s]}
            onChange={e => {
              const v = e.target.value;
              changePenalty(s, v === '' ? undefined : Number(v));
            }}
          />
        </div>
      ))}
      
      <div style={{marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12}}>
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button variant="danger" onClick={()=>onSubmit({title,description:desc,penalty,types})}>Enregistrer</Button>
      </div>
    </Card>
  );
}