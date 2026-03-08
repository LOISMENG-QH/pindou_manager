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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState({
    colorCode: '',
    colorName: '',
    quantity: '',
    alertThreshold: 10
  });

  // 加载全局低库存阈值
  useEffect(() => {
    const saved = localStorage.getItem('globalAlertThreshold');
    if (saved) {
      setGlobalAlertThreshold(Number(saved));
    }
  }, []);

  const resetForm = () => {
    setFormData({ colorCode: '', colorName: '', quantity: '', alertThreshold: globalAlertThreshold });
    setIsAdding(false);
    setEditingId(null);
    setSearchTerm('');
    setShowColorPicker(false);
  };

  // 搜索过滤色号库
  const filteredColors = PRESET_COLORS.filter(color => 
    searchTerm === '' || 
    color.colorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    color.colorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      colorName: matchedColor ? matchedColor.colorName : value
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
        alertThreshold: formData.alertThreshold,
        updatedAt: new Date()
      });
    } else {
      await db.beads.add({
        colorCode: formData.colorCode,
        colorName: formData.colorName,
        quantity: quantity,
        alertThreshold: formData.alertThreshold,
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
      alertThreshold: bead.alertThreshold
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
          <p className="hint-text">提示：这会将所有现有色号的低库存提醒值统一设置为此数值</p>
        </div>
      )}

      {lowStockBeads.length > 0 && (
        <div className="low-stock-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>库存不足提醒 ({lowStockBeads.length}个)</strong>
            <p>{lowStockBeads.map(b => `${b.colorName}(${b.colorCode})`).join('、')} 需要补货</p>
          </div>
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
            <label className="form-label">颜色名称</label>
            <input
              type="text"
              placeholder="颜色名称（选择色号库会自动填充）"
              value={formData.colorName}
              onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
              className="form-input"
            />
          </div>

          {/* 数量 */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label">当前库存</label>
              <input
                type="number"
                min="0"
                placeholder="不填写默认为 0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="form-input"
              />
            </div>
            
            <div className="form-section">
              <label className="form-label">低库存提醒值</label>
              <input
                type="number"
                min="0"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: Number(e.target.value) })}
                className="form-input"
              />
            </div>
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

      {beads.length === 0 ? (
        <div className="empty-state">
          <Palette size={48} />
          <p>还没有添加任何色号</p>
          <p>点击"添加色号"开始管理你的拼豆库存</p>
        </div>
      ) : (
        <div className="bead-list">
          {beads.map((bead) => (
            <div 
              key={bead.id} 
              className={`bead-card ${bead.quantity <= bead.alertThreshold ? 'low-stock' : ''}`}
            >
              <div className="bead-info">
                <div className="bead-header">
                  <h3>{bead.colorName}</h3>
                  <span className="color-code">{bead.colorCode}</span>
                </div>
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(bead.id!, -1)}>-</button>
                  <span className="quantity">{bead.quantity}</span>
                  <button onClick={() => updateQuantity(bead.id!, 1)}>+</button>
                </div>
                <p className="threshold-info">低于 {bead.alertThreshold} 时提醒</p>
              </div>
              <div className="bead-actions">
                <button className="btn-icon" onClick={() => handleEdit(bead)}>
                  <Edit2 size={18} />
                </button>
                <button className="btn-icon btn-danger" onClick={() => handleDelete(bead.id!)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
