// 数据适配器 - 统一 IndexedDB 和 API 的接口

import { db } from './db';
import { api, type Bead as ApiBead, type Pattern as ApiPattern } from './api';
import type { Bead, Pattern } from './types';

// 配置
export const USE_CLOUD = true; // 改为 false 使用本地 IndexedDB

// Bead 适配器
export class BeadAdapter {
  static async getAll(): Promise<Bead[]> {
    if (USE_CLOUD) {
      const apiBeads = await api.getBeads();
      return apiBeads.map(b => ({
        id: parseInt(b.id) || 0,
        colorCode: b.colorCode,
        colorName: b.colorName,
        quantity: b.quantity,
        alertThreshold: b.alertThreshold
      }));
    } else {
      return await db.beads.toArray();
    }
  }

  static async add(bead: Omit<Bead, 'id'>): Promise<void> {
    if (USE_CLOUD) {
      await api.createBead(bead);
    } else {
      await db.beads.add(bead as Bead);
    }
  }

  static async update(id: number, changes: Partial<Bead>): Promise<void> {
    if (USE_CLOUD) {
      // 需要找到对应的云端 ID
      const beads = await api.getBeads();
      const cloudBead = beads[id] || beads.find((_, idx) => idx === id);
      if (cloudBead) {
        await api.updateBead(cloudBead.id, changes);
      }
    } else {
      await db.beads.update(id, changes);
    }
  }

  static async delete(id: number): Promise<void> {
    if (USE_CLOUD) {
      const beads = await api.getBeads();
      const cloudBead = beads[id] || beads.find((_, idx) => idx === id);
      if (cloudBead) {
        await api.deleteBead(cloudBead.id);
      }
    } else {
      await db.beads.delete(id);
    }
  }

  static async bulkAdd(beads: Omit<Bead, 'id'>[]): Promise<void> {
    if (USE_CLOUD) {
      for (const bead of beads) {
        await api.createBead(bead);
      }
    } else {
      await db.beads.bulkAdd(beads as Bead[]);
    }
  }
}

// Pattern 适配器
export class PatternAdapter {
  static async getAll(): Promise<Pattern[]> {
    if (USE_CLOUD) {
      const apiPatterns = await api.getPatterns();
      return apiPatterns.map(p => ({
        id: parseInt(p.id) || 0,
        name: p.name,
        imageUrl: p.imageUrl,
        thumbnailUrl: p.thumbnailUrl,
        description: p.description,
        status: p.status,
        beadsUsed: p.beadsUsed,
        analyzed: p.analyzed
      }));
    } else {
      return await db.patterns.toArray();
    }
  }

  static async add(pattern: Omit<Pattern, 'id'>): Promise<void> {
    if (USE_CLOUD) {
      await api.createPattern(pattern);
    } else {
      await db.patterns.add(pattern as Pattern);
    }
  }

  static async update(id: number, changes: Partial<Pattern>): Promise<void> {
    if (USE_CLOUD) {
      const patterns = await api.getPatterns();
      const cloudPattern = patterns[id] || patterns.find((_, idx) => idx === id);
      if (cloudPattern) {
        await api.updatePattern(cloudPattern.id, changes);
      }
    } else {
      await db.patterns.update(id, changes);
    }
  }

  static async delete(id: number): Promise<void> {
    if (USE_CLOUD) {
      const patterns = await api.getPatterns();
      const cloudPattern = patterns[id] || patterns.find((_, idx) => idx === id);
      if (cloudPattern) {
        await api.deletePattern(cloudPattern.id);
      }
    } else {
      await db.patterns.delete(id);
    }
  }
}
