export interface Filament {
  _id?: string;
  _rev?: string;
  filament: string;
  material: string;
  color?: string;
  price?: number;
  used_weight: number;
  total_weight: number;
  calc_weight?: number;
  location?: string;
  comments?: string;
}

export interface ManageFilamentProps {
  data?: Filament;
  db: PouchDB.Database | null;
}
