import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMediaQuery } from './hooks/useMediaQuery';
import { statsList, xpThresholds, getStatLevel, levelTitles } from './utils/stats';

// --- Composants de carte stylisés ---
const DashboardCard = ({ children, style, isMobile }) => (
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

const StatCard = ({ title, value, description, isMobile }) => (
  <DashboardCard isMobile={isMobile}>
    <h4 style={{ margin: '0 0 4px 0', color: '#aaa', fontSize: isMobile ? '0.8rem' : '1rem', fontWeight: '500', textTransform: 'uppercase' }}>{title}</h4>
    <p style={{ margin: 0, fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '700', color: 'white' }}>{value}</p>
    {description && <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.75rem' }}>{description}</p>}
  </DashboardCard>
);

const formatYAxis = (tickItem) => {
  if (tickItem >= 1000000) return `${(tickItem / 1000000).toFixed(1)}M`;
  if (tickItem >= 1000) return `${Math.round(tickItem / 1000)}k`;
  return tickItem;
};

export default function AnalyticsDashboard({
  stats = {},
  quests = {},
  errors = [],
  validatedHistory = [],
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // --- Calculs des données (corrigés) ---
  const totalXP = statsList.reduce((sum, s) => sum + (stats[s] || 0), 0);
  const statLevels = statsList.map(s => getStatLevel(stats[s] || 0));
  const avgLevel = statLevels.reduce((a, b) => a + b, 0) / statLevels.length;
  const generalLevel = Math.floor(avgLevel);

  const remainingQuests = (quests.secondaire?.length || 0) + (quests.principale?.length || 0);
  const xpData = statsList.map(s => ({ stat: s, xp: stats[s] || 0 }));
  
  const typeCounts = {};
  Object.values(quests).flat().forEach(q => { (q.types || []).forEach(t => { typeCounts[t] = (typeCounts[t] || 0) + 1; }); });
  const pieData = Object.entries(typeCounts).map(([type, value]) => ({ name: type, value }));
  
  // Palette de couleurs thématique "Bleach" associée aux stats
  const COLORS = [
    '#E53935', // Force: Rouge (Sang des combats)
    '#424242', // Endurance: Gris sombre (Acier de Zangetsu)
    '#9C27B0', // Intelligence: Violet (Kido & Mayuri)
    '#FFFFFF', // Beauté: Blanc (Sode no Shirayuki de Rukia)
    '#4CAF50', // Santé: Vert (Santen Kesshun d'Orihime)
    '#5299F7', // Spiritualité: Bleu (Reiatsu & Getsuga Tensho)
    '#00E5FF', // Compétences Tech: Cyan (Techniques Quincy)
    '#FBC02D', // Argent: Or (Noblesse du Gotei 13)
    '#FF9800'  // Famille: Orange (Cheveux d'Ichigo, lien avec le monde humain)
  ];
  
  const nextTitleEntry = levelTitles.find(t => t.level > generalLevel);
  const nextTitle = nextTitleEntry ? nextTitleEntry.title : "Aucun";

  // Logique pour trouver les 3 stats les plus faibles
  const sortedStats = [...xpData].sort((a, b) => a.xp - b.xp);
  const weakestStats = sortedStats.slice(0, 3).map(s => s.stat);
  
  const validatedErrors = validatedHistory.filter(h => h.penalty);
  const lastQuests = validatedHistory.filter(h => h.rewards).slice(-5).reverse();
  const lastErrors = validatedErrors.slice(-5).reverse();

  return (
    <div style={{ maxWidth: 1200, margin: '20px auto', padding: isMobile ? '0 16px' : '0 20px' }}>
      <h1 style={{ fontFamily: "'ZCOOL XiaoWei', serif", textAlign: 'center', fontSize: isMobile ? '2rem' : '2.8rem', marginBottom: 30, fontWeight: 'normal', color: '#EAEAEA' }}>
        Tableau de Bord
      </h1>

      {/* Grille principale du tableau de bord (maintenant nativement responsive) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Cartes de statistiques clés */}
        <StatCard title="Niveau Général" value={generalLevel} isMobile={isMobile} />
        <StatCard title="XP Total" value={totalXP.toLocaleString()} isMobile={isMobile} />
        <StatCard title="Quêtes Restantes" value={remainingQuests} description="Principales & Secondaires" isMobile={isMobile} />
        <StatCard title="Erreurs Actives" value={errors.length} isMobile={isMobile} />

        {/* Graphique XP par Stat */}
        <DashboardCard style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <h3 style={{ marginTop: 0 }}>XP par Statistique</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={xpData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="stat" stroke="#888" angle={-45} textAnchor="end" height={70} interval={0} fontSize={isMobile ? "0.7rem" : "0.8rem"} />
              <YAxis stroke="#888" tickFormatter={formatYAxis} />
              <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #444' }} />
              <Bar dataKey="xp">
                {xpData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* Graphique Répartition */}
        <DashboardCard style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <h3 style={{ marginTop: 0 }}>Répartition des Types</h3>

          {/* Légende personnalisée pour mobile */}
          {isMobile && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginBottom: 16, justifyContent: 'center' }}>
              {pieData.map((entry) => {
                if (entry.value === 0) return null;
                const statIndex = statsList.indexOf(entry.name);
                const color = statIndex !== -1 ? COLORS[statIndex] : '#888';
                const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);
                const percent = totalValue > 0 ? (entry.value / totalValue * 100).toFixed(0) : 0;

                return (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, marginRight: 6 }}></span>
                    {entry.name} {percent}%
                  </div>
                );
              })}
            </div>
          )}

          <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
            <PieChart>
              <Pie 
                data={pieData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={isMobile ? 80 : 110} 
                labelLine={false} 
                label={isMobile ? false : ({ name, percent }) => {
                  if (percent === 0) return '';
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                fontSize={"0.9rem"}
              >
                {pieData.map((entry) => {
                  const statIndex = statsList.indexOf(entry.name);
                  const color = statIndex !== -1 ? COLORS[statIndex] : '#888'; // Fallback
                  return <Cell key={`cell-${entry.name}`} fill={color} />;
                })}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #444' }} />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* Objectifs */}
        <DashboardCard>
          <h3 style={{ marginTop: 0 }}>Objectifs Prioritaires</h3>
          <p><strong>Rang suivant :</strong> {nextTitle}</p>
          <p><strong>Stats à améliorer :</strong></p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {weakestStats.map(s => <span key={s} style={{ background: '#2a2a2a', padding: '4px 10px', borderRadius: 6, fontSize: '0.9rem' }}>{s}</span>)}
          </div>
        </DashboardCard>
        
        {/* Historique */}
        <DashboardCard style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <h3 style={{ marginTop: 0 }}>Historique Récent</h3>
          <div style={{ display: 'flex', gap: '24px', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginTop: 0, color: '#aaa' }}>Dernières quêtes validées</h4>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {lastQuests.length > 0 ? lastQuests.map((q, i) => <li key={i} style={{ marginBottom: 4 }}>{q.title} ({q.date})</li>) : <li>Aucune quête validée.</li>}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginTop: 0, color: '#aaa' }}>Dernières erreurs commises</h4>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {lastErrors.length > 0 ? lastErrors.map((e, i) => <li key={i} style={{ marginBottom: 4 }}>{e.title} ({e.date})</li>) : <li>Aucune erreur commise.</li>}
              </ul>
            </div>
          </div>
        </DashboardCard>

      </div>
    </div>
  );
}