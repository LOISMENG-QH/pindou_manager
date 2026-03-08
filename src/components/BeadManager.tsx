import { useState, useEffect } from 'react';
import { api } from '../api';
import type { Bead } from '../api';
import { Plus, Edit2, Trash2, AlertTriangle, Save, X, Palette, Search } from 'lucide-react';
import { PRESET_COLORS } from '../utils';
import './BeadManager.css';

interface Props {
  beads: Bead[];
  onUpdate: () => void;
}

export default function BeadManager({ beads, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const lowStockBeads = beads.filter(b => b.quantity <= b.alertThreshold);

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

  const getColorHex = (colorCode: string): string => {
    const preset = PRESET_COLORS.find(c => c.colorCode === colorCode);
    return preset?.hex || '#6b7280';
  };

  const getTextColor = (hex: string): string => {
    if (!hex || hex.length < 7) return '#ffffff';
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#ffffff';
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const filteredColors = PRESET_COLORS.filter(color => 
    searchTerm === '' || 
    color.colorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    color.colorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBeads = beads.filter(bead =>
    beadSearchTerm === '' ||
    bead.colorCode.toLowerCase().includes(beadSearchTerm.toLowerCase()) ||
    bead.colorName.toLowerCase().includes(beadSearchTerm.toLowerCase())
  );

  const sortedBeads = [...filteredBeads].sort((a, b) => {
    const aLetter = a.colorCode.match(/[A-Z]+/)?.[0] || '';
    const aNumber = parseInt(a.colorCode.match(/\d+/)?.[0] || '0');
    const bLetter = b.colorCode.match(/[A-Z]+/)?.[0] || '';
    const bNumber = parseInt(b.colorCode.match(/\d+/)?.[0] || '0');

    if (aLetter !== bLetter) {
      return aLetter.localeCompare(bLetter);
    }
    return aNumber - bNumber;
  });

  const groupedBeads = sortedBeads.reduce((acc, bead) => {
    const series = bead.colorCode.match(/[A-Z]+/)?.[0] || 'Other';
    if (!acc[series]) acc[series] = [];
    acc[series].push(bead);
    return acc;
  }, {} as Record<string, Bead[]>);

  const handleSave = async () => {
    if (!formData.colorCode || !formData.quantity) {
      alert('请填写色号和数量');
      return;
    }

    const bead = {
      colorCode: formData.colorCode,
      colorName: formData.colorName,
      quantity: parseInt(formData.quantity),
      alertThreshold: globalAlertThreshold,
    };

    try {
      if (editingId) {
        await api.updateBead(editingId, bead);
      } else {
        await api.createBead(bead);
      }
      await onUpdate();
      resetForm();
    } catch (error: any) {
      alert(error.message || '操作失败');
    }
  };

  const handleEdit = (bead: Bead) => {
    setFormData({
      colorCode: bead.colorCode,
      colorName: bead.colorName,
      quantity: bead.quantity.toString(),
    });
    setEditingId(bead.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个色号吗？')) {
      try {
        await api.deleteBead(id);
        await onUpdate();
      } catch (error: any) {
        alert(error.message || '删除失败');
      }
    }
  };

  const handleAdjustQuantity = async (bead: Bead, delta: number) => {
    const newQuantity = Math.max(0, bead.quantity + delta);
    try {
      await api.updateBead(bead.id, { quantity: newQuantity });
      await onUpdate();
    } catch (error: any) {
      alert(error.message || '更新失败');
    }
  };

  const handleSelectColor = (color: typeof PRESET_COLORS[0]) => {
    setFormData(prev => ({
      ...prev,
      colorCode: color.colorCode,
      colorName: color.colorName,
    }));
    setSearchTerm('');
    setShowColorPicker(false);
  };

  const handleBatchAdd = async () => {
    const selectedCodes = prompt('请输入要批量添加的色号（用逗号分隔），例如：A1,A2,B1');
    if (!selectedCodes) return;

    const codes = selectedCodes.split(',').map(c => c.trim().toUpperCase());
    const validColors = PRESET_COLORS.filter(c => codes.includes(c.colorCode));

    if (validColors.length === 0) {
      alert('没有找到有效的色号');
      return;
    }

    let added = 0;
    for (const color of validColors) {
      try {
        const existing = beads.find(b => b.colorCode === color.colorCode);
        if (existing) {
          await api.updateBead(existing.id, {
            quantity: existing.quantity + 100
          });
        } else {
          await api.createBead({
            colorCode: color.colorCode,
            colorName: color.colorName,
            quantity: 100,
            alertThreshold: globalAlertThreshold,
          });
        }
        added++;
      } catch (error) {
        console.error(`添加 ${color.colorCode} 失败:`, error);
      }
    }

    await onUpdate();
    alert(`成功添加/更新 ${added} 个色号`);
  };

  const seriesNames: Record<string, string> = {
    'A': 'A系列',
    'B': 'B系列',
    'C': 'C系列',
    'D': 'D系列',
    'E': 'E系列',
    'F': 'F系列',
    'G': 'G系列',
    'H': 'H系列',
    'M': 'M系列',
  };

  return (
    <div className="bead-manager">
      <div className="manager-header">
        <h2>
          <Palette size={24} />
          豆子管理
          <span className="count-badge">{beads.length} 种</span>
        </h2>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
          >
            ⚙️ 全局设置
          </button>
          <button className="btn-secondary" onClick={handleBatchAdd}>
            📦 批量添加
          </button>
          <button className="btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={18} />
            添加豆子
          </button>
        </div>
      </div>

      {lowStockBeads.length > 0 && (
        <div className="low-stock-alert">
          <AlertTriangle size={20} />
          <span>{lowStockBeads.length} 个色号库存不足</span>
        </div>
      )}

      {showGlobalSettings && (
        <div className="global-settings">
          <label>
            全局低库存阈值：
            <input
              type="number"
              value={globalAlertThreshold}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setGlobalAlertThreshold(val);
                localStorage.setItem('globalAlertThreshold', val.toString());
              }}
              min="0"
            />
          </label>
          <small>新添加的豆子将使用此阈值</small>
        </div>
      )}

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="搜索色号或名称..."
          value={beadSearchTerm}
          onChange={(e) => setBeadSearchTerm(e.target.value)}
        />
      </div>

      {isAdding && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? '编辑豆子' : '添加豆子'}</h3>
              <button className="btn-icon" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>色号</label>
              <div className="color-code-input">
                <input
                  type="text"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value.toUpperCase() })}
                  placeholder="如: A1, F7"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette size={18} />
                  选择
                </button>
              </div>
            </div>

            {showColorPicker && (
              <div className="color-picker-panel">
                <div className="search-bar">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="搜索色号..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="color-grid">
                  {filteredColors.map(color => (
                    <div
                      key={color.colorCode}
                      className="color-option"
                      onClick={() => handleSelectColor(color)}
                      style={{ backgroundColor: color.hex, color: getTextColor(color.hex) }}
                    >
                      <div className="color-code">{color.colorCode}</div>
                      <div className="color-name">{color.colorName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>颜色名称</label>
              <input
                type="text"
                value={formData.colorName}
                onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                placeholder="如: 淡黄, 黑色"
              />
            </div>

            <div className="form-group">
              <label>数量</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="100"
                min="0"
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={resetForm}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSave}>
                <Save size={18} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="beads-list">
        {Object.entries(groupedBeads).map(([series, seriesBeads]) => (
          <div key={series} className="series-group">
            <h3 className="series-header">
              {seriesNames[series] || series} ({seriesBeads.length})
            </h3>
            <div className="bead-cards">
              {seriesBeads.map(bead => {
                const bgColor = getColorHex(bead.colorCode);
                const textColor = getTextColor(bgColor);
                const isLowStock = bead.quantity <= bead.alertThreshold;
                const isUnknown = bgColor === '#6b7280';

                return (
                  <div
                    key={bead.id}
                    className={`bead-card ${isLowStock ? 'low-stock' : ''} ${isUnknown ? 'unknown-color' : ''}`}
                    style={{ backgroundColor: bgColor, color: textColor }}
                  >
                    {isUnknown && <div className="unknown-badge">?</div>}
                    {isLowStock && (
                      <div className="low-stock-badge">
                        <AlertTriangle size={14} />
                      </div>
                    )}
                    <div className="bead-code">{bead.colorCode}</div>
                    <div className="bead-name">{bead.colorName}</div>
                    <div className="bead-quantity">{bead.quantity}</div>
                    
                    <div className="bead-actions">
                      <button
                        className="btn-adjust"
                        onClick={() => handleAdjustQuantity(bead, -10)}
                        title="减少10"
                      >
                        -10
                      </button>
                      <button
                        className="btn-adjust"
                        onClick={() => handleAdjustQuantity(bead, -1)}
                        title="减少1"
                      >
                        -1
                      </button>
                      <button
                        className="btn-adjust"
                        onClick={() => handleAdjustQuantity(bead, 1)}
                        title="增加1"
                      >
                        +1
                      </button>
                      <button
                        className="btn-adjust"
                        onClick={() => handleAdjustQuantity(bead, 10)}
                        title="增加10"
                      >
                        +10
                      </button>
                    </div>

                    <div className="bead-card-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(bead)}
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(bead.id)}
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

      {beads.length === 0 && (
        <div className="empty-state">
          <Palette size={48} />
          <p>还没有添加豆子</p>
          <button className="btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={18} />
            添加第一个豆子
          </button>
        </div>
      )}
    </div>
  );
}
