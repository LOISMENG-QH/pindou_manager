import { useState } from 'react';
import { db } from '../db';
import { Pattern, Bead, BeadUsage } from '../types';
import { Plus, X, Trash2, Image as ImageIcon, Search, ArrowRight, CheckSquare } from 'lucide-react';
import { PRESET_COLORS } from '../utils';
import './PatternManager.css';

interface Props {
  patterns: Pattern[];
  beads: Bead[];
}

export default function PatternManager({ patterns, beads }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [viewingPattern, setViewingPattern] = useState<Pattern | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analyzingPattern, setAnalyzingPattern] = useState<Pattern | null>(null);
  const [beadUsageInput, setBeadUsageInput] = useState<BeadUsage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'planned' | 'completed'>('planned');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageData: '',
    thumbnail: ''
  });

  // 按状态和搜索过滤
  const filteredPatterns = patterns
    .filter(p => p.status === activeTab)
    .filter(p => 
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      const thumbnail = await createThumbnail(imageData);
      setFormData({ ...formData, imageData, thumbnail });
    };
    reader.readAsDataURL(file);
  };

  const createThumbnail = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.patterns.add({
      ...formData,
      status: 'planned', // 默认为"想拼"
      createdAt: new Date(),
      updatedAt: new Date()
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', imageData: '', thumbnail: '' });
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个图纸吗？')) {
      await db.patterns.delete(id);
    }
  };

  // 移动图纸到另一个分区
  const movePattern = async (pattern: Pattern, newStatus: 'planned' | 'completed') => {
    await db.patterns.update(pattern.id!, {
      status: newStatus,
      updatedAt: new Date()
    });
  };

  // 打开分析模态框
  const openAnalysisModal = (pattern: Pattern) => {
    setAnalyzingPattern(pattern);
    // 初始化豆子使用记录
    if (pattern.beadsUsed && pattern.beadsUsed.length > 0) {
      setBeadUsageInput(pattern.beadsUsed);
    } else {
      setBeadUsageInput([{ colorCode: '', colorName: '', quantity: 0 }]);
    }
    setShowAnalysisModal(true);
  };

  // 添加豆子使用记录行
  const addBeadUsageRow = () => {
    setBeadUsageInput([...beadUsageInput, { colorCode: '', colorName: '', quantity: 0 }]);
  };

  // 更新豆子使用记录
  const updateBeadUsage = (index: number, field: keyof BeadUsage, value: string | number) => {
    const updated = [...beadUsageInput];
    updated[index] = { ...updated[index], [field]: value };
    
    // 如果更新的是色号，自动填充颜色名称
    if (field === 'colorCode' && typeof value === 'string') {
      const preset = PRESET_COLORS.find(c => c.colorCode === value);
      if (preset) {
        updated[index].colorName = preset.colorName;
      }
    }
    
    setBeadUsageInput(updated);
  };

  // 删除豆子使用记录行
  const removeBeadUsageRow = (index: number) => {
    setBeadUsageInput(beadUsageInput.filter((_, i) => i !== index));
  };

  // 保存分析结果并扣除库存
  const saveAnalysis = async () => {
    if (!analyzingPattern) return;
    
    // 过滤掉空记录
    const validUsages = beadUsageInput.filter(u => u.colorCode && u.quantity > 0);
    
    if (validUsages.length === 0) {
      alert('请至少添加一个豆子使用记录');
      return;
    }
    
    // 确认扣除库存
    const message = `确定要扣除以下库存吗？\n\n${validUsages.map(u => 
      `${u.colorCode} ${u.colorName}: ${u.quantity}颗`
    ).join('\n')}`;
    
    if (!confirm(message)) return;
    
    // 扣除库存
    for (const usage of validUsages) {
      const bead = beads.find(b => b.colorCode === usage.colorCode);
      if (bead) {
        const newQuantity = Math.max(0, bead.quantity - usage.quantity);
        await db.beads.update(bead.id!, {
          quantity: newQuantity,
          updatedAt: new Date()
        });
      }
    }
    
    // 保存分析记录
    await db.patterns.update(analyzingPattern.id!, {
      beadsUsed: validUsages,
      analyzed: true,
      updatedAt: new Date()
    });
    
    setShowAnalysisModal(false);
    setAnalyzingPattern(null);
    setBeadUsageInput([]);
    alert('库存已更新！');
  };

  return (
    <div className="pattern-manager">
      <div className="manager-header">
        <h2>图纸管理</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          添加图纸
        </button>
      </div>

      {/* 搜索栏 */}
      {patterns.length > 0 && (
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="搜索图纸名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-main"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* 分区标签 */}
      <div className="pattern-tabs">
        <button
          className={`pattern-tab ${activeTab === 'planned' ? 'active' : ''}`}
          onClick={() => setActiveTab('planned')}
        >
          <ImageIcon size={18} />
          想拼 ({patterns.filter(p => p.status === 'planned').length})
        </button>
        <button
          className={`pattern-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CheckSquare size={18} />
          已拼 ({patterns.filter(p => p.status === 'completed').length})
        </button>
      </div>

      {/* 图纸网格 */}
      {filteredPatterns.length === 0 ? (
        <div className="empty-state">
          <ImageIcon size={48} />
          <p>
            {searchTerm 
              ? '没有找到匹配的图纸' 
              : activeTab === 'planned' 
                ? '还没有添加想拼的图纸' 
                : '还没有完成的作品'
            }
          </p>
          {!searchTerm && <p>点击"添加图纸"开始收集你的图纸</p>}
        </div>
      ) : (
        <div className="pattern-grid">
          {filteredPatterns.map((pattern) => (
            <div key={pattern.id} className="pattern-card">
              <div 
                className="pattern-thumbnail" 
                onClick={() => setViewingPattern(pattern)}
              >
                <img src={pattern.thumbnail} alt={pattern.name} />
                <div className="pattern-overlay">
                  <span>点击查看大图</span>
                </div>
              </div>
              
              <div className="pattern-info">
                <h3>{pattern.name}</h3>
                {pattern.description && (
                  <p className="description">{pattern.description}</p>
                )}
                
                {/* 分析标记 */}
                {pattern.analyzed && (
                  <div className="analyzed-badge">
                    <CheckSquare size={14} />
                    已记录用量
                  </div>
                )}
                
                <div className="pattern-actions-row">
                  {/* 移动到另一分区 */}
                  <button
                    className="btn-move"
                    onClick={() => movePattern(pattern, pattern.status === 'planned' ? 'completed' : 'planned')}
                    title={pattern.status === 'planned' ? '移至已拼' : '移回想拼'}
                  >
                    <ArrowRight size={16} />
                    {pattern.status === 'planned' ? '已拼' : '想拼'}
                  </button>
                  
                  {/* 库存分析（仅已拼区） */}
                  {pattern.status === 'completed' && (
                    <button
                      className="btn-analyze"
                      onClick={() => openAnalysisModal(pattern)}
                      title="记录用量并扣除库存"
                    >
                      <CheckSquare size={16} />
                      {pattern.analyzed ? '修改用量' : '记录用量'}
                    </button>
                  )}
                  
                  {/* 删除 */}
                  <button
                    className="btn-delete-small"
                    onClick={() => handleDelete(pattern.id!)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加图纸模态框 */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>添加图纸</h3>
              <button className="btn-close" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div 
                className="upload-area" 
                onClick={() => document.getElementById('imageUpload')?.click()}
              >
                {formData.imageData ? (
                  <img src={formData.thumbnail} alt="预览" />
                ) : (
                  <>
                    <ImageIcon size={48} />
                    <p>点击上传图纸</p>
                    <p className="hint">支持 JPG, PNG, GIF, WebP</p>
                  </>
                )}
              </div>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                required
              />
              
              <input
                type="text"
                placeholder="图纸名称 *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <textarea
                placeholder="描述（选填）"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              
              <div className="modal-actions">
                <button type="submit" className="btn-primary">添加</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 查看大图模态框 */}
      {viewingPattern && (
        <div className="modal-overlay" onClick={() => setViewingPattern(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewingPattern.name}</h3>
              <button className="btn-close" onClick={() => setViewingPattern(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="pattern-view">
              <img src={viewingPattern.imageData} alt={viewingPattern.name} />
              {viewingPattern.description && (
                <p className="description">{viewingPattern.description}</p>
              )}
              
              {/* 显示用量记录 */}
              {viewingPattern.beadsUsed && viewingPattern.beadsUsed.length > 0 && (
                <div className="beads-used-summary">
                  <h4>豆子用量</h4>
                  <div className="usage-list">
                    {viewingPattern.beadsUsed.map((usage, idx) => (
                      <div key={idx} className="usage-item">
                        <span className="usage-code">{usage.colorCode}</span>
                        <span className="usage-name">{usage.colorName}</span>
                        <span className="usage-qty">{usage.quantity}颗</span>
                      </div>
                    ))}
                  </div>
                  <div className="usage-total">
                    总计：{viewingPattern.beadsUsed.reduce((sum, u) => sum + u.quantity, 0)}颗
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 库存分析模态框 */}
      {showAnalysisModal && analyzingPattern && (
        <div className="modal-overlay" onClick={() => setShowAnalysisModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>记录豆子用量</h3>
              <button className="btn-close" onClick={() => setShowAnalysisModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="analysis-form">
              <p className="analysis-hint">
                📝 记录本图纸使用的豆子色号和数量，系统会自动从库存中扣除
              </p>
              
              <div className="bead-usage-list">
                {beadUsageInput.map((usage, index) => (
                  <div key={index} className="bead-usage-row">
                    <input
                      type="text"
                      placeholder="色号 (如: A1)"
                      value={usage.colorCode}
                      onChange={(e) => updateBeadUsage(index, 'colorCode', e.target.value)}
                      className="input-code"
                    />
                    <input
                      type="text"
                      placeholder="颜色名称"
                      value={usage.colorName}
                      onChange={(e) => updateBeadUsage(index, 'colorName', e.target.value)}
                      className="input-name"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="数量"
                      value={usage.quantity || ''}
                      onChange={(e) => updateBeadUsage(index, 'quantity', Number(e.target.value))}
                      className="input-qty"
                    />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeBeadUsageRow(index)}
                      disabled={beadUsageInput.length === 1}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                className="btn-add-row"
                onClick={addBeadUsageRow}
              >
                <Plus size={16} />
                添加色号
              </button>
              
              <div className="modal-actions">
                <button className="btn-primary" onClick={saveAnalysis}>
                  <CheckSquare size={18} />
                  保存并扣除库存
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowAnalysisModal(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
