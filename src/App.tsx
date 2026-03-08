import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { AlertTriangle, Palette, Image, Settings } from 'lucide-react';
import BeadManager from './components/BeadManager';
import PatternManager from './components/PatternManager';
import SettingsPanel from './components/SettingsPanel';
import { loadTheme, applyTheme } from './theme';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'beads' | 'patterns' | 'settings'>('beads');
  
  useEffect(() => {
    // 加载主题
    const theme = loadTheme();
    applyTheme(theme);
  }, []);

  const beads = useLiveQuery(() => db.beads.toArray());
  const patterns = useLiveQuery(() => db.patterns.toArray());

  const lowStockBeads = beads?.filter(bead => bead.quantity <= bead.alertThreshold) || [];

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 拼豆豆</h1>
        {lowStockBeads.length > 0 && (
          <div className="alert-badge">
            <AlertTriangle size={16} />
            <span>{lowStockBeads.length} 个色号库存不足</span>
          </div>
        )}
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'beads' ? 'active' : ''}`}
          onClick={() => setActiveTab('beads')}
        >
          <Palette size={18} />
          豆子管理
        </button>
        <button
          className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          <Image size={18} />
          图纸管理
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          设置
        </button>
      </div>

      <main className="content">
        {activeTab === 'beads' && <BeadManager beads={beads || []} lowStockBeads={lowStockBeads} />}
        {activeTab === 'patterns' && <PatternManager patterns={patterns || []} beads={beads || []} />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}

export default App;
