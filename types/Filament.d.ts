export type Filament = {
  _id?: string;
  _rev?: string;
  filament: string;
  material: string;
  used_weight?: number;
  location?: string;
  comments: string;
};

export interface ManageFilamentProps {
  data?: Filament;
}
