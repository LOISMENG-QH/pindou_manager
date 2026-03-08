import { useState, useEffect } from 'react';
import { AlertTriangle, Palette, Image, Settings, LogOut, RefreshCw } from 'lucide-react';
import { api } from '../api';
import type { User, Bead, Pattern } from '../api';
import BeadManager from './BeadManager';
import PatternManager from './PatternManager';
import SettingsPanel from './SettingsPanel';
import { loadTheme, applyTheme } from '../theme';
import '../App.css';
import './MainApp.css';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<'beads' | 'patterns' | 'settings'>('beads');
  const [beads, setBeads] = useState<Bead[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  useEffect(() => {
    // 加载主题
    const theme = loadTheme();
    applyTheme(theme);
    
    // 加载数据
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [beadsData, patternsData] = await Promise.all([
        api.getBeads(),
        api.getPatterns()
      ]);
      setBeads(beadsData);
      setPatterns(patternsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await loadData();
      alert('同步成功！');
    } catch (error) {
      alert('同步失败，请重试');
    } finally {
      setSyncing(false);
    }
  };

  const lowStockBeads = beads.filter(bead => bead.quantity <= bead.alertThreshold);

  if (loading) {
    return (
      <div className="app">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '20px',
          color: '#666'
        }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 拼豆豆</h1>
        
        <div className="header-actions">
          <div className="user-info">
            <span className="username">👤 {user.username || user.email}</span>
          </div>
          
          <button
            className="sync-button"
            onClick={handleSync}
            disabled={syncing}
            title="同步数据"
          >
            <RefreshCw size={18} className={syncing ? 'spinning' : ''} />
          </button>
          
          <button
            className="logout-button"
            onClick={onLogout}
            title="退出登录"
          >
            <LogOut size={18} />
          </button>
        </div>
        
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

      <main className="main-content">
        {activeTab === 'beads' && (
          <BeadManager beads={beads} onUpdate={loadData} />
        )}
        {activeTab === 'patterns' && (
          <PatternManager patterns={patterns} beads={beads} onUpdate={loadData} />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel onUpdate={loadData} />
        )}
      </main>
    </div>
  );
}

export default MainApp;
