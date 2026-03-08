import { useState, useEffect } from 'react';
import { AlertTriangle, Palette, Image, Settings, LogOut, User as UserIcon, Cloud, CloudOff } from 'lucide-react';
import BeadManager from './components/BeadManager';
import PatternManager from './components/PatternManager';
import SettingsPanel from './components/SettingsPanel';
import AuthPage from './components/AuthPage';
import { loadTheme, applyTheme } from './theme';
import { api, TokenManager, type User, type Bead, type Pattern } from './api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'beads' | 'patterns' | 'settings'>('beads');
  const [user, setUser] = useState<User | null>(null);
  const [beads, setBeads] = useState<Bead[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [useCloudMode, setUseCloudMode] = useState(true); // 默认使用云端模式
  
  useEffect(() => {
    // 加载主题
    const theme = loadTheme();
    applyTheme(theme);
    
    // 检查是否已登录
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (TokenManager.isLoggedIn()) {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        await loadCloudData();
      } catch (error) {
        console.error('认证失败:', error);
        TokenManager.removeToken();
      }
    }
    setLoading(false);
  };

  const loadCloudData = async () => {
    setSyncing(true);
    setSyncError('');
    try {
      const [beadsData, patternsData] = await Promise.all([
        api.getBeads(),
        api.getPatterns()
      ]);
      setBeads(beadsData);
      setPatterns(patternsData);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : '加载数据失败');
      console.error('加载云端数据失败:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    await loadCloudData();
  };

  const handleLogout = () => {
    TokenManager.removeToken();
    setUser(null);
    setBeads([]);
    setPatterns([]);
  };

  const handleRefresh = async () => {
    if (user && useCloudMode) {
      await loadCloudData();
    }
  };

  // 实时同步：当数据变化时自动保存到云端
  const syncBeads = async (newBeads: Bead[]) => {
    setBeads(newBeads);
    // 云端模式下自动同步（这里可以添加防抖优化）
  };

  const syncPatterns = async (newPatterns: Pattern[]) => {
    setPatterns(newPatterns);
    // 云端模式下自动同步
  };

  const lowStockBeads = beads.filter(bead => bead.quantity <= bead.alertThreshold);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-primary)',
        color: 'white',
        fontSize: '18px'
      }}>
        加载中...
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 拼豆豆</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 同步状态 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--color-text-secondary)'
          }}>
            {syncing ? (
              <>
                <Cloud size={16} className="spin" />
                <span>同步中...</span>
              </>
            ) : syncError ? (
              <>
                <CloudOff size={16} style={{ color: '#f44' }} />
                <span style={{ color: '#f44' }}>同步失败</span>
              </>
            ) : (
              <>
                <Cloud size={16} style={{ color: '#4c8' }} />
                <span>已同步</span>
              </>
            )}
          </div>

          {/* 用户信息 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--color-secondary)',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <UserIcon size={16} />
            <span>{user.username}</span>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* 库存警告 */}
          {lowStockBeads.length > 0 && (
            <div className="alert-badge">
              <AlertTriangle size={16} />
              <span>{lowStockBeads.length} 个色号库存不足</span>
            </div>
          )}
        </div>
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

      {syncError && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '12px 20px',
          margin: '0 20px',
          borderRadius: '8px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{syncError}</span>
          <button
            onClick={handleRefresh}
            style={{
              background: '#c33',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      )}

      <main className="content">
        {activeTab === 'beads' && (
          <BeadManager
            beads={beads}
            lowStockBeads={lowStockBeads}
            api={api}
            onUpdate={loadCloudData}
          />
        )}
        {activeTab === 'patterns' && (
          <PatternManager
            patterns={patterns}
            beads={beads}
            api={api}
            onUpdate={loadCloudData}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel
            user={user}
            onRefresh={handleRefresh}
          />
        )}
      </main>
    </div>
  );
}

export default App;
