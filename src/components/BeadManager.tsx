import { useState } from 'react';
import { db } from '../db';
import { Bead } from '../types';
import { Plus, Edit2, Trash2, AlertTriangle, Save, X, Palette } from 'lucide-react';
import './BeadManager.css';

interface Props {
  beads: Bead[];
  lowStockBeads: Bead[];
}

export default function BeadManager({ beads, lowStockBeads }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    colorCode: '',
    colorName: '',
    quantity: 0,
    alertThreshold: 10
  });

  const resetForm = () => {
    setFormData({ colorCode: '', colorName: '', quantity: 0, alertThreshold: 10 });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await db.beads.update(editingId, {
        ...formData,
        updatedAt: new Date()
      });
    } else {
      await db.beads.add({
        ...formData,
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
      quantity: bead.quantity,
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

  return (
    <div className="bead-manager">
      <div className="manager-header">
        <h2>豆子库存</h2>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          添加色号
        </button>
      </div>

      {lowStockBeads.length > 0 && (
        <div className="low-stock-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>库存不足提醒</strong>
            <p>{lowStockBeads.map(b => `${b.colorName}(${b.colorCode})`).join('、')} 需要补货</p>
          </div>
        </div>
      )}

      {(isAdding || editingId) && (
        <form className="bead-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="色号 (如: H01)"
              value={formData.colorCode}
              onChange={e => setFormData({ ...formData, colorCode: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="颜色名称"
              value={formData.colorName}
              onChange={e => setFormData({ ...formData, colorName: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              placeholder="当前数量"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              min="0"
            />
            <input
              type="number"
              placeholder="提醒阈值"
              value={formData.alertThreshold}
              onChange={e => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <Save size={16} />
              {editingId ? '保存' : '添加'}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X size={16} />
              取消
            </button>
          </div>
        </form>
      )}

      <div className="bead-list">
        {beads.map(bead => (
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
              <div className="threshold-info">
                提醒阈值: {bead.alertThreshold}
              </div>
            </div>
            <div className="bead-actions">
              <button className="btn-icon" onClick={() => handleEdit(bead)}>
                <Edit2 size={16} />
              </button>
              <button className="btn-icon btn-danger" onClick={() => handleDelete(bead.id!)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {beads.length === 0 && (
        <div className="empty-state">
          <Palette size={48} />
          <p>还没有添加豆子色号</p>
          <p>点击"添加色号"开始管理你的豆子库存</p>
        </div>
      )}
    </div>
  );
}
