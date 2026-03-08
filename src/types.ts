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
  beadsUsed?: { colorCode: string; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}
