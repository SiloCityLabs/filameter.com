export type Filament = {
  id?: number;
  filament: string;
  material: string;
  used_weight: number;
  location: string;
  comments: string;
};

export interface ManageFilamentProps {
  data?: Filament;
}
