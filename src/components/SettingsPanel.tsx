import { useState, useRef } from 'react';
import { db } from '../db';
import { Download, Upload, Trash2, Palette, Database, AlertCircle } from 'lucide-react';
import { exportData, importData, clearAllData, PRESET_COLORS } from '../utils';
import { THEMES, applyTheme } from '../theme';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      const theme = JSON.parse(saved);
      return Object.keys(THEMES).find(key => THEMES[key].primary === theme.primary) || 'default';
    }
    return 'default';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = async () => {
    try {
      await exportData(db);
      showMessage('success', '数据导出成功！');
    } catch (error) {
      showMessage('error', '导出失败：' + (error as Error).message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const result = await importData(db, file);
    setImporting(false);

    if (result.success) {
      showMessage('success', result.message);
    } else {
      showMessage('error', result.message);
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    if (!confirm('⚠️ 确定要清空所有数据吗？此操作不可恢复！\n\n建议先导出备份数据。')) {
      return;
    }

    if (!confirm('最后确认：真的要删除所有豆子和图纸数据吗？')) {
      return;
    }

    try {
      await clearAllData(db);
      showMessage('success', '所有数据已清空');
      // 刷新页面
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      showMessage('error', '清空失败：' + (error as Error).message);
    }
  };

  const handleThemeChange = (themeKey: string) => {
    setSelectedTheme(themeKey);
    applyTheme(THEMES[themeKey]);
    showMessage('success', `已切换到${THEMES[themeKey].name}主题`);
  };

  const handleAddPresetColors = async () => {
    if (!confirm(`要添加 ${PRESET_COLORS.length} 个预设色号到你的豆子库吗？`)) {
      return;
    }

    try {
      let added = 0;
      for (const preset of PRESET_COLORS) {
        // 检查是否已存在
        const existing = await db.beads.where('colorCode').equals(preset.colorCode).first();
        if (!existing) {
          await db.beads.add({
            colorCode: preset.colorCode,
            colorName: preset.colorName,
            quantity: 0,
            alertThreshold: 10,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          added++;
        }
      }
      showMessage('success', `成功添加 ${added} 个色号（${PRESET_COLORS.length - added} 个已存在）`);
    } catch (error) {
      showMessage('error', '添加失败：' + (error as Error).message);
    }
  };

  return (
    <div className="settings-panel">
      <h2>设置</h2>

      {message && (
        <div className={`message message-${message.type}`}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* 数据管理 */}
      <section className="settings-section">
        <div className="section-header">
          <Database size={20} />
          <h3>数据管理</h3>
        </div>

        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>导出数据</h4>
              <p>将所有豆子和图纸数据导出为 JSON 文件</p>
            </div>
            <button className="btn-primary" onClick={handleExport}>
              <Download size={18} />
              导出备份
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>导入数据</h4>
              <p>从 JSON 文件恢复数据（不会删除现有数据）</p>
            </div>
            <button className="btn-primary" onClick={handleImportClick} disabled={importing}>
              <Upload size={18} />
              {importing ? '导入中...' : '导入数据'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>清空数据</h4>
              <p className="warning-text">⚠️ 删除所有豆子和图纸，此操作不可恢复</p>
            </div>
            <button className="btn-danger" onClick={handleClearData}>
              <Trash2 size={18} />
              清空所有数据
            </button>
          </div>
        </div>
      </section>

      {/* 主题设置 */}
      <section className="settings-section">
        <div className="section-header">
          <Palette size={20} />
          <h3>主题配置</h3>
        </div>

        <div className="theme-grid">
          {Object.entries(THEMES).map(([key, theme]) => (
            <div
              key={key}
              className={`theme-card ${selectedTheme === key ? 'active' : ''}`}
              onClick={() => handleThemeChange(key)}
            >
              <div className="theme-preview">
                <div className="preview-color" style={{ background: theme.primary }} />
                <div className="preview-color" style={{ background: theme.secondary }} />
                <div className="preview-color" style={{ background: theme.success }} />
              </div>
              <div className="theme-name">{theme.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 预设色号库 */}
      <section className="settings-section">
        <div className="section-header">
          <Palette size={20} />
          <h3>预设色号库</h3>
        </div>

        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>添加完整色号库</h4>
              <p>包含 {PRESET_COLORS.length} 个色号（A-H, M系列）</p>
            </div>
            <button className="btn-primary" onClick={handleAddPresetColors}>
              <Download size={18} />
              添加到豆子库
            </button>
          </div>
        </div>

        <div className="preset-colors-preview">
          <div className="series-info">
            <p>✨ 完整色号库包含：</p>
            <ul>
              <li>A系列 (A1-A26)：26个黄橙粉暖色系</li>
              <li>B系列 (B1-B32)：32个绿色系</li>
              <li>C系列 (C1-C29)：29个蓝青色系</li>
              <li>D系列 (D1-D26)：26个紫色系</li>
              <li>E系列 (E1-E24)：24个粉红色系</li>
              <li>F系列 (F1-F25)：25个红棕色系</li>
              <li>G系列 (G1-G21)：21个棕褐色系</li>
              <li>H系列 (H1-H23)：23个黑白灰系</li>
              <li>M系列 (M1-M15)：15个特殊灰色系</li>
            </ul>
          </div>
          <div className="preset-colors-grid">
            {PRESET_COLORS.slice(0, 12).map((color, idx) => (
              <div key={idx} className="color-chip">
                <div className="chip-color" style={{ background: color.hex }} />
                <div className="chip-info">
                  <div className="chip-code">{color.colorCode}</div>
                  <div className="chip-name">{color.colorName}</div>
                </div>
              </div>
            ))}
            {PRESET_COLORS.length > 12 && (
              <div className="color-chip more">
                <div>还有 {PRESET_COLORS.length - 12} 个...</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 关于 */}
      <section className="settings-section">
        <h3>关于</h3>
        <div className="about-info">
          <p><strong>拼豆管理系统</strong> v1.0</p>
          <p>数据存储在浏览器本地（IndexedDB）</p>
          <p>建议定期导出备份重要数据</p>
          <p className="mt-2">
            <a href="https://github.com/LOISMENG-QH/pindou_manager" target="_blank" rel="noopener noreferrer">
              查看源码 →
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
