import { useState } from 'react';
import { api } from '../api';
import type { Pattern, Bead } from '../api';
import { Plus, Image as ImageIcon, Trash2, X, Upload } from 'lucide-react';
import './PatternManager.css';

interface Props {
  patterns: Pattern[];
  beads: Bead[];
  onUpdate: () => void;
}

export default function PatternManager({ patterns, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'planned' | 'completed'>('planned');
  const [isAdding, setIsAdding] = useState(false);
  const [viewingPattern, setViewingPattern] = useState<Pattern | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
  });

  const filteredPatterns = patterns.filter(p => p.status === activeTab);

  const resetForm = () => {
    setFormData({ name: '', description: '', imageUrl: '', thumbnailUrl: '' });
    setIsAdding(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        imageUrl: dataUrl,
        thumbnailUrl: dataUrl, // 简化处理，使用同一张图
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.imageUrl) {
      alert('请填写图纸名称并选择图片');
      return;
    }

    try {
      await api.createPattern({
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        thumbnailUrl: formData.thumbnailUrl,
        status: 'planned',
      });
      await onUpdate();
      resetForm();
    } catch (error: any) {
      alert(error.message || '添加失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个图纸吗？')) {
      try {
        await api.deletePattern(id);
        await onUpdate();
        setViewingPattern(null);
      } catch (error: any) {
        alert(error.message || '删除失败');
      }
    }
  };

  const handleToggleStatus = async (pattern: Pattern) => {
    try {
      const newStatus = pattern.status === 'planned' ? 'completed' : 'planned';
      await api.updatePattern(pattern.id, { status: newStatus });
      await onUpdate();
      setViewingPattern(null);
    } catch (error: any) {
      alert(error.message || '更新失败');
    }
  };

  return (
    <div className="pattern-manager">
      <div className="manager-header">
        <h2>
          <ImageIcon size={24} />
          图纸管理
          <span className="count-badge">{patterns.length} 个</span>
        </h2>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          添加图纸
        </button>
      </div>

      <div className="pattern-tabs">
        <button
          className={`tab ${activeTab === 'planned' ? 'active' : ''}`}
          onClick={() => setActiveTab('planned')}
        >
          想拼 ({patterns.filter(p => p.status === 'planned').length})
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          已拼 ({patterns.filter(p => p.status === 'completed').length})
        </button>
      </div>

      {isAdding && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>添加图纸</h3>
              <button className="btn-icon" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>图纸名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：樱花图案"
              />
            </div>

            <div className="form-group">
              <label>描述（可选）</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="记录一些备注信息..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>选择图片</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
              />
              {formData.imageUrl && (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="预览" />
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={resetForm}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSave}>
                <Upload size={18} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingPattern && (
        <div className="modal-overlay" onClick={() => setViewingPattern(null)}>
          <div className="modal-content pattern-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewingPattern.name}</h3>
              <button className="btn-icon" onClick={() => setViewingPattern(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="pattern-image">
              <img src={viewingPattern.imageUrl} alt={viewingPattern.name} />
            </div>

            {viewingPattern.description && (
              <div className="pattern-description">
                <p>{viewingPattern.description}</p>
              </div>
            )}

            {viewingPattern.beadsUsed && viewingPattern.beadsUsed.length > 0 && (
              <div className="beads-used">
                <h4>用豆记录</h4>
                <div className="used-list">
                  {viewingPattern.beadsUsed.map((usage, idx) => (
                    <div key={idx} className="used-item">
                      <span className="code">{usage.colorCode}</span>
                      <span className="name">{usage.colorName}</span>
                      <span className="qty">×{usage.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => handleToggleStatus(viewingPattern)}
              >
                {viewingPattern.status === 'planned' ? '标记完成' : '标记未完成'}
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(viewingPattern.id)}
              >
                <Trash2 size={18} />
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="patterns-grid">
        {filteredPatterns.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} />
            <p>{activeTab === 'planned' ? '还没有想拼的图纸' : '还没有完成的作品'}</p>
            <button className="btn-primary" onClick={() => setIsAdding(true)}>
              <Plus size={18} />
              添加图纸
            </button>
          </div>
        ) : (
          filteredPatterns.map(pattern => (
            <div key={pattern.id} className="pattern-card" onClick={() => setViewingPattern(pattern)}>
              <div className="pattern-thumbnail">
                <img src={pattern.thumbnailUrl || pattern.imageUrl} alt={pattern.name} />
                {pattern.status === 'completed' && (
                  <div className="completed-badge">✓ 已完成</div>
                )}
              </div>
              <div className="pattern-info">
                <h4>{pattern.name}</h4>
                {pattern.description && <p>{pattern.description}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
