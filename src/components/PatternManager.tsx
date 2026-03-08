import { useState, useRef } from 'react';
import { db } from '../db';
import { Pattern, Bead } from '../types';
import { Plus, Trash2, Eye, X, Upload } from 'lucide-react';
import './PatternManager.css';

interface Props {
  patterns: Pattern[];
  beads?: Bead[];
}

export default function PatternManager({ patterns }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [viewingPattern, setViewingPattern] = useState<Pattern | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageData: '',
    thumbnail: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      
      // Create thumbnail
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const maxSize = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width / height) * maxSize;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, imageData, thumbnail }));
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await db.patterns.add({
      name: formData.name,
      description: formData.description,
      imageData: formData.imageData,
      thumbnail: formData.thumbnail,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    setFormData({ name: '', description: '', imageData: '', thumbnail: '' });
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个图纸吗？')) {
      await db.patterns.delete(id);
    }
  };

  return (
    <div className="pattern-manager">
      <div className="manager-header">
        <h2>图纸库</h2>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          添加图纸
        </button>
      </div>

      {isAdding && (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>添加新图纸</h3>
              <button className="btn-close" onClick={() => setIsAdding(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                {formData.thumbnail ? (
                  <img src={formData.thumbnail} alt="预览" />
                ) : (
                  <>
                    <Upload size={48} />
                    <p>点击上传图纸图片</p>
                    <p className="hint">支持 JPG、PNG 格式</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  required
                />
              </div>

              <input
                type="text"
                placeholder="图纸名称"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <textarea
                placeholder="描述（可选）"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />

              <div className="form-actions">
                <button type="submit" className="btn-primary">保存</button>
                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPattern && (
        <div className="modal-overlay" onClick={() => setViewingPattern(null)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
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
            </div>
          </div>
        </div>
      )}

      <div className="pattern-grid">
        {patterns.map(pattern => (
          <div key={pattern.id} className="pattern-card">
            <div className="pattern-thumbnail" onClick={() => setViewingPattern(pattern)}>
              <img src={pattern.thumbnail} alt={pattern.name} />
              <div className="pattern-overlay">
                <Eye size={24} />
              </div>
            </div>
            <div className="pattern-info">
              <h3>{pattern.name}</h3>
              {pattern.description && (
                <p className="description">{pattern.description}</p>
              )}
            </div>
            <button 
              className="btn-delete" 
              onClick={() => handleDelete(pattern.id!)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {patterns.length === 0 && (
        <div className="empty-state">
          <Upload size={48} />
          <p>还没有上传图纸</p>
          <p>点击"添加图纸"开始管理你的拼豆作品</p>
        </div>
      )}
    </div>
  );
}
