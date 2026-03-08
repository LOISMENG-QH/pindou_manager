import Dexie, { Table } from 'dexie';
import { Bead, Pattern } from './types';

export class PindouDatabase extends Dexie {
  beads!: Table<Bead>;
  patterns!: Table<Pattern>;

  constructor() {
    super('PindouManager');
    this.version(1).stores({
      beads: '++id, colorCode, quantity, alertThreshold',
      patterns: '++id, name, createdAt'
    });
  }
}

export const db = new PindouDatabase();
