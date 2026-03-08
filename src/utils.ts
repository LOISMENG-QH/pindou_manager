// 常用拼豆色号库
export const PRESET_COLORS = [
  // Hama 常用色
  { colorCode: 'H01', colorName: '白色', hex: '#FFFFFF' },
  { colorCode: 'H02', colorName: '奶油色', hex: '#FFF5E1' },
  { colorCode: 'H03', colorName: '黄色', hex: '#FFD700' },
  { colorCode: 'H04', colorName: '橙色', hex: '#FF8C00' },
  { colorCode: 'H05', colorName: '红色', hex: '#DC143C' },
  { colorCode: 'H06', colorName: '粉红色', hex: '#FF69B4' },
  { colorCode: 'H07', colorName: '紫色', hex: '#9370DB' },
  { colorCode: 'H08', colorName: '蓝色', hex: '#1E90FF' },
  { colorCode: 'H09', colorName: '浅蓝色', hex: '#87CEEB' },
  { colorCode: 'H10', colorName: '绿色', hex: '#32CD32' },
  { colorCode: 'H11', colorName: '浅绿色', hex: '#90EE90' },
  { colorCode: 'H12', colorName: '棕色', hex: '#8B4513' },
  { colorCode: 'H17', colorName: '灰色', hex: '#808080' },
  { colorCode: 'H18', colorName: '黑色', hex: '#000000' },
  { colorCode: 'H20', colorName: '深红色', hex: '#8B0000' },
  { colorCode: 'H21', colorName: '玫瑰红', hex: '#C71585' },
  { colorCode: 'H22', colorName: '天蓝色', hex: '#00BFFF' },
  { colorCode: 'H26', colorName: '深绿色', hex: '#006400' },
  { colorCode: 'H27', colorName: '米黄色', hex: '#F5DEB3' },
  { colorCode: 'H28', colorName: '深棕色', hex: '#654321' },
  
  // Perler 常用色
  { colorCode: 'P01', colorName: 'Perler 白色', hex: '#FAFAFA' },
  { colorCode: 'P02', colorName: 'Perler 黑色', hex: '#1A1A1A' },
  { colorCode: 'P03', colorName: 'Perler 红色', hex: '#E31E24' },
  { colorCode: 'P04', colorName: 'Perler 蓝色', hex: '#0057A8' },
  { colorCode: 'P05', colorName: 'Perler 黄色', hex: '#FFD635' },
  { colorCode: 'P06', colorName: 'Perler 绿色', hex: '#00A651' },
  { colorCode: 'P07', colorName: 'Perler 橙色', hex: '#FF8200' },
  { colorCode: 'P08', colorName: 'Perler 粉色', hex: '#FF98C8' },
  { colorCode: 'P09', colorName: 'Perler 紫色', hex: '#8B4FA0' },
  { colorCode: 'P10', colorName: 'Perler 棕色', hex: '#A05F47' },
];

// 导出数据
export async function exportData(db: any) {
  const beads = await db.beads.toArray();
  const patterns = await db.patterns.toArray();
  
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    beads,
    patterns
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pindou-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 导入数据
export async function importData(db: any, file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.version || !data.beads || !data.patterns) {
      return { success: false, message: '文件格式不正确' };
    }
    
    // 导入豆子数据
    for (const bead of data.beads) {
      delete bead.id; // 删除旧 ID，让数据库自动生成
      await db.beads.add(bead);
    }
    
    // 导入图纸数据
    for (const pattern of data.patterns) {
      delete pattern.id;
      await db.patterns.add(pattern);
    }
    
    return { 
      success: true, 
      message: `成功导入 ${data.beads.length} 个色号和 ${data.patterns.length} 个图纸` 
    };
  } catch (error) {
    return { success: false, message: '导入失败：' + (error as Error).message };
  }
}

// 清空所有数据
export async function clearAllData(db: any) {
  await db.beads.clear();
  await db.patterns.clear();
}
