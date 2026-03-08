import { Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { loadTheme, applyTheme, THEMES } from '../theme';
import './SettingsPanel.css';

interface Props {
  onUpdate: () => void;
}

export default function SettingsPanel(_props: Props) {
  const [currentTheme, setCurrentTheme] = useState<string>(() => String(loadTheme()));

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    applyTheme(theme as any);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className="settings-panel">
      <div className="manager-header">
        <h2>
          <SettingsIcon size={24} />
          设置
        </h2>
      </div>

      <div className="settings-section">
        <h3>主题设置</h3>
        <div className="theme-selector">
          {Object.keys(THEMES).map((theme) => {
            const themeKey = theme as keyof typeof THEMES;
            return (
              <button
                key={theme}
                className={`theme-option ${currentTheme === theme ? 'active' : ''}`}
                onClick={() => handleThemeChange(theme)}
                style={{
                  background: `linear-gradient(135deg, ${THEMES[themeKey].primary}, ${THEMES[themeKey].secondary})`
                }}
              >
                {theme === 'default' && '默认蓝'}
                {theme === 'pink' && '粉红色'}
                {theme === 'purple' && '紫罗兰'}
                {theme === 'green' && '清新绿'}
                {theme === 'orange' && '活力橙'}
                {theme === 'dark' && '暗黑模式'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="settings-section">
        <h3>关于</h3>
        <div className="about-info">
          <p><strong>拼豆豆管理系统</strong></p>
          <p>版本：2.0.0（云端版）</p>
          <p>一个现代化的拼豆管理工具</p>
          <p>支持多设备云端同步</p>
          <br />
          <p>GitHub: <a href="https://github.com/LOISMENG-QH/pindou_manager" target="_blank" rel="noopener noreferrer">LOISMENG-QH/pindou_manager</a></p>
        </div>
      </div>
    </div>
  );
}
