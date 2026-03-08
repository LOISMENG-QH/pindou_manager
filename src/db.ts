import Dexie, { Table } from 'dexie';
import { Bead, Pattern } from './types';

export class PindouDatabase extends Dexie {
  beads!: Table<Bead>;
  patterns!: Table<Pattern>;

  constructor() {
    super('PindouManager');
    
    // 版本 1：初始数据库
    this.version(1).stores({
      beads: '++id, colorCode, quantity, alertThreshold',
      patterns: '++id, name, createdAt'
    });
    
    // 版本 2：添加 status 字段
    this.version(2).stores({
      beads: '++id, colorCode, quantity, alertThreshold',
      patterns: '++id, name, createdAt, status'
    }).upgrade(async (trans) => {
      // 为现有图纸添加默认 status
      const patterns = await trans.table('patterns').toArray();
      for (const pattern of patterns) {
        await trans.table('patterns').update(pattern.id!, {
          status: 'planned'
        });
      }
    });
  }
}

export const db = new PindouDatabase();
