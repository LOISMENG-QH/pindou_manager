export interface Bead {
  id?: number;
  colorCode: string;
  colorName: string;
  quantity: number;
  alertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pattern {
  id?: number;
  name: string;
  imageData: string; // base64
  thumbnail: string; // base64 thumbnail
  description?: string;
  status: 'planned' | 'completed'; // 想拼 | 已拼
  beadsUsed?: BeadUsage[]; // 使用的豆子记录
  analyzed?: boolean; // 是否已分析
  createdAt: Date;
  updatedAt: Date;
}

export interface BeadUsage {
  colorCode: string;
  colorName: string;
  quantity: number;
}
