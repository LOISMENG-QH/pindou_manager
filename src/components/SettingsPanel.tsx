import { useState, useRef } from 'react';
import { db } from '../db';
import { Download, Upload, Trash2, Palette, Database, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { exportData, importData, clearAllData, PRESET_COLORS } from '../utils';
import { THEMES, applyTheme } from '../theme';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showColorLibrary, setShowColorLibrary] = useState(false);
  const [showBatchAddModal, setShowBatchAddModal] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState(100);
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

  // 批量添加色号
  const handleBatchAdd = async () => {
    if (batchQuantity < 0) {
      alert('数量不能为负数');
      return;
    }

    try {
      let added = 0;
      let updated = 0;
      const globalThreshold = Number(localStorage.getItem('globalAlertThreshold') || 10);

      for (const preset of PRESET_COLORS) {
        // 检查是否已存在
        const existing = await db.beads.where('colorCode').equals(preset.colorCode).first();
        
        if (existing) {
          // 已存在，增加库存
          await db.beads.update(existing.id!, {
            quantity: existing.quantity + batchQuantity,
            updatedAt: new Date()
          });
          updated++;
        } else {
          // 不存在，添加新色号
          await db.beads.add({
            colorCode: preset.colorCode,
            colorName: preset.colorName,
            quantity: batchQuantity,
            alertThreshold: globalThreshold,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          added++;
        }
      }

      setShowBatchAddModal(false);
      showMessage('success', `成功！新增 ${added} 个色号，更新 ${updated} 个色号的库存`);
    } catch (error) {
      showMessage('error', '添加失败：' + (error as Error).message);
    }
  };

  // 按系列分组
  const colorsByGroup: { [key: string]: typeof PRESET_COLORS } = {
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: [],
    G: [],
    H: [],
    M: []
  };

  PRESET_COLORS.forEach(color => {
    const series = color.colorCode.charAt(0);
    if (colorsByGroup[series]) {
      colorsByGroup[series].push(color);
    }
  });

  const seriesNames: { [key: string]: string } = {
    A: 'A系列 - 黄橙粉暖色系',
    B: 'B系列 - 绿色系',
    C: 'C系列 - 蓝青色系',
    D: 'D系列 - 紫色系',
    E: 'E系列 - 粉红色系',
    F: 'F系列 - 红棕色系',
    G: 'G系列 - 棕褐色系',
    H: 'H系列 - 黑白灰系',
    M: 'M系列 - 特殊灰色系'
  };

  return (
    <div className="settings-panel">
      <h2>设置</h2>

      {message && (
        <div className={`message message-${message.type}`}>
          <AlertCircle size={18} />
          {message.text}
        </div>
      )}

      {/* 主题切换 */}
      <section className="settings-section">
        <div className="section-header">
          <Palette size={20} />
          <h3>主题切换</h3>
        </div>
        <p className="section-desc">选择你喜欢的界面配色</p>
        <div className="theme-grid">
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              className={`theme-card ${selectedTheme === key ? 'active' : ''}`}
              onClick={() => handleThemeChange(key)}
            >
              <div className="theme-preview" style={{ background: theme.primary }}></div>
              <span className="theme-name">{theme.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 预设色号库 */}
      <section className="settings-section">
        <div className="section-header">
          <Palette size={20} />
          <h3>预设色号</h3>
        </div>
        <p className="section-desc">快速导入常用的拼豆色号系统到你的豆子库</p>
        
        {/* MARD 221色 */}
        <div className="preset-color-system">
          <div className="preset-header">
            <h4>MARD 221色</h4>
            <span className="preset-badge">推荐</span>
          </div>
          <p className="preset-desc">完整的拼豆色号系统 · A-H 和 M 系列 · 共221个色号</p>
          
          <button 
            className="btn-toggle-library"
            onClick={() => setShowColorLibrary(!showColorLibrary)}
          >
            {showColorLibrary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            {showColorLibrary ? '收起色号库' : '查看全部221色号'}
          </button>

          {showColorLibrary && (
            <div className="color-library-full">
              {Object.entries(colorsByGroup).map(([series, colors]) => (
                <div key={series} className="color-series-group">
                  <h4 className="series-title">{seriesNames[series]} ({colors.length}色)</h4>
                  <div className="color-grid-full">
                    {colors.map((color, idx) => (
                      <div key={idx} className="color-item-full">
                        <div 
                          className="color-swatch-full" 
                          style={{ background: color.hex }}
                          title={`${color.colorCode} - ${color.colorName}`}
                        />
                        <div className="color-label">
                          <span className="color-code-small">{color.colorCode}</span>
                          <span className="color-name-small">{color.colorName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button 
            className="btn-action btn-add-preset" 
            onClick={() => setShowBatchAddModal(true)}
          >
            <Palette size={18} />
            添加全部色号到豆子库
          </button>
        </div>
      </section>

      {/* 数据管理 */}
      <section className="settings-section">
        <div className="section-header">
          <Database size={20} />
          <h3>数据管理</h3>
        </div>
        <p className="section-desc">备份和恢复你的数据</p>
        
        <div className="action-buttons">
          <button className="btn-action" onClick={handleExport}>
            <Download size={18} />
            导出数据
          </button>
          
          <button className="btn-action" onClick={handleImportClick} disabled={importing}>
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
          
          <button className="btn-action btn-danger" onClick={handleClearData}>
            <Trash2 size={18} />
            清空所有数据
          </button>
        </div>
      </section>

      {/* 关于 */}
      <section className="settings-section">
        <div className="section-header">
          <AlertCircle size={20} />
          <h3>关于</h3>
        </div>
        <div className="about-info">
          <p><strong>拼豆豆</strong></p>
          <p>版本：1.0.0</p>
          <p>管理你的拼豆色号和图纸</p>
          <p className="github-link">
            <a href="https://github.com/LOISMENG-QH/pindou_manager" target="_blank" rel="noopener noreferrer">
              GitHub 仓库
            </a>
          </p>
        </div>
      </section>

      {/* 批量添加模态框 */}
      {showBatchAddModal && (
        <div className="modal-overlay" onClick={() => setShowBatchAddModal(false)}>
          <div className="batch-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>批量添加色号</h3>
              <button className="btn-close" onClick={() => setShowBatchAddModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="batch-hint">
                📦 将 MARD 221色全部添加到豆子库，您可以设置初始库存数量
              </p>
              
              <div className="quantity-input-group">
                <label>每个色号的初始数量：</label>
                <input
                  type="number"
                  min="0"
                  value={batchQuantity}
                  onChange={(e) => setBatchQuantity(Number(e.target.value))}
                  className="quantity-input-large"
                />
                <span className="unit">颗</span>
              </div>
              
              <div className="batch-info">
                <p>✓ 如果色号已存在：增加库存数量</p>
                <p>✓ 如果色号不存在：创建新色号</p>
                <p>✓ 共计 {PRESET_COLORS.length} 个色号</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleBatchAdd}>
                <Palette size={18} />
                确认添加
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => setShowBatchAddModal(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
