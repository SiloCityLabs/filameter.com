import PouchDB from 'pouchdb';

export interface UsageLog {
  id: string;
  date: string; // ISO string
  weight: number; // Weight used in grams
  printName?: string;
  status: 'success' | 'failure';
  notes?: string;
}

export type Filament = {
  _id?: string;
  _rev?: string;
  filament: string;
  material: string;
  brand?: string;
  color?: string;
  price?: number;
  used_weight: number;
  total_weight: number;
  calc_weight?: number;
  location?: string;
  comments?: string;
  usage_history?: UsageLog[];
};

export interface ManageFilamentProps {
  data?: Filament;
  db: PouchDB.Database | null;
}
