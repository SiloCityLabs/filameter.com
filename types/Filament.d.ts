export type Filament = {
  ID: number;
  Filament: string;
  Material: string;
  Used_Weight: number;
  Location: string;
  Comments: string;
};

export interface ManageFilamentProps {
  data?: Filament;
}
