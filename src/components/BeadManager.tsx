import { useState, useEffect } from 'react';
import { db } from '../db';
import { Bead } from '../types';
import { Plus, Edit2, Trash2, AlertTriangle, Save, X, Palette, Search } from 'lucide-react';
import { PRESET_COLORS } from '../utils';
import './BeadManager.css';

interface Props {
  beads: Bead[];
  lowStockBeads: Bead[];
}

export default function BeadManager({ beads, lowStockBeads }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [globalAlertThreshold, setGlobalAlertThreshold] = useState(10);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [beadSearchTerm, setBeadSearchTerm] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState({
    colorCode: '',
    colorName: '',
    quantity: '',
  });

  // 加载全局低库存阈值
  useEffect(() => {
    const saved = localStorage.getItem('globalAlertThreshold');
    if (saved) {
      setGlobalAlertThreshold(Number(saved));
    }
  }, []);

  const resetForm = () => {
    setFormData({ colorCode: '', colorName: '', quantity: '' });
    setIsAdding(false);
    setEditingId(null);
    setSearchTerm('');
    setShowColorPicker(false);
  };

  // 获取色号对应的颜色
  const getColorHex = (colorCode: string): string => {
    const preset = PRESET_COLORS.find(c => c.colorCode === colorCode);
    return preset?.hex || '#e0e0e0';
  };

  // 计算文字颜色（基于背景亮度）
  const getTextColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // 搜索过滤色号库
  const filteredColors = PRESET_COLORS.filter(color => 
    searchTerm === '' || 
    color.colorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    color.colorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 搜索过滤豆子列表
  const filteredBeads = beads.filter(bead =>
    beadSearchTerm === '' ||
    bead.colorCode.toLowerCase().includes(beadSearchTerm.toLowerCase()) ||
    bead.colorName.toLowerCase().includes(beadSearchTerm.toLowerCase())
  );

  // 按色号排序
  const sortedBeads = [...filteredBeads].sort((a, b) => {
    // 提取字母和数字部分
    const matchA = a.colorCode.match(/([A-Z]+)(\d+)/i);
    const matchB = b.colorCode.match(/([A-Z]+)(\d+)/i);
    
    if (matchA && matchB) {
      // 先按字母排序
      if (matchA[1] !== matchB[1]) {
        return matchA[1].localeCompare(matchB[1]);
      }
      // 再按数字排序
      return parseInt(matchA[2]) - parseInt(matchB[2]);
    }
    
    // 如果格式不匹配，直接按字符串排序
    return a.colorCode.localeCompare(b.colorCode);
  });

  // 按系列分组豆子
  const groupedBeads: { [key: string]: Bead[] } = {};
  const seriesNames: { [key: string]: string } = {
    A: 'A系列 - 黄橙粉暖色系',
    B: 'B系列 - 绿色系',
    C: 'C系列 - 蓝青色系',
    D: 'D系列 - 紫色系',
    E: 'E系列 - 粉红色系',
    F: 'F系列 - 红棕色系',
    G: 'G系列 - 棕褐色系',
    H: 'H系列 - 黑白灰系',
    M: 'M系列 - 特殊灰色系',
  };

  sortedBeads.forEach(bead => {
    const series = bead.colorCode.charAt(0).toUpperCase();
    if (!groupedBeads[series]) {
      groupedBeads[series] = [];
    }
    groupedBeads[series].push(bead);
  });

  // 按字母顺序排序系列
  const sortedSeries = Object.keys(groupedBeads).sort((a, b) => {
    const order = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'];
    return order.indexOf(a) - order.indexOf(b);
  });

  // 选择色号库中的颜色
  const handleSelectPresetColor = (color: typeof PRESET_COLORS[0]) => {
    setFormData({
      ...formData,
      colorCode: color.colorCode,
      colorName: color.colorName
    });
    setShowColorPicker(false);
    setSearchTerm('');
  };

  // 当手动输入色号时，自动匹配颜色名称
  const handleColorCodeChange = (value: string) => {
    const matchedColor = PRESET_COLORS.find(c => c.colorCode === value);
    setFormData({
      ...formData,
      colorCode: value,
      colorName: matchedColor ? matchedColor.colorName : formData.colorName
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = formData.quantity === '' ? 0 : Number(formData.quantity);
    
    if (editingId) {
      await db.beads.update(editingId, {
        colorCode: formData.colorCode,
        colorName: formData.colorName,
        quantity: quantity,
        updatedAt: new Date()
      });
    } else {
      await db.beads.add({
        colorCode: formData.colorCode,
        colorName: formData.colorName,
        quantity: quantity,
        alertThreshold: globalAlertThreshold,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    resetForm();
  };

  const handleEdit = (bead: Bead) => {
    setFormData({
      colorCode: bead.colorCode,
      colorName: bead.colorName,
      quantity: String(bead.quantity),
    });
    setEditingId(bead.id!);
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个色号吗？')) {
      await db.beads.delete(id);
    }
  };

  const updateQuantity = async (id: number, delta: number) => {
    const bead = await db.beads.get(id);
    if (bead) {
      await db.beads.update(id, {
        quantity: Math.max(0, bead.quantity + delta),
        updatedAt: new Date()
      });
    }
  };

  // 应用全局低库存阈值到所有豆子
  const applyGlobalThreshold = async () => {
    if (!confirm(`确定要将所有色号的低库存提醒值设置为 ${globalAlertThreshold} 吗？`)) {
      return;
    }
    
    for (const bead of beads) {
      await db.beads.update(bead.id!, {
        alertThreshold: globalAlertThreshold,
        updatedAt: new Date()
      });
    }
    
    localStorage.setItem('globalAlertThreshold', String(globalAlertThreshold));
    setShowGlobalSettings(false);
    alert('已更新所有色号的低库存提醒值！');
  };

  return (
    <div className="bead-manager">
      <div className="manager-header">
        <h2>豆子库存</h2>
        <div className="header-actions">
          <button 
            className="btn-secondary" 
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
          >
            <AlertTriangle size={18} />
            全局设置
          </button>
          <button className="btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={18} />
            添加色号
          </button>
        </div>
      </div>

      {/* 全局低库存设置 */}
      {showGlobalSettings && (
        <div className="global-settings">
          <div className="setting-row">
            <label>全局低库存提醒值：</label>
            <input
              type="number"
              min="0"
              value={globalAlertThreshold}
              onChange={(e) => setGlobalAlertThreshold(Number(e.target.value))}
              className="threshold-input"
            />
            <button className="btn-primary" onClick={applyGlobalThreshold}>
              应用到所有色号
            </button>
            <button className="btn-secondary" onClick={() => setShowGlobalSettings(false)}>
              取消
            </button>
          </div>
          <p className="hint-text">提示：这会将所有现有色号的低库存提醒值统一设置为此数值，新添加的色号也会使用此值</p>
        </div>
      )}

      {lowStockBeads.length > 0 && (
        <div className="low-stock-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>库存不足提醒 ({lowStockBeads.length}个)</strong>
            <p>{lowStockBeads.map(b => `${b.colorCode} ${b.colorName}`).join('、')} 需要补货</p>
          </div>
        </div>
      )}

      {/* 搜索框 */}
      {!isAdding && !editingId && beads.length > 0 && (
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="搜索色号或颜色名称..."
            value={beadSearchTerm}
            onChange={(e) => setBeadSearchTerm(e.target.value)}
            className="search-input-main"
          />
          {beadSearchTerm && (
            <button className="clear-search" onClick={() => setBeadSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {(isAdding || editingId) && (
        <form className="bead-form" onSubmit={handleSubmit}>
          {/* 色号选择 */}
          <div className="form-section">
            <label className="form-label">色号 *</label>
            <div className="color-code-input-group">
              <input
                type="text"
                placeholder="输入色号或从色号库选择"
                value={formData.colorCode}
                onChange={(e) => handleColorCodeChange(e.target.value)}
                required
                className="color-code-input"
              />
              <button
                type="button"
                className="btn-color-picker"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Palette size={18} />
                选择色号库
              </button>
            </div>
            
            {/* 色号库选择器 */}
            {showColorPicker && (
              <div className="color-picker-dropdown">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="搜索色号或颜色名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="color-list">
                  {filteredColors.length > 0 ? (
                    filteredColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="color-item"
                        onClick={() => handleSelectPresetColor(color)}
                      >
                        <div 
                          className="color-swatch" 
                          style={{ background: color.hex }}
                        />
                        <div className="color-info">
                          <span className="color-code-badge">{color.colorCode}</span>
                          <span className="color-name">{color.colorName}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">没有找到匹配的色号</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 颜色名称 */}
          <div className="form-section">
            <label className="form-label">颜色名称 *</label>
            <input
              type="text"
              placeholder="颜色名称"
              value={formData.colorName}
              onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
              required
            />
          </div>
          
          {/* 数量 */}
          <div className="form-section">
            <label className="form-label">初始数量</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <Save size={18} />
              {editingId ? '保存修改' : '添加'}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X size={18} />
              取消
            </button>
          </div>
        </form>
      )}

      {!isAdding && !editingId && (
        <>
          {sortedBeads.length === 0 ? (
            <div className="empty-state">
              <Palette size={64} />
              <p>还没有添加任何色号</p>
              <p>点击"添加色号"开始管理你的拼豆库存</p>
            </div>
          ) : (
            <div className="bead-list-grouped">
              {sortedSeries.map(series => (
                <div key={series} className="bead-series-group">
                  <div className="series-header">
                    <h3 className="series-title">
                      {seriesNames[series] || `${series}系列`}
                    </h3>
                    <span className="series-count">
                      {groupedBeads[series].length} 个色号
                    </span>
                  </div>
                  <div className="bead-grid">
                    {groupedBeads[series].map((bead) => {
                      const bgColor = getColorHex(bead.colorCode);
                      const textColor = getTextColor(bgColor);
                      const isLowStock = bead.quantity <= bead.alertThreshold;
                      
                      return (
                        <div
                          key={bead.id}
                          className={`bead-card ${isLowStock ? 'low-stock' : ''}`}
                          style={{
                            background: bgColor,
                            color: textColor
                          }}
                        >
                          {isLowStock && (
                            <div className="low-stock-badge">
                              <AlertTriangle size={14} />
                            </div>
                          )}
                          <div className="bead-header">
                            <h3 style={{ color: textColor }}>{bead.colorCode}</h3>
                            <p style={{ color: textColor, opacity: 0.9 }}>{bead.colorName}</p>
                          </div>
                          <div className="bead-quantity" style={{ color: textColor }}>
                            <span className="quantity-value">{bead.quantity}</span>
                            <span className="quantity-unit">颗</span>
                          </div>
                          <div className="bead-actions">
                            <button
                              onClick={() => updateQuantity(bead.id!, -10)}
                              className="btn-adjust"
                              style={{
                                background: `rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'}, 0.2)`,
                                color: textColor
                              }}
                            >
                              -10
                            </button>
                            <button
                              onClick={() => updateQuantity(bead.id!, -1)}
                              className="btn-adjust"
                              style={{
                                background: `rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'}, 0.2)`,
                                color: textColor
                              }}
                            >
                              -1
                            </button>
                            <button
                              onClick={() => updateQuantity(bead.id!, 1)}
                              className="btn-adjust"
                              style={{
                                background: `rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'}, 0.2)`,
                                color: textColor
                              }}
                            >
                              +1
                            </button>
                            <button
                              onClick={() => updateQuantity(bead.id!, 10)}
                              className="btn-adjust"
                              style={{
                                background: `rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'}, 0.2)`,
                                color: textColor
                              }}
                            >
                              +10
                            </button>
                          </div>
                          <div className="bead-controls">
                            <button
                              onClick={() => handleEdit(bead)}
                              className="btn-icon"
                              style={{ color: textColor }}
                              title="编辑"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(bead.id!)}
                              className="btn-icon"
                              style={{ color: textColor }}
                              title="删除"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
